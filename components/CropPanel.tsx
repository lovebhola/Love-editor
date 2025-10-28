import React from 'react';
import { CropIcon } from './icons';

interface CropPanelProps {
    onApplyCrop: () => void;
}

const CropPanel: React.FC<CropPanelProps> = ({ onApplyCrop }) => {
    return (
        <div className="w-full bg-gray-800 p-6 flex flex-col items-center justify-center h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Crop Image</h3>
            <p className="text-sm text-gray-400 text-center mb-6">
                Drag the handles on the image to select the area you want to keep.
            </p>
            <button
                onClick={onApplyCrop}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
                <CropIcon className='w-5 h-5'/>
                Apply Crop
            </button>
        </div>
    );
};

export default CropPanel;
