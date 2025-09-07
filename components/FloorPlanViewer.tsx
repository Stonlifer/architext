import React from 'react';
import { FloorPlan, Room, Furniture, Door, Window } from '../types';

interface FloorPlanViewerProps {
  plan: FloorPlan;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  svgRef: React.Ref<SVGSVGElement>;
  showBackground: boolean;
}

const STROKE_WIDTH = 0.2;

const getTransform = (f: Furniture): string => `translate(${f.position.x}, ${f.position.y}) rotate(${f.rotation} ${f.width / 2} ${f.height / 2})`;

const FurnitureSymbol: React.FC<{ furniture: Furniture }> = ({ furniture }) => {
    const props = {
        fill: "none",
        stroke: "black",
        strokeWidth: STROKE_WIDTH,
    };

    switch (furniture.type) {
        case 'sofa':
            return <g transform={getTransform(furniture)} className="furniture-symbol-group"><rect width={furniture.width} height={furniture.height} rx="0.5" {...props} /><line x1="0" y1="0.5" x2={furniture.width} y2="0.5" {...props} /><line x1="0.5" y1="0" x2="0.5" y2={furniture.height} {...props} /><line x1={furniture.width - 0.5} y1="0" x2={furniture.width - 0.5} y2={furniture.height} {...props} /></g>;
        case 'armchair':
            return <g transform={getTransform(furniture)} className="furniture-symbol-group"><rect width={furniture.width} height={furniture.height} rx="0.5" {...props} /><line x1="0" y1="0.3" x2={furniture.width} y2="0.3" {...props} /><line x1="0.3" y1="0" x2="0.3" y2={furniture.height} {...props} /><line x1={furniture.width - 0.3} y1="0" x2={furniture.width - 0.3} y2={furniture.height} {...props} /></g>;
        case 'bed':
            return <g transform={getTransform(furniture)} className="furniture-symbol-group"><rect width={furniture.width} height={furniture.height} {...props} /><rect x="0.2" y="0.2" width={furniture.width - 0.4} height={furniture.height * 0.3} rx="0.2" {...props} /></g>;
        case 'dining_table':
            return <g transform={getTransform(furniture)} className="furniture-symbol-group"><rect width={furniture.width} height={furniture.height} rx={Math.min(furniture.width, furniture.height)/2} {...props} /></g>;
        case 'chair':
            return <g transform={getTransform(furniture)} className="furniture-symbol-group"><rect width={furniture.width} height={furniture.height} rx="0.2" {...props} /><line x1="0" y1="0.2" x2={furniture.width} y2="0.2" {...props} /></g>;
        case 'kitchen_counter':
            return <g transform={getTransform(furniture)} className="furniture-symbol-group"><rect width={furniture.width} height={furniture.height} {...props} /></g>;
        case 'sink':
            return <g transform={getTransform(furniture)} className="furniture-symbol-group"><rect width={furniture.width} height={furniture.height} {...props} /><circle cx={furniture.width/2} cy={furniture.height/2} r={furniture.width/3} {...props} /></g>;
        case 'stove':
             return <g transform={getTransform(furniture)} className="furniture-symbol-group"><rect width={furniture.width} height={furniture.height} {...props} /><circle cx={furniture.width*0.3} cy={furniture.height*0.3} r="0.3" {...props} /><circle cx={furniture.width*0.7} cy={furniture.height*0.3} r="0.3" {...props} /><circle cx={furniture.width*0.3} cy={furniture.height*0.7} r="0.3" {...props} /><circle cx={furniture.width*0.7} cy={furniture.height*0.7} r="0.3" {...props} /></g>;
        case 'toilet':
            return <g transform={getTransform(furniture)} className="furniture-symbol-group"><ellipse cx={furniture.width/2} cy={furniture.height*0.6} rx={furniture.width/2.2} ry={furniture.height/3} {...props} /><rect x={furniture.width*0.2} y="0" width={furniture.width*0.6} height={furniture.height*0.4} rx="0.1" {...props} /></g>;
        case 'bathtub':
            return <g transform={getTransform(furniture)} className="furniture-symbol-group"><rect width={furniture.width} height={furniture.height} rx="0.5" {...props} /><circle cx={furniture.width*0.2} cy={furniture.height*0.2} r="0.2" {...props} /></g>;
        case 'plant':
             return <g transform={getTransform(furniture)} className="furniture-symbol-group"><circle cx={furniture.width/2} cy={furniture.height/2} r={furniture.width/2} {...props} /></g>;
        default:
            return <g transform={getTransform(furniture)} className="furniture-symbol-group"><rect width={furniture.width} height={furniture.height} {...props} /><line x1="0" y1="0" x2={furniture.width} y2={furniture.height} {...props} /><line x1={furniture.width} y1="0" x2="0" y2={furniture.height} {...props} /></g>;
    }
};

