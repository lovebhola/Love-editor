import React from 'react';
import { TextItem } from '../types';
import { Trash2Icon } from './icons';

interface TextPanelProps {
    selectedText: TextItem | undefined;
    onAddText: () => void;
    onUpdateText: (id: string, updates: Partial<TextItem>) => void;
    onDeleteText: (id: string) => void;
    onUpdateTextAndRecordHistory: () => void;
}

const fonts = ['Roboto', 'Montserrat', 'Lobster', 'Arial', 'Georgia', 'Courier New'];

const TextPanel: React.FC<TextPanelProps> = ({ selectedText, onAddText, onUpdateText, onDeleteText, onUpdateTextAndRecordHistory }) => {
    return (
        <div className="w-full bg-gray-800 p-6 flex flex-col h-full">
            <div className="flex-grow space-y-6">
                <button
                    onClick={onAddText}
                    className="w-full py-2 px-4 rounded-lg bg-pink-600 hover:bg-pink-700 text-white transition-colors"
                >
                    Add New Text
                </button>

                {selectedText && (
                    <div className="space-y-4 border-t border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold text-white">Edit Text</h3>
                        <div>
                            <label htmlFor="text-content" className="block text-sm text-gray-400 mb-1">Content</label>
                            <textarea
                                id="text-content"
                                value={selectedText.text}
                                onChange={(e) => onUpdateText(selectedText.id, { text: e.target.value })}
                                onBlur={onUpdateTextAndRecordHistory}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label htmlFor="font-family" className="block text-sm text-gray-400 mb-1">Font Family</label>
                            <select
                                id="font-family"
                                value={selectedText.font}
                                onChange={(e) => {
                                    onUpdateText(selectedText.id, { font: e.target.value });
                                    onUpdateTextAndRecordHistory();
                                }}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                            >
                                {fonts.map(font => <option key={font} value={font}>{font}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="font-size" className="block text-sm text-gray-400 mb-1">Size</label>
                                <input
                                    type="number"
                                    id="font-size"
                                    value={selectedText.size}
                                    onChange={(e) => onUpdateText(selectedText.id, { size: Number(e.target.value) })}
                                    onBlur={onUpdateTextAndRecordHistory}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="font-color" className="block text-sm text-gray-400 mb-1">Color</label>
                                <input
                                    type="color"
                                    id="font-color"
                                    value={selectedText.color}
                                    onChange={(e) => onUpdateText(selectedText.id, { color: e.target.value })}
                                    onBlur={onUpdateTextAndRecordHistory}
                                    className="w-full h-10 bg-gray-900 border border-gray-700 rounded-md p-1"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {selectedText && (
                <div className="flex-shrink-0 pt-4 border-t border-gray-700">
                    <button
                        onClick={() => onDeleteText(selectedText.id)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 transition-colors"
                    >
                       <Trash2Icon className="w-5 h-5"/>
                        Delete Text
                    </button>
                </div>
            )}
        </div>
    );
};

export default TextPanel;
