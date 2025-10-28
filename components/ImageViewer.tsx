import React, { useRef, useEffect, useState } from 'react';
import { EditState, TextItem, EditorTab, CropBox } from '../types';
import { ZoomInIcon, ZoomOutIcon } from './icons';

interface ImageViewerProps {
  imageSrc: string | null;
  edits: EditState;
  texts: TextItem[];
  isPreviewing: boolean;
  activeTab: EditorTab;
  brushSize: number;
  onMaskChange: (mask: string) => void;
  // Text props
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  onTextPositionChange: (id: string, position: { x: number, y: number }) => void;
  // Crop props
  cropBox: CropBox | null;
  onCropBoxChange: (box: CropBox) => void;
  // Zoom/Pan props
  zoom: number;
  onZoomChange: (zoom: number) => void;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  imageSrc, edits, texts, isPreviewing, activeTab, brushSize, onMaskChange,
  selectedTextId, onSelectText, onTextPositionChange,
  cropBox, onCropBoxChange,
  zoom, onZoomChange, pan, onPanChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const panState = useRef({ isPanning: false, startX: 0, startY: 0, startPan: { x: 0, y: 0 } });
  const dragStartRef = useRef<{ x: number; y: number; itemX: number; itemY: number } | null>(null);
  const cropDragRef = useRef<{ type: string; startX: number; startY: number; box: CropBox } | null>(null);

  useEffect(() => {
    if (!imageSrc || !containerRef.current) return;
    const container = containerRef.current;
    const img = new Image();
    img.onload = () => {
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerW / containerH;
      let width, height;
      if (imgAspect > containerAspect) {
        width = containerW;
        height = containerW / imgAspect;
      } else {
        height = containerH;
        width = containerH * imgAspect;
      }
      setImageSize({ width, height });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (canvasRef.current && imageSize.width > 0 && imageSize.height > 0) {
      canvasRef.current.width = imageSize.width;
      canvasRef.current.height = imageSize.height;
      if (activeTab !== 'remove') {
          const ctx = canvasRef.current.getContext('2d');
          ctx?.clearRect(0, 0, imageSize.width, imageSize.height);
      }
    }
  }, [imageSize, activeTab]);

  const getFilterStyle = (): React.CSSProperties => {
    if (isPreviewing) return {};
    return {
      filter: `
        brightness(${edits.brightness / 100})
        contrast(${edits.contrast / 100})
        saturate(${edits.saturation / 100})
        sepia(${edits.sepia / 100})
        grayscale(${edits.grayscale / 100})
      `,
    };
  };

  // FIX: Correctly handle both mouse and touch events to avoid type errors.
  const getPointOnImage = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent | WheelEvent): {x: number, y: number} | null => {
    const container = containerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    const imageX = (screenX - pan.x) / zoom;
    const imageY = (screenY - pan.y) / zoom;

    return { x: imageX, y: imageY };
  }

