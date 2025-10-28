import React from 'react';
import { EditState } from '../types';

interface AdjustPanelProps {
    edits: EditState;
    onEditChange: (edits: Partial<EditState>) => void;
}

type SliderControl = {
    key: keyof EditState;
    label: string;
    min: number;
    max: number;
    step: number;
};

const controls: SliderControl[] = [
    { key: 'brightness', label: 'Brightness', min: 0, max: 200, step: 1 },
    { key: 'contrast', label: 'Contrast', min: 0, max: 200, step: 1 },
    { key: 'saturation', label: 'Saturation', min: 0, max: 200, step: 1 },
    { key: 'exposure', label: 'Exposure', min: -100, max: 100, step: 1 },
    { key: 'warmth', label: 'Warmth', min: -100, max: 100, step: 1 },
    { key: 'highlights', label: 'Highlights', min: -100, max: 100, step: 1 },
    { key: 'shadows', label: 'Shadows', min: -100, max: 100, step: 1 },
    { key: 'sepia', label: 'Sepia', min: 0, max: 100, step: 1 },
    { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, step: 1 },
];

const AdjustPanel: React.FC<AdjustPanelProps> = ({ edits, onEditChange }) => {
    return (
        <div className="w-full bg-gray-800 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {controls.map(({ key, label, min, max, step }) => (
                    <div key={key}>
                        <label htmlFor={key} className="flex justify-between items-center text-sm text-gray-300 mb-1">
                            <span>{label}</span>
                            <span>{edits[key]}</span>
                        </label>
                        <input
                            type="range"
                            id={key}
                            name={key}
                            min={min}
                            max={max}
                            step={step}
                            value={edits[key]}
                            onChange={(e) => onEditChange({ [key]: Number(e.target.value) })}
                            className="w-full"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdjustPanel;
