
import React from 'react';
import { Button } from './ui/Button';

interface ImagePreviewModalProps {
    imageUrl: string;
    onClose: () => void;
    onDownload: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose, onDownload }) => {
    // Handle clicks on the modal content to prevent closing when clicking the image/buttons
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all"
                onClick={handleContentClick}
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Image Preview</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        aria-label="Close modal"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4 flex-grow flex items-center justify-center overflow-auto">
                    <img 
                        src={imageUrl} 
                        alt="Generated preview" 
                        className="max-h-full max-w-full object-contain rounded-md"
                    />
                </div>
                <div className="flex justify-end p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <Button onClick={onDownload}>
                        Download Image
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImagePreviewModal;