  // --- Panning ---
  // FIX: Correctly handle both mouse and touch events to avoid type errors.
  const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStartRef.current || cropDragRef.current) return; // Don't pan if dragging an item
    e.preventDefault();
    
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    panState.current = { isPanning: true, startX: clientX, startY: clientY, startPan: { ...pan } };
    window.addEventListener('mousemove', handlePanMove);
    window.addEventListener('mouseup', handlePanEnd);
    window.addEventListener('touchmove', handlePanMove);
    window.addEventListener('touchend', handlePanEnd);
  }

  // FIX: Correctly handle both mouse and touch events to avoid type errors.
  const handlePanMove = (e: MouseEvent | TouchEvent) => {
    if (!panState.current.isPanning) return;

    let clientX, clientY;
    if ('touches' in e) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const dx = clientX - panState.current.startX;
    const dy = clientY - panState.current.startY;
    onPanChange({ x: panState.current.startPan.x + dx, y: panState.current.startPan.y + dy });
  }

  const handlePanEnd = () => {
    panState.current.isPanning = false;
    window.removeEventListener('mousemove', handlePanMove);
    window.removeEventListener('mouseup', handlePanEnd);
    window.removeEventListener('touchmove', handlePanMove);
    window.removeEventListener('touchend', handlePanEnd);
  }

  // --- Zooming ---
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.005;
    const newZoom = Math.max(0.1, Math.min(zoom + delta, 10));
    
    const mousePoint = getPointOnImage(e);
    if (!mousePoint) return;
    
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const screenMouseX = e.clientX - rect.left;
    const screenMouseY = e.clientY - rect.top;
    
    // Pan so that the point under the mouse stays in the same place
    const newPanX = screenMouseX - mousePoint.x * newZoom;
    const newPanY = screenMouseY - mousePoint.y * newZoom;

    onZoomChange(newZoom);
    onPanChange({ x: newPanX, y: newPanY });
  }

  const handleZoomButtonClick = (factor: number) => {
    const newZoom = Math.max(0.1, Math.min(zoom * factor, 10));
    const container = containerRef.current;
    if (!container) return;
    
    // Zoom towards the center of the viewport
    const screenCenterX = container.clientWidth / 2;
    const screenCenterY = container.clientHeight / 2;
    const imagePoint = {
        x: (screenCenterX - pan.x) / zoom,
        y: (screenCenterY - pan.y) / zoom,
    };
    const newPan = {
        x: screenCenterX - imagePoint.x * newZoom,
        y: screenCenterY - imagePoint.y * newZoom,
    };
    onZoomChange(newZoom);
    onPanChange(newPan);
  }


  // --- Drawing (Remove Tool) ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTab !== 'remove') return;
    const coords = getPointOnImage(e);
    if (!coords) return;
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || activeTab !== 'remove') return;
    e.preventDefault();
    const coords = getPointOnImage(e);
    if (!coords) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) onMaskChange(canvasRef.current.toDataURL());
  };

  // --- Text Dragging ---
  const onTextDragStart = (e: React.MouseEvent | React.TouchEvent, textItem: TextItem) => {
    e.preventDefault(); e.stopPropagation(); onSelectText(textItem.id);
    const point = getPointOnImage(e);
    if (!point) return;
    const itemXPercent = textItem.position.x / 100 * imageSize.width;
    const itemYPercent = textItem.position.y / 100 * imageSize.height;
    dragStartRef.current = { x: point.x, y: point.y, itemX: itemXPercent, itemY: itemYPercent };
    window.addEventListener('mousemove', onTextDragMove); window.addEventListener('mouseup', onTextDragEnd);
    window.addEventListener('touchmove', onTextDragMove); window.addEventListener('touchend', onTextDragEnd);
  };

  const onTextDragMove = (e: MouseEvent | TouchEvent) => {
    if (!dragStartRef.current || !selectedTextId) return;
    const point = getPointOnImage(e);
    if (!point) return;
    const dx = point.x - dragStartRef.current.x;
    const dy = point.y - dragStartRef.current.y;
    const newX = dragStartRef.current.itemX + dx;
    const newY = dragStartRef.current.itemY + dy;
    onTextPositionChange(selectedTextId, {
        x: (newX / imageSize.width) * 100,
        y: (newY / imageSize.height) * 100,
    });
  };

  const onTextDragEnd = () => {
    dragStartRef.current = null;
    window.removeEventListener('mousemove', onTextDragMove); window.removeEventListener('mouseup', onTextDragEnd);
    window.removeEventListener('touchmove', onTextDragMove); window.removeEventListener('touchend', onTextDragEnd);
  };
  
  // --- Crop Box Interaction ---
  const onCropDragStart = (e: React.MouseEvent | React.TouchEvent, type: string) => {
      e.preventDefault(); e.stopPropagation(); if (!cropBox) return;
      const coords = getPointOnImage(e);
      if (!coords) return;
      cropDragRef.current = { type, startX: coords.x, startY: coords.y, box: { ...cropBox } };
      window.addEventListener('mousemove', onCropDragMove); window.addEventListener('mouseup', onCropDragEnd);
      window.addEventListener('touchmove', onCropDragMove); window.addEventListener('touchend', onCropDragEnd);
  }

  const onCropDragMove = (e: MouseEvent | TouchEvent) => {
      if (!cropDragRef.current) return;
      const { type, startX, startY, box } = cropDragRef.current;
      const coords = getPointOnImage(e);
      if (!coords) return;
      let newBox = { ...box };
      const dx = coords.x - startX;
      const dy = coords.y - startY;
      if (type === 'move') { newBox.x = box.x + dx; newBox.y = box.y + dy; } 
      else {
          if (type.includes('left')) { newBox.x = box.x + dx; newBox.width = box.width - dx; }
          if (type.includes('right')) { newBox.width = box.width + dx; }
          if (type.includes('top')) { newBox.y = box.y + dy; newBox.height = box.height - dy; }
          if (type.includes('bottom')) { newBox.height = box.height + dy; }
      }
      newBox.x = Math.max(0, newBox.x); newBox.y = Math.max(0, newBox.y);
      newBox.width = Math.min(imageSize.width - newBox.x, newBox.width);
      newBox.height = Math.min(imageSize.height - newBox.y, newBox.height);
      onCropBoxChange(newBox);
  }

  const onCropDragEnd = () => {
      cropDragRef.current = null;
      window.removeEventListener('mousemove', onCropDragMove); window.removeEventListener('mouseup', onCropDragEnd);
      window.removeEventListener('touchmove', onCropDragMove); window.removeEventListener('touchend', onCropDragEnd);
  }

  return (
    <div ref={containerRef} className="relative flex-grow flex items-center justify-center p-4 bg-gray-800/50 overflow-hidden cursor-grab active:cursor-grabbing" 
        onClick={() => onSelectText(null)} onWheel={handleWheel}
        onMouseDown={handlePanStart} onTouchStart={handlePanStart}>
      {imageSrc && imageSize.width > 0 && (
        <div className="absolute" style={{ 
          width: imageSize.width, height: imageSize.height,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'top left'
        }}>
          <img
            src={imageSrc} alt="Editable"
            style={{...getFilterStyle(), width: '100%', height: '100%' }}
            className="object-contain block pointer-events-none select-none"
          />
          <canvas
            ref={canvasRef} className="absolute top-0 left-0"
            style={{ cursor: activeTab === 'remove' ? 'crosshair' : 'default', pointerEvents: activeTab === 'remove' ? 'auto' : 'none' }}
            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
            onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
          />
          {texts.map(text => (
            <div
              key={text.id}
              className={`absolute cursor-move select-none p-1 ${selectedTextId === text.id ? 'border border-dashed border-blue-400' : ''}`}
              style={{
                left: `calc(${text.position.x}%)`, top: `calc(${text.position.y}%)`,
                transform: `translate(-50%, -50%) scale(${1 / zoom})`, // Counter-scale text selection UI
                fontFamily: text.font, fontSize: text.size, color: text.color, whiteSpace: 'pre'
              }}
              onMouseDown={(e) => onTextDragStart(e, text)} onTouchStart={(e) => onTextDragStart(e, text)}
              onClick={(e) => { e.stopPropagation(); onSelectText(text.id); }}
            >
              {text.text}
            </div>
          ))}
          {activeTab === 'crop' && cropBox && (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-black/50" style={{
                    clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${cropBox.x}px ${cropBox.y}px, ${cropBox.x}px ${cropBox.y + cropBox.height}px, ${cropBox.x + cropBox.width}px ${cropBox.y + cropBox.height}px, ${cropBox.x + cropBox.width}px ${cropBox.y}px, ${cropBox.x}px ${cropBox.y}px)`
                }}></div>
                <div 
                    className="absolute border-2 border-white cursor-move pointer-events-auto"
                    style={{ left: cropBox.x, top: cropBox.y, width: cropBox.width, height: cropBox.height }}
                    onMouseDown={(e) => onCropDragStart(e, 'move')} onTouchStart={(e) => onCropDragStart(e, 'move')}
                >
                    <div onMouseDown={(e) => onCropDragStart(e, 'top-left')} onTouchStart={(e) => onCropDragStart(e, 'top-left')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize" style={{transform: `scale(${1/zoom})`}}/>
                    <div onMouseDown={(e) => onCropDragStart(e, 'top-right')} onTouchStart={(e) => onCropDragStart(e, 'top-right')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize" style={{transform: `scale(${1/zoom})`}}/>
                    <div onMouseDown={(e) => onCropDragStart(e, 'bottom-left')} onTouchStart={(e) => onCropDragStart(e, 'bottom-left')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize" style={{transform: `scale(${1/zoom})`}}/>
                    <div onMouseDown={(e) => onCropDragStart(e, 'bottom-right')} onTouchStart={(e) => onCropDragStart(e, 'bottom-right')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize" style={{transform: `scale(${1/zoom})`}}/>
                </div>
            </div>
          )}
        </div>
      )}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button onClick={() => handleZoomButtonClick(1.2)} className="w-10 h-10 rounded-full bg-gray-900/50 hover:bg-gray-900/80 text-white flex items-center justify-center transition-colors">
                <ZoomInIcon className="w-6 h-6"/>
            </button>
            <button onClick={() => handleZoomButtonClick(0.8)} className="w-10 h-10 rounded-full bg-gray-900/50 hover:bg-gray-900/80 text-white flex items-center justify-center transition-colors">
                <ZoomOutIcon className="w-6 h-6"/>
            </button>
      </div>
    </div>
  );
};

export default ImageViewer;