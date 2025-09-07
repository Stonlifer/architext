import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FloorPlan, QuestionnaireAnswers, Room } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const pointSchema = {
    type: Type.OBJECT,
    properties: {
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER }
    },
    required: ['x', 'y']
};

const furnitureSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "Unique ID for the furniture item." },
        type: { type: Type.STRING, description: "Type of furniture, e.g., 'sofa', 'bed', 'dining_table'." },
        position: pointSchema,
        width: { type: Type.NUMBER },
        height: { type: Type.NUMBER },
        rotation: { type: Type.NUMBER, description: "Clockwise rotation in degrees." },
    },
    required: ['id', 'type', 'position', 'width', 'height', 'rotation']
};

const doorSchema = {
    type: Type.OBJECT,
    description: "A door on a wall segment defined by two consecutive polygon vertices.",
    properties: {
        wallStart: pointSchema,
        wallEnd: pointSchema,
    },
    required: ['wallStart', 'wallEnd']
};

const windowSchema = {
    type: Type.OBJECT,
    description: "A window on a wall segment defined by two consecutive polygon vertices.",
    properties: {
        wallStart: pointSchema,
        wallEnd: pointSchema,
    },
    required: ['wallStart', 'wallEnd']
};

const roomSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "Unique identifier for the room, e.g., 'room-1'." },
        name: { type: Type.STRING, description: "Descriptive name of the room, e.g., 'Master Bedroom'." },
        type: { type: Type.STRING, description: "Type of the room, e.g., 'Bedroom'." },
        polygon: {
            type: Type.ARRAY,
            description: "An array of {x, y} points defining the room's inner shape.",
            items: pointSchema,
        },
        labelPosition: {
            type: Type.OBJECT,
            description: "An {x, y} point for placing the room's label, usually near the center.",
            properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
            }
        },
        doors: { type: Type.ARRAY, description: "Doors belonging to this room.", items: doorSchema },
        windows: { type: Type.ARRAY, description: "Windows belonging to this room.", items: windowSchema },
        furniture: { type: Type.ARRAY, description: "Furniture inside this room.", items: furnitureSchema },
    },
    required: ['id', 'name', 'type', 'polygon', 'labelPosition', 'doors', 'windows', 'furniture']
};


const floorPlanSchema = {
    type: Type.OBJECT,
    properties: {
        totalWidth: { type: Type.NUMBER, description: "Total width of the entire floor plan canvas." },
        totalHeight: { type: Type.NUMBER, description: "Total height of the entire floor plan canvas." },
        wallThickness: { type: Type.NUMBER, description: "Global thickness for all walls. A good value is 0.8." },
        rooms: {
            type: Type.ARRAY,
            items: roomSchema
        }
    },
    required: ['totalWidth', 'totalHeight', 'wallThickness', 'rooms'],
};

const getSystemInstruction = () => `You are an expert AI architect specializing in creating detailed and professional floor plans.
- The output MUST be a valid JSON object that strictly follows the provided schema.
- Create a logical and functional layout.
- The origin (0,0) is the top-left corner. All coordinates must be positive.
- Room polygons define the inner boundary of the rooms. They should not overlap.
- For walls, use the specified 'wallThickness'.
- Doors should be placed on a wall segment shared between two rooms or a room and the exterior. 'wallStart' and 'wallEnd' for a door MUST exactly match two consecutive vertices of its room's polygon.
- Windows should be placed on exterior walls. 'wallStart' and 'wallEnd' for a window MUST exactly match two consecutive vertices of its room's polygon.
- Include essential and logically placed furniture for each room. Available furniture types are: 'sofa', 'armchair', 'bed', 'dining_table', 'chair', 'kitchen_counter', 'sink', 'stove', 'toilet', 'bathtub', 'shower', 'wardrobe', 'plant', 'desk', 'tv_stand', 'fridge', 'washing_machine', 'rug'.
- For stairs, create a room with type 'Stairs'.
- Do not include any text, notes, or explanations outside of the JSON object.
- When modifying a plan, maintain the existing room and furniture 'id' values where possible.
`;


export const generateInitialPlan = async (answers: QuestionnaireAnswers): Promise<FloorPlan> => {
    const prompt = `Generate a floor plan with the following requirements:
- Style: ${answers.style}
- Square Footage: ${answers.sqft} sq ft
- Bedrooms: ${answers.bedrooms}
- Bathrooms: ${answers.bathrooms}
- Stories: ${answers.stories}
- Features: ${answers.features.join(', ')}
- The total width and height should be roughly proportional to a standard house shape.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            systemInstruction: getSystemInstruction(),
            responseMimeType: "application/json",
            responseSchema: floorPlanSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse initial plan JSON:", jsonText, e);
        throw new Error("Received invalid floor plan data from AI.");
    }
};

export const modifyPlan = async (currentPlan: FloorPlan, request: string): Promise<FloorPlan> => {
    const prompt = `Modify the following floor plan based on the user's request.
Current Floor Plan JSON:
${JSON.stringify(currentPlan, null, 2)}

User Request: "${request}"

Return only the updated and complete Floor Plan JSON.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            systemInstruction: getSystemInstruction(),
            responseMimeType: "application/json",
            responseSchema: floorPlanSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse modified plan JSON:", jsonText, e);
        throw new Error("Received invalid floor plan data from AI.");
    }
};

export const generateRenderedView = async (floorplanImageBase64: string, plan: FloorPlan): Promise<string> => {
    const prompt = `
Here is the structural data for the floor plan in JSON format. Use this to understand the room types, dimensions, and layout:
${JSON.stringify(plan, null, 2)}

Based on the wireframe image and the JSON data, please perform the following:
1.  Fill each room with appropriate furniture, fixtures, and decor that match its designated type (e.g., beds in bedrooms, sofas in living rooms, appliances in kitchens).
2.  The final output should be ONLY the rendered image, matching the input wireframe's boundaries perfectly. Do not add any text or labels on the image.`;

    const imagePart = {
        inlineData: {
            mimeType: 'image/png',
            data: floorplanImageBase64,
        },
    };

    const textPart = {
        text: prompt,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [imagePart, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    
    throw new Error("Image generation failed to return an image.");
};