import React, { useState, useCallback, useRef } from 'react';
import { FloorPlan, Room } from '../types';
import FloorPlanViewer from './FloorPlanViewer';
import ChatInterface from './ChatInterface';
import MockupViewer from './MockupViewer';
import { modifyPlan, generateRoomMockup, generateRenderedView } from '../services/geminiService';
import { CameraIcon } from './icons/CameraIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LayersIcon } from './icons/TerrainIcon';

interface FloorPlanDesignerProps {
  initialPlan: FloorPlan;
  onStartOver: () => void;
}

const FloorPlanDesigner: React.FC<FloorPlanDesignerProps> = ({ initialPlan }) => {
  const [plan, setPlan] = useState<FloorPlan>(initialPlan);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingRender, setIsGeneratingRender] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isMockupPanelOpen, setIsMockupPanelOpen] = useState<boolean>(false);
  const [renderedViewOverlay, setRenderedViewOverlay] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'wireframe' | 'rendered'>('wireframe');
  const svgRef = useRef<SVGSVGElement>(null);

  const handleModificationRequest = useCallback(async (request: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newPlan = await modifyPlan(plan, request);
      setPlan(newPlan);
    } catch (e) {
      console.error(e);
      setError('Failed to modify the plan. Please try a different request.');
    } finally {
      setIsLoading(false);
    }
  }, [plan]);
  
  const convertSvgToPng = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        const svgElement = svgRef.current;
        if (!svgElement) {
            return reject(new Error("SVG element not found."));
        }

        const clonedSvgElement = svgElement.cloneNode(true) as SVGSVGElement;
        clonedSvgElement.setAttribute('style', ''); // clear inline styles if any
        clonedSvgElement.classList.remove('bg-gray-800');
        const gridRect = clonedSvgElement.querySelector('rect[fill="url(#grid)"]');
        if (gridRect) gridRect.remove();
        const gridDefs = clonedSvgElement.querySelector('defs');
        if (gridDefs) gridDefs.remove();

        const svgString = new XMLSerializer().serializeToString(clonedSvgElement);
        const image = new Image();

        image.onload = () => {
            const canvas = document.createElement('canvas');
            const viewBox = svgElement.viewBox.baseVal;
            canvas.width = viewBox.width > 0 ? viewBox.width : 1024;
            canvas.height = viewBox.height > 0 ? viewBox.height : 768;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error("Could not get canvas context."));
            }

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const pngDataUrl = canvas.toDataURL('image/png');
            const base64Data = pngDataUrl.split(',')[1];
            resolve(base64Data);
        };

        image.onerror = () => {
            reject(new Error("Failed to load SVG image for conversion."));
        };
        
        image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    });
};


  const handleGenerateRenderedView = async () => {
      setIsGeneratingRender(true);
      setError(null);
      try {
          const base64Png = await convertSvgToPng();
          const renderedImage = await generateRenderedView(base64Png);
          setRenderedViewOverlay(`data:image/png;base64,${renderedImage}`);
          setViewMode('rendered');
      } catch (e) {
          console.error(e);
          setError('Failed to generate rendered view. Please try again.');
      } finally {
          setIsGeneratingRender(false);
      }
  };


  const selectedRoom = plan.rooms.find(r => r.id === selectedRoomId) || null;

  return (
    <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in h-full overflow-hidden">
      <div className="lg:col-span-2 bg-gray-900/50 rounded-xl shadow-lg border border-gray-700 p-4 flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-white">Floor Plan Viewer</h2>
            <div className="flex items-center gap-2">
                 {renderedViewOverlay && (
                    <div className="flex items-center p-1 bg-gray-700 rounded-lg text-sm">
                        <button onClick={() => setViewMode('wireframe')} className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'wireframe' ? 'bg-brand-secondary text-white shadow' : 'text-gray-300 hover:bg-gray-600'}`}>Wireframe</button>
                        <button onClick={() => setViewMode('rendered')} className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'rendered' ? 'bg-brand-secondary text-white shadow' : 'text-gray-300 hover:bg-gray-600'}`}>Rendered</button>
                    </div>
                )}
                 <button
                    onClick={handleGenerateRenderedView}
                    disabled={isGeneratingRender}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-600 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    <LayersIcon className="w-5 h-5" />
                    {isGeneratingRender ? 'Generating...' : 'Generate Rendered View'}
                </button>
                {selectedRoom && (
                    <button
                        onClick={() => setIsMockupPanelOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-blue-800 rounded-lg transition-colors"
                    >
                        <CameraIcon className="w-5 h-5" />
                        Generate Mockup
                    </button>
                )}
            </div>
        </div>
        <div className="flex-grow flex items-center justify-center min-h-0 relative p-4">
            {renderedViewOverlay && viewMode === 'rendered' && (
                <img 
                    src={renderedViewOverlay} 
                    alt="Rendered View Overlay" 
                    className="absolute inset-0 w-full h-full object-cover rounded-lg pointer-events-none"
                />
            )}
            <FloorPlanViewer
                plan={plan}
                selectedRoomId={selectedRoomId}
                onSelectRoom={setSelectedRoomId}
                svgRef={svgRef}
                showBackground={viewMode === 'wireframe'}
            />
        </div>
        {(isLoading || isGeneratingRender) && (
            <div className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex flex-col items-center">
                <SparklesIcon className="w-12 h-12 text-brand-accent animate-pulse-slow" />
                <p className="text-white mt-2">
                    {isLoading ? 'AI is updating your design...' : 'AI is generating rendered view...'}
                </p>
              </div>
            </div>
          )}
      </div>

      <div className="bg-gray-900/50 rounded-xl shadow-lg border border-gray-700 flex flex-col overflow-hidden">
        <ChatInterface
          onSendMessage={handleModificationRequest}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {isMockupPanelOpen && selectedRoom && (
        <MockupViewer
            room={selectedRoom}
            onClose={() => setIsMockupPanelOpen(false)}
            generateImage={() => generateRoomMockup(selectedRoom, 'Modern')}
        />
      )}
    </div>
  );
};

export default FloorPlanDesigner;