
import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePostContent = async (topic: string, audience: string): Promise<string> => {
    const prompt = `
        Generate a professional and engaging LinkedIn post.
        
        **Topic:** ${topic}
        **Target Audience:** ${audience}
        
        The post should be:
        - Written in a professional, yet approachable tone.
        - Well-structured, possibly using bullet points or numbered lists for clarity.
        - Include relevant, popular hashtags to increase reach.
        - End with a call-to-action or a question to encourage engagement.
        - Do not include any preamble like "Here is a LinkedIn post:". Just provide the post content itself.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating post content:", error);
        throw new Error("Failed to generate post description.");
    }
};

/**
 * Generates a detailed, creative prompt for the image generation model.
 */
export const generateImagePrompt = async (topic: string, audience: string): Promise<string> => {
    const prompt = `
        Based on the following topic and target audience for a LinkedIn post, generate a detailed and creative prompt for an AI image generator.
        The prompt should describe a visually compelling image that is professional, symbolic, and engaging for the specified audience.
        Describe the desired style (e.g., minimalist, photorealistic, abstract), composition, color palette, and mood.
        The final output should be ONLY the prompt itself, without any extra text, labels, or quotation marks.

        **Topic:** "${topic}"
        **Target Audience:** ${audience}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // Add a prefix to give context to the image generation model.
        return `A professional, visually appealing image for a LinkedIn post: ${response.text}`;
    } catch (error) {
        console.error("Error generating image prompt:", error);
        // Fallback to a simpler prompt if the generation fails
        return `A professional, visually appealing image for a LinkedIn post about "${topic}" targeting ${audience}. The image should be symbolic and abstract, suitable for a corporate audience.`;
    }
};


export const generatePostImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating post image:", error);
        throw new Error("Failed to generate post image.");
    }
};


export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech.");
    }
}