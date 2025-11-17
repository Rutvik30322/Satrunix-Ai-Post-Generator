
import React from 'react';
import { AspectRatio, LogoPosition } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Loader } from './ui/Loader';
import { Textarea } from './ui/Textarea';

interface InputSectionProps {
    topic: string;
    setTopic: (value: string) => void;
    audience: string;
    setAudience: (value: string) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (value: AspectRatio) => void;
    imageDescription: string;
    setImageDescription: (value: string) => void;
    imageTextOverlay: string;
    setImageTextOverlay: (value: string) => void;
    logo: string | null;
    setLogo: (value: string | null) => void;
    logoPosition: LogoPosition;
    setLogoPosition: (value: LogoPosition) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16"];

const PositionIcon: React.FC<{position: 'tl' | 'tr' | 'bl' | 'br'}> = ({ position }) => {
    let x = "2", y = "2";
    if (position === 'tr') { x = "10"; y = "2"; }
    if (position === 'bl') { x = "2"; y = "10"; }
    if (position === 'br') { x = "10"; y = "10"; }
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 hidden sm:block">
            <rect width="16" height="16" rx="2" className="stroke-current opacity-30"/>
            <rect x={x} y={y} width="4" height="4" rx="1" className="fill-current"/>
        </svg>
    )
};


const InputSection: React.FC<InputSectionProps> = ({
    topic,
    setTopic,
    audience,
    setAudience,
    aspectRatio,
    setAspectRatio,
    imageDescription,
    setImageDescription,
    imageTextOverlay,
    setImageTextOverlay,
    logo,
    setLogo,
    logoPosition,
    setLogoPosition,
    onGenerate,
    isGenerating,
}) => {

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>1. Define Your Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Topic
                        </label>
                        <Input
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., The future of AI in marketing"
                            disabled={isGenerating}
                        />
                    </div>
                    <div>
                        <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Target Audience
                        </label>
                        <Input
                            id="audience"
                            type="text"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            placeholder="e.g., Marketing professionals"
                            disabled={isGenerating}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Image Aspect Ratio
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {aspectRatios.map((ratio) => (
                            <Button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                variant={aspectRatio === ratio ? 'default' : 'outline'}
                                disabled={isGenerating}
                                className="transition-all"
                            >
                                {ratio}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Optional: Customize Image</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Provide your own prompt. If left blank, one will be generated from the topic and audience.
                        </p>
                    </div>
                    <div>
                        <label htmlFor="image-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Image Description
                        </label>
                        <Textarea
                            id="image-description"
                            value={imageDescription}
                            onChange={(e) => setImageDescription(e.target.value)}
                            placeholder="e.g., A minimalist vector art of a brain..."
                            disabled={isGenerating}
                            rows={3}
                        />
                    </div>
                    <div>
                        <label htmlFor="image-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Text Overlay
                        </label>
                        <Input
                            id="image-text"
                            type="text"
                            value={imageTextOverlay}
                            onChange={(e) => setImageTextOverlay(e.target.value)}
                            placeholder="e.g., 'Innovate & Inspire'"
                            disabled={isGenerating}
                        />
                    </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Optional: Add Your Logo</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Upload a logo to be placed on the generated image. Transparent PNGs work best.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                        <div>
                            <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Logo File
                            </label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    disabled={isGenerating}
                                    className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 dark:file:text-blue-300 file:text-blue-700 hover:file:bg-blue-100 dark:hover:file:bg-blue-900"
                                />
                                {logo && (
                                    <Button variant="outline" size="default" onClick={() => {
                                        setLogo(null);
                                        const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
                                        if(fileInput) fileInput.value = "";
                                    }} disabled={isGenerating}>
                                        Clear
                                    </Button>
                                )}
                            </div>
                            {logo && (
                            <div className="mt-4 p-2 border rounded-md bg-gray-50 dark:bg-gray-700/50 inline-block">
                                <img src={logo} alt="Logo preview" className="h-16 w-16 object-contain" />
                            </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Logo Position
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'top-left', label: 'Top Left', iconPos: 'tl' },
                                    { id: 'top-right', label: 'Top Right', iconPos: 'tr' },
                                    { id: 'bottom-left', label: 'Bottom Left', iconPos: 'bl' },
                                    { id: 'bottom-right', label: 'Bottom Right', iconPos: 'br' },
                                ].map(({id, label, iconPos}) => (
                                    <Button
                                        key={id}
                                        onClick={() => setLogoPosition(id as LogoPosition)}
                                        variant={logoPosition === id ? 'default' : 'outline'}
                                        disabled={isGenerating || !logo}
                                        className="transition-all justify-start text-xs sm:text-sm"
                                    >
                                        <PositionIcon position={iconPos as any} />
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                <Button onClick={onGenerate} disabled={isGenerating || !topic || !audience} className="w-full sm:w-auto" size="lg">
                    {isGenerating ? (
                        <div className="flex items-center">
                            <Loader className="mr-2" />
                            Generating...
                        </div>
                    ) : (
                        'Generate Post'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};

export default InputSection;