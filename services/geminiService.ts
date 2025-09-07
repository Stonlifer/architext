import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FloorPlan, QuestionnaireAnswers, Room } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const floorPlanSchema = {
    type: Type.OBJECT,
    properties: {
        totalWidth: { type: Type.NUMBER, description: "Total width of the entire floor plan canvas." },
        totalHeight: { type: Type.NUMBER, description: "Total height of the entire floor plan canvas." },
        rooms: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "Unique identifier for the room, e.g., 'room-1'." },
                    name: { type: Type.STRING, description: "Descriptive name of the room, e.g., 'Master Bedroom'." },
                    type: { type: Type.STRING, description: "Type of the room, e.g., 'Bedroom'." },
                    polygon: {
                        type: Type.ARRAY,
                        description: "An array of {x, y} points defining the room's shape.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                x: { type: Type.NUMBER },
                                y: { type: Type.NUMBER }
                            },
                        },
                    },
                    labelPosition: {
                        type: Type.OBJECT,
                        description: "An {x, y} point for placing the room's label, usually near the center.",
                        properties: {
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER }
                        }
                    }
                },
                required: ['id', 'name', 'type', 'polygon', 'labelPosition'],
            }
        }
    },
    required: ['totalWidth', 'totalHeight', 'rooms'],
};

const getSystemInstruction = () => `You are an expert AI architect. Your task is to generate and modify residential floor plans based on user requirements.
- The output MUST be a valid JSON object that strictly follows the provided schema.
- The origin (0,0) is the top-left corner.
- All coordinates must be positive and within the totalWidth and totalHeight boundaries.
- Ensure room polygons are closed and do not overlap in impossible ways.
- Label positions should be calculated to be inside their respective polygons.
- Do not include any text, notes, or explanations outside of the JSON object.
- When modifying a plan, maintain the existing room 'id' values.
`;

export const generateInitialPlan = async (answers: QuestionnaireAnswers): Promise<FloorPlan> => {
    const prompt = `Generate a floor plan with the following requirements:
- Style: ${answers.style}
- Square Footage: ${answers.sqft} sq ft
- Bedrooms: ${answers.bedrooms}
- Bathrooms: ${answers.bathrooms}
- Stories: ${answers.stories}
- Features: ${answers.features.join(', ')}
- The total width and height should be roughly proportional to a standard house shape. A 60x40 or 70x50 aspect ratio is a good starting point.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
        model: "gemini-2.5-flash",
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

export const generateRoomMockup = async (room: Room, style: string): Promise<string> => {
    const prompt = `Generate a photorealistic, eye-level interior design photo of a ${room.type} called "${room.name}".
The architectural style is ${style}.
The room should look inviting, well-lit, and professionally designed.
Do not include any text or watermarks in the image.
`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    
    throw new Error("Image generation failed.");
};

export const generateRenderedView = async (floorplanImageBase64: string): Promise<string> => {
    const prompt = `You are a precise image editing AI. Your task is to fill in the empty (white) spaces of the provided floor plan wireframe image with 2D textures.
- **ABSOLUTELY DO NOT change, move, or alter the existing black lines (the walls) in any way.** The output image's black lines must be pixel-perfect identical to the input.
- The output image dimensions MUST be exactly the same as the input image dimensions.
- For the areas INSIDE the black lines (the rooms), fill them with simple, flat, top-down 2D architectural textures. Use wood patterns for living areas, bedrooms, and hallways. Use tile patterns for kitchens and bathrooms.
- For the area OUTSIDE the black lines, fill it with a simple, flat, top-down green grass texture.
- Do not add furniture, shadows, 3D effects, or any perspective. The result must be a clean, 2D "colored-in" version of the wireframe.`;

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