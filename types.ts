
export interface Point {
  x: number;
  y: number;
}

export type RoomType = 'Living Room' | 'Kitchen' | 'Bedroom' | 'Bathroom' | 'Hallway' | 'Closet' | 'Dining Room' | 'Office' | 'Garage' | 'Balcony' | 'Entry';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  polygon: Point[];
  labelPosition: Point;
}

export interface FloorPlan {
  totalWidth: number;
  totalHeight: number;
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
