import React, { useState, useCallback, useRef } from 'react';
import { FloorPlan } from '../types';
import FloorPlanViewer from './FloorPlanViewer';
import ChatInterface from './ChatInterface';
import { modifyPlan, generateRenderedView } from '../services/geminiService';
import { LogoIcon } from './icons/LogoIcon';
import { LayersIcon } from './icons/TerrainIcon';
import { DownloadIcon } from './icons/DownloadIcon';

// FIX: Augment the global Window type to include the jspdf property.
// This informs TypeScript that jspdf is available on the window object,
// which is how it's loaded when included via a script tag.
declare global {
  interface Window {
    jspdf: any;
  }
}

interface FloorPlanDesignerProps {
  initialPlan: FloorPlan;
  onStartOver: () => void;
}

const FloorPlanDesigner: React.FC<FloorPlanDesignerProps> = ({ initialPlan }) => {
  const [plan, setPlan] = useState<FloorPlan>(initialPlan);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingRender, setIsGeneratingRender] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
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
  
  const convertSvgToPng = (includeFurniture: boolean = true): Promise<string> => {
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

        if (!includeFurniture) {
            const furnitureElements = clonedSvgElement.querySelectorAll('.furniture-symbol-group');
            furnitureElements.forEach(el => el.remove());
        }

        const svgString = new XMLSerializer().serializeToString(clonedSvgElement);
        const image = new Image();

        image.onload = () => {
            const canvas = document.createElement('canvas');
            const viewBox = svgElement.viewBox.baseVal;
            // Use a higher resolution for better quality in the PDF
            const scale = 4;
            canvas.width = (viewBox.width > 0 ? viewBox.width : 1024) * scale;
            canvas.height = (viewBox.height > 0 ? viewBox.height : 768) * scale;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error("Could not get canvas context."));
            }

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const pngDataUrl = canvas.toDataURL('image/png');
            resolve(pngDataUrl);
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
          const base64Png = await convertSvgToPng(false); // Send without furniture symbols for realistic rendering
          const renderedImage = await generateRenderedView(base64Png.split(',')[1], plan);
          setRenderedViewOverlay(`data:image/png;base64,${renderedImage}`);
          setViewMode('rendered');
      } catch (e) {
          console.error(e);
          setError('Failed to generate rendered view. Please try again.');
      } finally {
          setIsGeneratingRender(false);
      }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setError(null);
    try {
        const pngDataUrl = await convertSvgToPng(true);
        const { jsPDF } = window.jspdf;

        const isLandscape = plan.totalWidth > plan.totalHeight;
        const pdf = new jsPDF({
            orientation: isLandscape ? 'l' : 'p',
            unit: 'pt',
            format: 'a4'
        });

        const pageDimensions = pdf.internal.pageSize;
        const pageWidth = pageDimensions.getWidth();
        const pageHeight = pageDimensions.getHeight();

        const margin = 40; // 40 points margin
        const contentWidth = pageWidth - margin * 2;
        const contentHeight = pageHeight - margin * 2;
        
        const planAspectRatio = plan.totalWidth / plan.totalHeight;
        const contentAspectRatio = contentWidth / contentHeight;

        let pdfImageWidth, pdfImageHeight;
        if (planAspectRatio > contentAspectRatio) {
            // Plan is wider than the available content area
            pdfImageWidth = contentWidth;
            pdfImageHeight = contentWidth / planAspectRatio;
        } else {
            // Plan is taller than or equal to the available content area
            pdfImageHeight = contentHeight;
            pdfImageWidth = contentHeight * planAspectRatio;
        }

        const pdfImageX = (pageWidth - pdfImageWidth) / 2;
        const pdfImageY = (pageHeight - pdfImageHeight) / 2;

        pdf.addImage(pngDataUrl, 'PNG', pdfImageX, pdfImageY, pdfImageWidth, pdfImageHeight);
        pdf.save('floor-plan.pdf');
    } catch (e) {
        console.error("Failed to export PDF:", e);
        setError("Could not export the plan as a PDF.");
    } finally {
        setIsExportingPdf(false);
    }
  };

  const handleExportPng = () => {
      if (!renderedViewOverlay) return;
      const link = document.createElement('a');
      link.href = renderedViewOverlay;
      link.download = 'floor-plan-render.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const selectedRoom = plan.rooms.find(r => r.id === selectedRoomId);

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
                 {viewMode === 'wireframe' ? (
                    <>
                        <button
                            onClick={handleExportPdf}
                            disabled={isExportingPdf}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            {isExportingPdf ? 'Exporting...' : 'Export PDF'}
                        </button>
                        <button
                            onClick={handleGenerateRenderedView}
                            disabled={isGeneratingRender}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-600 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            <LayersIcon className="w-5 h-5" />
                            {isGeneratingRender ? 'Generating...' : 'Generate Rendered View'}
                        </button>
                    </>
                 ) : (
                    <button
                        onClick={handleExportPng}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Export PNG
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
        
        {selectedRoom && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-gray-600 shadow-lg text-base font-semibold animate-fade-in z-10">
                {selectedRoom.name} ({selectedRoom.type})
            </div>
        )}

        {(isLoading || isGeneratingRender || isExportingPdf) && (
            <div className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex flex-col items-center">
                <LogoIcon className="w-12 h-12 text-brand-accent animate-pulse-slow" />
                <p className="text-white mt-2">
                    {isLoading && 'AI is updating your design...'}
                    {isGeneratingRender && 'AI is generating rendered view...'}
                    {isExportingPdf && 'Preparing your PDF for download...'}
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
    </div>
  );
};

export default FloorPlanDesigner;