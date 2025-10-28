import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import Header from './Header';
import ImageViewer from './ImageViewer';
import EditorTabs from './EditorTabs';
import AdjustPanel from './AdjustPanel';
import FilterPanel from './FilterPanel';
import RemovePanel from './RemovePanel';
import CropPanel from './CropPanel';
import TextPanel from './TextPanel';
import AppFooter from './AppFooter';
import { EditorTab, EditState, TextItem, Filter, defaultEditState, HistoryState, CropBox } from '../types';
import { removeObjectWithGemini, removeObjectWithPrompt } from '../services/geminiService';

const HomePage: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<EditorTab>('adjust');
    const [edits, setEdits] = useState<EditState>(defaultEditState);
    const [texts, setTexts] = useState<TextItem[]>([]);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Tool-specific states
    const [brushSize, setBrushSize] = useState(30);
    const [maskImage, setMaskImage] = useState<string>('');
    const [removePrompt, setRemovePrompt] = useState('');
    const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
    const [cropBox, setCropBox] = useState<CropBox | null>(null);

    // Zoom and Pan states
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    // History for undo/redo
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const pushToHistory = useCallback((state: HistoryState) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(state);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setOriginalImage(result);
                setCurrentImage(result);
                setImageName(file.name);
                setEdits(defaultEditState);
                setTexts([]);
                setZoom(1);
                setPan({ x: 0, y: 0 });
                const initialState = { image: result, edits: defaultEditState, texts: [] };
                setHistory([initialState]);
                setHistoryIndex(0);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => { fileInputRef.current?.click(); };
    
    const handleEditsChange = (newEdits: Partial<EditState>) => {
        setEdits(prev => ({ ...prev, ...newEdits }));
    };
    
    const recordEditHistory = useCallback(() => {
        if (!currentImage) return;
        pushToHistory({ image: currentImage, edits, texts });
    }, [currentImage, edits, texts, pushToHistory]);

    const handleApplyFilter = (filter: Filter) => {
        const newEdits = { ...defaultEditState, ...filter.edits };
        setEdits(newEdits);
        if(!currentImage) return;
        pushToHistory({ image: currentImage, edits: newEdits, texts });
    };

    const handleReset = () => {
        if (originalImage) {
            setCurrentImage(originalImage);
            setEdits(defaultEditState);
            setTexts([]);
            setZoom(1);
            setPan({ x: 0, y: 0 });
            pushToHistory({ image: originalImage, edits: defaultEditState, texts: [] });
        }
    };

    const handleDownload = async () => {
        if (!currentImage) return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const img = new Image();
        img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
    
            // Apply filters
            ctx.filter = `brightness(${edits.brightness / 100}) contrast(${edits.contrast / 100}) saturate(${edits.saturation / 100}) sepia(${edits.sepia / 100}) grayscale(${edits.grayscale / 100})`;
            ctx.drawImage(img, 0, 0);
            
            // Apply texts
            texts.forEach(text => {
                ctx.font = `${text.size}px ${text.font}`;
                ctx.fillStyle = text.color;
                const x = (text.position.x / 100) * canvas.width;
                const y = (text.position.y / 100) * canvas.height;
                ctx.fillText(text.text, x, y);
            });
    
            // Trigger download
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `edited-${imageName || 'image.png'}`;
            link.click();
        };
        img.src = currentImage;
    };
    
    const handleApplyRemove = async (usePrompt: boolean) => {
        if (!currentImage || (usePrompt && !removePrompt) || (!usePrompt && !maskImage)) return;
        setIsProcessing(true);
        setError(null);
        try {
            const newImage = usePrompt
                ? await removeObjectWithPrompt(currentImage, removePrompt)
                : await removeObjectWithGemini(currentImage, maskImage);
            setCurrentImage(newImage);
            setRemovePrompt('');
            pushToHistory({ image: newImage, edits, texts });
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const state = history[newIndex];
            setCurrentImage(state.image); setEdits(state.edits); setTexts(state.texts);
            setHistoryIndex(newIndex);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const state = history[newIndex];
            setCurrentImage(state.image); setEdits(state.edits); setTexts(state.texts);
            setHistoryIndex(newIndex);
        }
    };

    // Text Handlers
    const handleAddText = () => {
        const newText: TextItem = {
            id: `text-${Date.now()}`, text: 'Hello World', font: 'Roboto', size: 40, color: '#FFFFFF',
            position: { x: 50, y: 50 }
        };
        const newTexts = [...texts, newText];
        setTexts(newTexts);
        setSelectedTextId(newText.id);
        if(!currentImage) return;
        pushToHistory({ image: currentImage, edits, texts: newTexts });
    };

    const handleUpdateText = (id: string, updates: Partial<TextItem>) => {
        setTexts(texts.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    // FIX: Add a specific handler for text position changes to match the prop type of ImageViewer.
    const handleTextPositionChange = (id: string, position: { x: number, y: number }) => {
        handleUpdateText(id, { position });
    };

    const handleDeleteText = (id: string) => {
        const newTexts = texts.filter(t => t.id !== id);
        setTexts(newTexts);
        if (selectedTextId === id) setSelectedTextId(null);
        if(!currentImage) return;
        pushToHistory({ image: currentImage, edits, texts: newTexts });
    };

    // Crop Handlers
    const handleTabChange = (tab: EditorTab) => {
        if (tab === 'crop' && currentImage) {
            const img = new Image();
            img.onload = () => {
                 setCropBox({ x: 0, y: 0, width: img.width, height: img.height });
            };
            img.src = currentImage;
        } else {
            setCropBox(null);
        }
        setActiveTab(tab);
    }
    
    const handleApplyCrop = () => {
        if (!currentImage || !cropBox) return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const img = new Image();
        img.onload = () => {
            canvas.width = cropBox.width;
            canvas.height = cropBox.height;
            ctx.drawImage(img, cropBox.x, cropBox.y, cropBox.width, cropBox.height, 0, 0, cropBox.width, cropBox.height);
            const newImage = canvas.toDataURL('image/png');
            setCurrentImage(newImage);
            setCropBox(null);
            setActiveTab('adjust');
            pushToHistory({ image: newImage, edits, texts });
        }
        img.src = currentImage;
    };
    
    const renderActivePanel = () => {
        const selectedText = texts.find(t => t.id === selectedTextId);
        switch (activeTab) {
            case 'adjust': return <AdjustPanel edits={edits} onEditChange={handleEditsChange} />;
            case 'filter': return <FilterPanel onApplyFilter={handleApplyFilter} thumbnail={currentImage || ''} />;
            case 'remove': return <RemovePanel prompt={removePrompt} setPrompt={setRemovePrompt} onApplyWithPrompt={() => handleApplyRemove(true)} isProcessing={isProcessing}/>;
            case 'crop': return <CropPanel onApplyCrop={handleApplyCrop} />;
            case 'text': return <TextPanel selectedText={selectedText} onAddText={handleAddText} onUpdateText={handleUpdateText} onDeleteText={handleDeleteText} onUpdateTextAndRecordHistory={recordEditHistory}/>;
            default: return null;
        }
    };

    return (
        <div className="bg-gray-800 text-white h-screen w-screen flex flex-col font-sans">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
            {!currentImage ? (
                <div className="flex-grow flex items-center justify-center">
                    <WelcomeScreen onUploadClick={handleUploadClick} />
                </div>
            ) : (
                <>
                    <Header onDownload={handleDownload} onReset={handleReset} canUndo={historyIndex > 0} onUndo={handleUndo} canRedo={historyIndex < history.length - 1} onRedo={handleRedo} imageName={imageName} />
                    <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                        <main className="flex-grow flex flex-col bg-black">
                            {error && <div className="p-2 text-center bg-red-500 text-white">{error}</div>}
                            {isProcessing && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/50 p-4 rounded-lg">Processing with AI...</div>}
                            <ImageViewer 
                                imageSrc={currentImage}
                                edits={edits} texts={texts} isPreviewing={isPreviewing} activeTab={activeTab} brushSize={brushSize} onMaskChange={setMaskImage}
                                selectedTextId={selectedTextId} onSelectText={setSelectedTextId} onTextPositionChange={handleTextPositionChange}
                                cropBox={cropBox} onCropBoxChange={setCropBox}
                                zoom={zoom} onZoomChange={setZoom} pan={pan} onPanChange={setPan}
                            />
                            <AppFooter activeTab={activeTab} isProcessing={isProcessing} brushSize={brushSize} onBrushSizeChange={setBrushSize} onApplyRemove={() => handleApplyRemove(false)} onPreviewChange={setIsPreviewing} />
                        </main>
                        <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-gray-900 border-t md:border-t-0 md:border-l border-gray-700">
                           <EditorTabs activeTab={activeTab} onTabChange={handleTabChange} />
                           <div className="flex-grow overflow-y-auto" onMouseUp={recordEditHistory} onTouchEnd={recordEditHistory}>
                                {renderActivePanel()}
                           </div>
                        </aside>
                    </div>
                </>
            )}
        </div>
    );
};

export default HomePage;