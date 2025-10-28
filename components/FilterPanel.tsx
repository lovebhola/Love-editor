import React from 'react';
import { Filter } from '../types';

interface FilterPanelProps {
    onApplyFilter: (filter: Filter) => void;
    thumbnail: string;
}

const FILTERS: Filter[] = [
    { name: 'None', edits: {} },
    { name: 'Clarendon', edits: { contrast: 120, saturation: 125 } },
    { name: 'Gingham', edits: { brightness: 105, warmth: -10 } },
    { name: 'Moon', edits: { grayscale: 100, contrast: 110, brightness: 110 } },
    { name: 'Lark', edits: { contrast: 90, saturation: 110, brightness: 120 } },
    { name: 'Reyes', edits: { sepia: 22, brightness: 110, contrast: 85, saturation: 75 } },
    { name: 'Juno', edits: { contrast: 110, brightness: 105, saturation: 115, warmth: 10 } },
];

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilter, thumbnail }) => {
    
    const getFilterStyle = (filter: Filter): React.CSSProperties => {
        const edits = filter.edits;
        return {
            filter: `
                brightness(${edits.brightness ?? 100}%)
                contrast(${edits.contrast ?? 100}%)
                saturate(${edits.saturation ?? 100}%)
                sepia(${edits.sepia ?? 0}%)
                grayscale(${edits.grayscale ?? 0}%)
            `,
        };
    }
    
    return (
        <div className="w-full bg-gray-800 p-4 overflow-y-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {FILTERS.map((filter) => (
                    <button
                        key={filter.name}
                        onClick={() => onApplyFilter(filter)}
                        className="text-center group"
                    >
                        <div className="overflow-hidden rounded-md border-2 border-transparent group-hover:border-pink-500 transition-colors">
                           <img 
                             src={thumbnail} 
                             alt={filter.name} 
                             className="w-full h-auto object-cover"
                             style={getFilterStyle(filter)}
                           />
                        </div>
                        <p className="mt-2 text-sm text-gray-300 group-hover:text-white">{filter.name}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterPanel;
