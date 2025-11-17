
import React, { useState, useCallback } from 'react';
import { generatePostContent, generateImagePrompt, generatePostImage, generateSpeech } from './services/geminiService';
import { AspectRatio, LogoPosition } from './types';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';

const SaturnixLogo = () => (
    <svg
        viewBox="0 0 64 64"
        className="h-14 w-14 sm:h-16 sm:w-16"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <defs>
            <linearGradient id="planet-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
        </defs>
        <ellipse 
            cx="32" 
            cy="32" 
            rx="28" 
            ry="12" 
            stroke="url(#ring-gradient)" 
            strokeWidth="5" 
            fill="none" 
            transform="rotate(-25 32 32)"
        />
        <circle cx="32" cy="32" r="20" fill="url(#planet-gradient)" />
    </svg>
);


const App: React.FC = () => {
    const [topic, setTopic] = useState<string>('');
    const [audience, setAudience] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [logo, setLogo] = useState<string | null>(null);
    const [logoPosition, setLogoPosition] = useState<LogoPosition>('bottom-right');
    const [imageDescription, setImageDescription] = useState<string>('');
    const [imageTextOverlay, setImageTextOverlay] = useState<string>('');
    
    const [generatedDescription, setGeneratedDescription] = useState<string>('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
    
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const applyLogoToImage = useCallback(
        async (baseImageUrl: string, logoUrl: string, position: LogoPosition): Promise<string> => {
            return new Promise((resolve, reject) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }

                const baseImage = new Image();
                baseImage.crossOrigin = 'anonymous';
                baseImage.onload = () => {
                    canvas.width = baseImage.naturalWidth;
                    canvas.height = baseImage.naturalHeight;
                    ctx.drawImage(baseImage, 0, 0);

                    const logoImage = new Image();
                    logoImage.crossOrigin = 'anonymous';
                    logoImage.onload = () => {
                        const logoMaxWidth = canvas.width * 0.15;
                        const logoMaxHeight = canvas.height * 0.15;
                        const scale = Math.min(logoMaxWidth / logoImage.naturalWidth, logoMaxHeight / logoImage.naturalHeight);
                        const logoWidth = logoImage.naturalWidth * scale;
                        const logoHeight = logoImage.naturalHeight * scale;
                        const margin = canvas.width * 0.02;

                        let x = 0;
                        let y = 0;

                        switch (position) {
                            case 'top-left':
                                x = margin;
                                y = margin;
                                break;
                            case 'top-right':
                                x = canvas.width - logoWidth - margin;
                                y = margin;
                                break;
                            case 'bottom-left':
                                x = margin;
                                y = canvas.height - logoHeight - margin;
                                break;
                            case 'bottom-right':
                                x = canvas.width - logoWidth - margin;
                                y = canvas.height - logoHeight - margin;
                                break;
                        }
                        ctx.drawImage(logoImage, x, y, logoWidth, logoHeight);
                        resolve(canvas.toDataURL('image/png'));
                    };
                    logoImage.onerror = () => reject(new Error('Failed to load logo image.'));
                    logoImage.src = logoUrl;
                };
                baseImage.onerror = () => reject(new Error('Failed to load base image.'));
                baseImage.src = baseImageUrl;
            });
        },
        []
    );

    const handleGenerate = useCallback(async () => {
        if (!topic || !audience) {
            setError('Please provide both a topic and a target audience.');
            return;
        }
        setIsGenerating(true);
        setError('');
        setGeneratedDescription('');
        setGeneratedImageUrl('');

        try {
            const descriptionPromise = generatePostContent(topic, audience);

            const imageGenerationProcess = async () => {
                let finalImagePrompt: string;

                if (imageDescription.trim()) {
                    finalImagePrompt = imageDescription;
                } else {
                    finalImagePrompt = await generateImagePrompt(topic, audience);
                }

                if (imageTextOverlay.trim()) {
                    finalImagePrompt += ` The image must prominently feature the text: "${imageTextOverlay}". The text should be stylish, legible, and well-integrated into the image's composition.`;
                }

                return await generatePostImage(finalImagePrompt, aspectRatio);
            };

            const imagePromise = imageGenerationProcess();

            const [description, baseImageUrl] = await Promise.all([descriptionPromise, imagePromise]);
            
            setGeneratedDescription(description);

            if (baseImageUrl && logo) {
                const finalImageUrl = await applyLogoToImage(baseImageUrl, logo, logoPosition);
                setGeneratedImageUrl(finalImageUrl);
            } else {
                setGeneratedImageUrl(baseImageUrl);
            }
        } catch (e) {
            console.error(e);
            setError('An error occurred while generating the post. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    }, [topic, audience, aspectRatio, logo, logoPosition, applyLogoToImage, imageDescription, imageTextOverlay]);

    const handleSpeak = useCallback(async () => {
        if (!generatedDescription || isSpeaking) return;

        setIsSpeaking(true);
        try {
            const audioData = await generateSpeech(generatedDescription);
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            const decode = (base64: string) => {
                const binaryString = atob(base64);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return bytes;
            }

            const decodeAudioData = async (
                data: Uint8Array,
                ctx: AudioContext,
            ): Promise<AudioBuffer> => {
                const sampleRate = 24000; 
                const numChannels = 1;
                const dataInt16 = new Int16Array(data.buffer);
                const frameCount = dataInt16.length / numChannels;
                const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

                for (let channel = 0; channel < numChannels; channel++) {
                    const channelData = buffer.getChannelData(channel);
                    for (let i = 0; i < frameCount; i++) {
                        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
                    }
                }
                return buffer;
            }
            
            const audioBuffer = await decodeAudioData(decode(audioData), audioContext);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
            source.onended = () => setIsSpeaking(false);

        } catch (e) {
            console.error(e);
            setError('Could not play audio.');
            setIsSpeaking(false);
        }
    }, [generatedDescription, isSpeaking]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8 sm:mb-12 animate-fadeIn">
                    <div className="flex justify-center items-center gap-4 mb-4 animate-pulse-logo">
                        <SaturnixLogo />
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text animate-aurora">
                            Saturnix AI
                        </h1>
                    </div>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        Craft professional posts with AI-powered descriptions and images in seconds.
                    </p>
                </header>

                <main className="space-y-8">
                     <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <InputSection 
                            topic={topic}
                            setTopic={setTopic}
                            audience={audience}
                            setAudience={setAudience}
                            aspectRatio={aspectRatio}
                            setAspectRatio={setAspectRatio}
                            imageDescription={imageDescription}
                            setImageDescription={setImageDescription}
                            imageTextOverlay={imageTextOverlay}
                            setImageTextOverlay={setImageTextOverlay}
                            logo={logo}
                            setLogo={setLogo}
                            logoPosition={logoPosition}
                            setLogoPosition={setLogoPosition}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm animate-fadeIn" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        <OutputSection 
                            description={generatedDescription}
                            imageUrl={generatedImageUrl}
                            isLoading={isGenerating}
                            isSpeaking={isSpeaking}
                            onSpeak={handleSpeak}
                        />
                    </div>
                </main>
                
                <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                    <p>Powered by Rutvik M.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
