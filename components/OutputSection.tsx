
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Loader } from './ui/Loader';
import useCopyToClipboard from '../hooks/useCopyToClipboard';
import ImagePreviewModal from './ImagePreviewModal';

interface OutputSectionProps {
    description: string;
    imageUrl: string;
    isLoading: boolean;
    isSpeaking: boolean;
    onSpeak: () => void;
}

const OutputSection: React.FC<OutputSectionProps> = ({ description, imageUrl, isLoading, isSpeaking, onSpeak }) => {
    const [isCopied, copy] = useCopyToClipboard();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'saturnix-ai-post.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formattedDescription = description.split('\n').map((line, index) => {
        if (line.trim().startsWith('#')) {
            return <p key={index} className="text-blue-400">{line}</p>;
        }
        return <p key={index}>{line || <br />}</p>;
    });

    const hasContent = description || imageUrl;

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>2. Your Generated Post</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-96">
                    <Loader className="h-12 w-12 text-blue-500" />
                    <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400 animate-pulse-text">
                        Generating your post...
                    </p>
                    <p className="text-sm text-gray-500">This may take a moment.</p>
                </CardContent>
            </Card>
        );
    }

    if (!hasContent) {
        return null;
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>2. Your Generated Post</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Generated Description</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 h-80 overflow-y-auto">
                             {formattedDescription}
                        </div>
                        <div className="flex flex-wrap gap-2">
                             <Button onClick={() => copy(description)} disabled={!description}>
                                {isCopied ? 'Copied!' : 'Copy Text'}
                            </Button>
                            <Button onClick={onSpeak} disabled={!description || isSpeaking} variant="outline">
                               {isSpeaking ? (
                                   <div className="flex items-center">
                                        <Loader className="mr-2" />
                                        Speaking...
                                   </div>
                               ) : "Speak Aloud"}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Generated Image</h3>
                        <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 flex items-center justify-center aspect-square">
                            {imageUrl ? (
                                <img 
                                    src={imageUrl} 
                                    alt="Generated for post" 
                                    className="max-h-full max-w-full object-contain rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setIsModalOpen(true)} 
                                />
                            ) : (
                                <div className="text-gray-400">No image generated.</div>
                            )}
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} disabled={!imageUrl}>
                            Preview Image
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {isModalOpen && imageUrl && (
                <ImagePreviewModal
                    imageUrl={imageUrl}
                    onClose={() => setIsModalOpen(false)}
                    onDownload={handleDownload}
                />
            )}
        </>
    );
};

export default OutputSection;