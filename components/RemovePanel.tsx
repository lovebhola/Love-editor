import React from 'react';

interface RemovePanelProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onApplyWithPrompt: () => void;
    isProcessing: boolean;
}

const RemovePanel: React.FC<RemovePanelProps> = ({ prompt, setPrompt, onApplyWithPrompt, isProcessing }) => {
    return (
        <div className="w-full bg-gray-800 p-6 overflow-y-auto">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Remove with Brush</h3>
                    <p className="text-sm text-gray-400">
                        Use the brush to paint over the object you want to remove. Adjust brush size in the footer. When you're done, click "Apply Removal".
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gray-800 px-2 text-sm text-gray-400">OR</span>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Remove with Text Prompt</h3>
                    <p className="text-sm text-gray-400 mb-3">
                        Describe the object you want to remove. For example: "the person in the red shirt".
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'the car in the background'"
                            disabled={isProcessing}
                            className="flex-grow bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                        <button
                            onClick={onApplyWithPrompt}
                            disabled={isProcessing || !prompt}
                            className="py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RemovePanel;
