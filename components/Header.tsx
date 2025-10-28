import React from 'react';
import { DownloadIcon, HeartIcon, ResetIcon, UndoIcon, RedoIcon } from './icons';

interface HeaderProps {
    onDownload: () => void;
    onReset: () => void;
    canUndo: boolean;
    onUndo: () => void;
    canRedo: boolean;
    onRedo: () => void;
    imageName: string | null;
}

const Header: React.FC<HeaderProps> = ({ 
    onDownload, 
    onReset,
    canUndo,
    onUndo,
    canRedo,
    onRedo,
    imageName
}) => {
    return (
        <header className="flex-shrink-0 bg-gray-900 p-3 flex items-center justify-between border-b border-gray-700 h-[60px]">
            <div className="flex items-center gap-3">
                <HeartIcon className="w-8 h-8 text-pink-500" />
                <h1 className="text-xl font-bold text-white">Love Editor</h1>
                {imageName && <span className="text-sm text-gray-400 hidden md:block">{imageName}</span>}
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onUndo} disabled={!canUndo} className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <UndoIcon className="w-5 h-5 text-white" />
                </button>
                <button onClick={onRedo} disabled={!canRedo} className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <RedoIcon className="w-5 h-5 text-white" />
                </button>
                <div className="w-px h-6 bg-gray-700 mx-2"></div>
                <button onClick={onReset} className="p-2 rounded-md hover:bg-gray-700">
                    <ResetIcon className="w-5 h-5 text-white" />
                </button>
                <button onClick={onDownload} className="py-2 px-4 rounded-lg bg-pink-600 hover:bg-pink-700 text-white transition-colors flex items-center gap-2">
                    <DownloadIcon className="w-5 h-5" />
                    Download
                </button>
            </div>
        </header>
    );
};

export default Header;
