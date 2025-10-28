import React from 'react';
import { EyeIcon, MagicIcon } from './icons';
import { EditorTab } from '../types';

interface AppFooterProps {
    activeTab: EditorTab;
    isProcessing: boolean;
    brushSize: number;
    onBrushSizeChange: (size: number) => void;
    onApplyRemove: () => void;
    onPreviewChange: (isPreviewing: boolean) => void;
}


const AppFooter: React.FC<AppFooterProps> = ({ 
    activeTab, 
    isProcessing, 
    brushSize, 
    onBrushSizeChange, 
    onApplyRemove,
    onPreviewChange
}) => {
  return (
    <div className="flex-shrink-0 bg-gray-900 p-3 flex items-center justify-center gap-6 border-t border-gray-700 h-[72px]">
      {activeTab === 'remove' && (
        <>
            <div className='flex items-center gap-2'>
                <label htmlFor="brushSize" className="text-sm">Brush Size:</label>
                <input
                    type="range"
                    id="brushSize"
                    min="5"
                    max="100"
                    value={brushSize}
                    onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                    disabled={isProcessing}
                    className="w-40"
                />
            </div>
            <button
                onClick={onApplyRemove}
                disabled={isProcessing}
                className="py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
                <MagicIcon className='w-5 h-5'/>
                Apply Removal
            </button>
        </>
      )}

      {activeTab !== 'remove' && (
        <button
            onMouseDown={() => onPreviewChange(true)}
            onMouseUp={() => onPreviewChange(false)}
            onMouseLeave={() => onPreviewChange(false)}
            onTouchStart={() => onPreviewChange(true)}
            onTouchEnd={() => onPreviewChange(false)}
            className="py-2 px-5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors flex items-center gap-2"
        >
            <EyeIcon className="w-5 h-5"/>
            Hold to Preview
        </button>
      )}
    </div>
  );
};

export default AppFooter;
