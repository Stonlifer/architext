
export interface Point {
  x: number;
  y: number;
}

export type RoomType = 'Living Room' | 'Kitchen' | 'Bedroom' | 'Bathroom' | 'Hallway' | 'Closet' | 'Dining Room' | 'Office' | 'Garage' | 'Balcony' | 'Entry' | 'Stairs';

export interface Door {
  // A door is on a wall segment defined by two points from a room's polygon.
  wallStart: Point;
  wallEnd: Point;
}

export interface Window {
  // A window is also on a wall segment.
  wallStart: Point;
  wallEnd: Point;
}

export type FurnitureType = 'sofa' | 'armchair' | 'bed' | 'dining_table' | 'chair' | 'kitchen_counter' | 'sink' | 'stove' | 'toilet' | 'bathtub' | 'shower' | 'wardrobe' | 'plant' | 'desk' | 'tv_stand' | 'fridge' | 'washing_machine' | 'rug';

export interface Furniture {
  id: string;
  type: FurnitureType;
  position: Point; // Top-left corner before rotation
  width: number;
  height: number;
  rotation: number; // Degrees, clockwise
}

export interface Room {
  id:string;
  name: string;
  type: RoomType;
  polygon: Point[];
  labelPosition: Point;
  doors: Door[];
  windows: Window[];
  furniture: Furniture[];
}

export interface FloorPlan {
  totalWidth: number;
  totalHeight: number;
  wallThickness: number;
  rooms: Room[];
}

export interface QuestionnaireAnswers {
    style: string;
    sqft: string;
    bedrooms: string;
    bathrooms: string;
    stories: string;
    features: string[];
}