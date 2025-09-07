import { FloorPlan } from '../types';

export const mockFloorPlan: FloorPlan = {
  totalWidth: 60,
  totalHeight: 122,
  wallThickness: 0.8,
  rooms: [
    {
      id: 'room-1',
      name: 'Living Room',
      type: 'Living Room',
      polygon: [ { x: 0, y: 0 }, { x: 60, y: 0 }, { x: 60, y: 42 }, { x: 0, y: 42 } ],
      labelPosition: { x: 30, y: 21 },
      doors: [
        { wallStart: { x: 0, y: 42 }, wallEnd: { x: 0, y: 82 } } // Custom door position on split wall
      ],
      windows: [
        { wallStart: { x: 60, y: 0 }, wallEnd: { x: 60, y: 42 } },
        { wallStart: { x: 0, y: 0 }, wallEnd: { x: 60, y: 0 } }
      ],
      furniture: [
        { id: 'f-1', type: 'sofa', position: { x: 25, y: 5 }, width: 20, height: 8, rotation: 0 },
        { id: 'f-2', type: 'armchair', position: { x: 5, y: 15 }, width: 10, height: 10, rotation: 0 },
        { id: 'f-3', type: 'plant', position: { x: 5, y: 5 }, width: 5, height: 5, rotation: 0 },
        { id: 'f-4', type: 'tv_stand', position: { x: 20, y: 35 }, width: 25, height: 4, rotation: 0 },
      ],
    },
    {
      id: 'room-2',
      name: 'Kitchen',
      type: 'Kitchen',
      polygon: [ { x: 0, y: 42 }, { x: 40, y: 42 }, { x: 40, y: 82 }, { x: 0, y: 82 } ],
      labelPosition: { x: 20, y: 62 },
      doors: [],
      windows: [],
      furniture: [
        { id: 'f-5', type: 'kitchen_counter', position: { x: 1, y: 50 }, width: 2, height: 20, rotation: 0 },
        { id: 'f-6', type: 'kitchen_counter', position: { x: 3, y: 50 }, width: 20, height: 2, rotation: 0 },
        { id: 'f-7', type: 'sink', position: { x: 15, y: 53 }, width: 6, height: 4, rotation: 0 },
        { id: 'f-8', type: 'stove', position: { x: 15, y: 58 }, width: 6, height: 6, rotation: 0 },
        { id: 'f-9', type: 'fridge', position: { x: 15, y: 70 }, width: 6, height: 6, rotation: 0 },
      ],
    },
    {
      id: 'room-3',
      name: 'Stairs',
      type: 'Stairs',
      polygon: [ { x: 40, y: 42 }, { x: 60, y: 42 }, { x: 60, y: 82 }, { x: 40, y: 82 } ],
      labelPosition: { x: 50, y: 38 },
      doors: [],
      windows: [],
      furniture: [
         { id: 'f-10', type: 'dining_table', position: { x: 45, y: 65 }, width: 10, height: 10, rotation: 0 },
         { id: 'f-11', type: 'chair', position: { x: 42, y: 68 }, width: 3, height: 4, rotation: 90 },
         { id: 'f-12', type: 'chair', position: { x: 55, y: 68 }, width: 3, height: 4, rotation: -90 },
      ],
    },
    {
      id: 'room-4',
      name: 'Entry',
      type: 'Entry',
      polygon: [ { x: 0, y: 82 }, { x: 45, y: 82 }, { x: 45, y: 86 }, { x: 0, y: 86 } ],
      labelPosition: { x: 22.5, y: 78 },
      doors: [
        { wallStart: { x: 0, y: 86 }, wallEnd: { x: 0, y: 122 } }
      ],
      windows: [],
      furniture: [{ id: 'f-13', type: 'plant', position: { x: 5, y: 75 }, width: 5, height: 5, rotation: 0 }],
    },
    {
      id: 'room-5',
      name: 'Bathroom',
      type: 'Bathroom',
      polygon: [ { x: 0, y: 86 }, { x: 45, y: 86 }, { x: 45, y: 104 }, { x: 0, y: 104 } ],
      labelPosition: { x: 22.5, y: 95 },
      doors: [
        { wallStart: { x: 25, y: 104 }, wallEnd: { x: 45, y: 104 } }
      ],
      windows: [],
      furniture: [
        { id: 'f-14', type: 'toilet', position: { x: 35, y: 88 }, width: 8, height: 6, rotation: 0 },
        { id: 'f-15', type: 'bathtub', position: { x: 2, y: 88 }, width: 15, height: 7, rotation: 0 },
        { id: 'f-16', type: 'sink', position: { x: 20, y: 88 }, width: 10, height: 5, rotation: 0 },
      ],
    },
     {
      id: 'room-6',
      name: 'Laundry',
      type: 'Closet',
      polygon: [ { x: 0, y: 104 }, { x: 25, y: 104 }, { x: 25, y: 122 }, { x: 0, y: 122 } ],
      labelPosition: { x: 12.5, y: 113 },
      doors: [
         { wallStart: { x: 0, y: 104 }, wallEnd: { x: 25, y: 104 } }
      ],
      windows: [],
      furniture: [
          { id: 'f-17', type: 'washing_machine', position: { x: 15, y: 106 }, width: 8, height: 8, rotation: 0 },
          { id: 'f-18', type: 'shower', position: { x: 2, y: 106 }, width: 10, height: 10, rotation: 0 },
      ],
    },
    {
      id: 'room-7',
      name: 'Bedroom',
      type: 'Bedroom',
      polygon: [ { x: 25, y: 104 }, { x: 45, y: 104 }, { x: 45, y: 122 }, { x: 25, y: 122 } ],
      labelPosition: { x: 35, y: 113 },
      doors: [],
      windows: [
         { wallStart: { x: 45, y: 104 }, wallEnd: { x: 45, y: 122 } }
      ],
      furniture: [
          { id: 'f-19', type: 'bed', position: { x: 27, y: 106 }, width: 16, height: 14, rotation: 0 },
      ],
    },
  ],
};
