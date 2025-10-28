import React from 'react';
import { EditorTab } from '../types';
import { AdjustmentsIcon, FilterIcon, RemoveIcon, CropIcon, TextIcon } from './icons';

interface EditorTabsProps {
    activeTab: EditorTab;
    onTabChange: (tab: EditorTab) => void;
}

const TABS: { id: EditorTab; name: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'adjust', name: 'Adjust', icon: AdjustmentsIcon },
    { id: 'filter', name: 'Filter', icon: FilterIcon },
    { id: 'remove', name: 'Remove', icon: RemoveIcon },
    { id: 'crop', name: 'Crop', icon: CropIcon },
    { id: 'text', name: 'Text', icon: TextIcon },
];

const EditorTabs: React.FC<EditorTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="w-full bg-gray-900 flex justify-center border-b border-gray-700">
            <div className="flex items-center gap-4 px-4">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex flex-col items-center gap-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors
                            ${activeTab === tab.id
                                ? 'border-pink-500 text-pink-500'
                                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                            }`}
                    >
                        <tab.icon className="w-6 h-6" />
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EditorTabs;