const DoorSymbol: React.FC<{ door: Door; wallThickness: number }> = ({ door, wallThickness }) => {
    const { wallStart, wallEnd } = door;
    const wallAngle = Math.atan2(wallEnd.y - wallStart.y, wallEnd.x - wallStart.x);
    const midX = (wallStart.x + wallEnd.x) / 2;
    const midY = (wallStart.y + wallEnd.y) / 2;
    const doorWidth = 3; 
    
    // Determine swing direction to be inside
    // This is a simplification; a true calculation needs to know which side is "inside"
    const swingAngle = -90; 

    return (
        <g transform={`translate(${midX}, ${midY}) rotate(${wallAngle * 180 / Math.PI})`}>
            {/* Erase wall */}
            <rect x={-doorWidth/2} y={-wallThickness/2} width={doorWidth} height={wallThickness} fill="white" />
            {/* Door and Arc */}
            <path d={`M ${-doorWidth/2} 0 H ${doorWidth/2} M ${-doorWidth/2}, 0 A ${doorWidth},${doorWidth} 0 0 1 ${doorWidth/2}, ${doorWidth * (swingAngle > 0 ? -1 : 1)}`} 
                stroke="black" strokeWidth={STROKE_WIDTH * 0.75} fill="none" strokeDasharray="0.3, 0.3" />
            <line x1={-doorWidth/2} y1="0" x2={doorWidth/2} y2={doorWidth * (swingAngle > 0 ? -1 : 1)} stroke="black" strokeWidth={STROKE_WIDTH} />
        </g>
    );
};

const WindowSymbol: React.FC<{ window: Window; wallThickness: number }> = ({ window, wallThickness }) => {
    const { wallStart, wallEnd } = window;
    const wallAngle = Math.atan2(wallEnd.y - wallStart.y, wallEnd.x - wallStart.x) * 180 / Math.PI;
    const midX = (wallStart.x + wallEnd.x) / 2;
    const midY = (wallStart.y + wallEnd.y) / 2;
    const windowWidth = 4;

    return (
        <g transform={`translate(${midX}, ${midY}) rotate(${wallAngle})`}>
            {/* Erase wall */}
            <rect x={-windowWidth/2} y={-wallThickness/2} width={windowWidth} height={wallThickness} fill="white" />
             {/* Window Sill */}
            <rect x={-windowWidth/2} y={-wallThickness*0.1} width={windowWidth} height={wallThickness*0.2} stroke="black" strokeWidth={STROKE_WIDTH*0.5} fill="none" />
        </g>
    );
};

const StairsSymbol: React.FC<{ room: Room }> = ({ room }) => {
    const [minX, maxX] = [Math.min(...room.polygon.map(p => p.x)), Math.max(...room.polygon.map(p => p.x))];
    const [minY, maxY] = [Math.min(...room.polygon.map(p => p.y)), Math.max(...room.polygon.map(p => p.y))];
    const width = maxX - minX;
    const height = maxY - minY;
    const isVertical = height > width;
    const stepCount = Math.floor(isVertical ? height : width);

    const lines = Array.from({ length: stepCount - 1 }, (_, i) => {
        const pos = (i + 1) / stepCount;
        if (isVertical) {
            return <line key={i} x1={minX} y1={minY + pos * height} x2={maxX} y2={minY + pos * height} stroke="black" strokeWidth={STROKE_WIDTH * 0.75} />;
        } else {
            return <line key={i} x1={minX + pos * width} y1={minY} x2={minX + pos * width} y2={maxY} stroke="black" strokeWidth={STROKE_WIDTH * 0.75} />;
        }
    });

    return <g>{lines}</g>;
};

const RoomComponent: React.FC<{ room: Room; isSelected: boolean; onSelect: () => void; plan: FloorPlan }> = ({ room, isSelected, onSelect, plan }) => {
  const points = room.polygon.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <g onClick={onSelect} className="cursor-pointer group">
      <polygon
        points={points}
        stroke="black"
        strokeWidth={plan.wallThickness}
        strokeLinejoin="round"
        fill={isSelected ? 'rgba(147, 197, 253, 0.2)' : 'white'}
      />
      {room.furniture.map(f => <FurnitureSymbol key={f.id} furniture={f} />)}
      {room.type === 'Stairs' && <StairsSymbol room={room} />}
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
                
                {/* Render Rooms first (floor and furniture) */}
                {plan.rooms.map(room => (
                    <RoomComponent
                        key={room.id}
                        room={room}
                        isSelected={room.id === selectedRoomId}
                        onSelect={() => onSelectRoom(room.id)}
                        plan={plan}
                    />
                ))}

                 {/* Render Doors and Windows on top to cut through walls */}
                 {plan.rooms.flatMap(room => 
                    [
                        ...room.doors.map((door, i) => <DoorSymbol key={`${room.id}-d-${i}`} door={door} wallThickness={plan.wallThickness} />),
                        ...room.windows.map((window, i) => <WindowSymbol key={`${room.id}-w-${i}`} window={window} wallThickness={plan.wallThickness} />)
                    ]
                )}
            </svg>
        </div>
    );
};

export default FloorPlanViewer;