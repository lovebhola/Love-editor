import React from 'react';
import { UploadIcon, HeartIcon } from './icons';

interface WelcomeScreenProps {
    onUploadClick: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onUploadClick }) => {
    return (
        <div className="text-center p-8 max-w-md mx-auto">
            <HeartIcon className="w-24 h-24 text-pink-500 mx-auto mb-6"/>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome to Love Editor</h2>
            <p className="text-gray-400 mb-8">
                The power of generative AI for seamless photo editing. Upload an image to get started.
            </p>
            <button
                onClick={onUploadClick}
                className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-full bg-pink-600 hover:bg-pink-700 text-white transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-400/50"
            >
                <UploadIcon className="w-6 h-6" />
                Upload Image
            </button>
        </div>
    );
};