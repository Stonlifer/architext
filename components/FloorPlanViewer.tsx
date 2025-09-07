import React from 'react';
import { FloorPlan, Room } from '../types';

interface FloorPlanViewerProps {
  plan: FloorPlan;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  svgRef: React.Ref<SVGSVGElement>;
  showBackground: boolean;
}

const RoomPolygon: React.FC<{ room: Room; isSelected: boolean; onSelect: () => void; }> = ({ room, isSelected, onSelect }) => {
  const points = room.polygon.map(p => `${p.x},${p.y}`).join(' ');

  const roomTypeColors: Record<string, string> = {
    'Bedroom': 'fill-blue-900/50 stroke-blue-400',
    'Bathroom': 'fill-purple-900/50 stroke-purple-400',
    'Kitchen': 'fill-green-900/50 stroke-green-400',
    'Living Room': 'fill-yellow-900/50 stroke-yellow-400',
    'Dining Room': 'fill-orange-900/50 stroke-orange-400',
    'Hallway': 'fill-gray-800/50 stroke-gray-500',
    'Closet': 'fill-gray-700/50 stroke-gray-400',
    'default': 'fill-gray-800/50 stroke-gray-500',
  };

  // Calculate a reasonable font size based on the room's dimensions
  let fontSize = 2.5; // Default font size
  if (room.polygon && room.polygon.length > 2) {
      const xs = room.polygon.map(p => p.x);
      const ys = room.polygon.map(p => p.y);
      const roomWidth = Math.max(...xs) - Math.min(...xs);
      const roomHeight = Math.max(...ys) - Math.min(...ys);
      const smallerDimension = Math.min(roomWidth, roomHeight);
      // Adjust font size based on the smaller dimension, with min/max caps
      fontSize = Math.min(4, Math.max(1.5, smallerDimension / 6));
  }

  const colorClasses = roomTypeColors[room.type] || roomTypeColors['default'];
  const selectedClasses = 'stroke-brand-accent stroke-2 ring-4 ring-brand-accent/50';

  return (
    <g onClick={onSelect} className="cursor-pointer group">
      <polygon
        points={points}
        className={`${colorClasses} transition-all duration-300 group-hover:fill-opacity-75 ${isSelected ? selectedClasses : ''}`}
        style={{
          strokeWidth: isSelected ? 2 : 1,
          vectorEffect: 'non-scaling-stroke',
        }}
      />
      <text
        x={room.labelPosition.x}
        y={room.labelPosition.y}
        fontSize={fontSize}
        className={`fill-white font-semibold pointer-events-none transition-all duration-300 ${isSelected ? 'font-bold' : ''}`}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {room.name}
      </text>
    </g>
  );
};


const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({ plan, selectedRoomId, onSelectRoom, svgRef, showBackground }) => {
    if (!plan) return <div className="text-gray-400">No floor plan data available.</div>;

    const PADDING = 20;

    return (
        <div className="w-full h-full flex items-center justify-center">
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`${-PADDING} ${-PADDING} ${plan.totalWidth + PADDING*2} ${plan.totalHeight + PADDING*2}`}
                className={`rounded-lg ${showBackground ? 'bg-gray-800' : 'bg-transparent'}`}
            >
              {showBackground && (
                <>
                  <defs>
                      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(107, 114, 128, 0.2)" strokeWidth="0.5"/>
                      </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </>
              )}
                
                {plan.rooms.map(room => (
                    <RoomPolygon
                        key={room.id}
                        room={room}
                        isSelected={room.id === selectedRoomId}
                        onSelect={() => onSelectRoom(room.id)}
                    />
                ))}
            </svg>
        </div>
    );
};

export default FloorPlanViewer;