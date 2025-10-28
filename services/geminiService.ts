
import { GoogleGenAI } from "@google/genai";
import { BookAnglesData, ContentFormat, GeneratedHook } from '../types';
import { BOOK_ANGLES } from "../constants";

// IMPORTANT: This assumes the API_KEY is set in the environment.
// Do not add any UI for managing this key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-pro';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const extractBookAngles = async (bookText?: string, bookFile?: File): Promise<BookAnglesData> => {
  const prompt = `Analyze this book and extract the following marketing angles. Be SPECIFIC and compelling - avoid generic descriptions. Return your analysis in this EXACT format with clear labels:

BOOK_TITLE: [Extract or infer the book title]
READER_FANTASY: [What dream/desire does this story fulfill? Be specific - e.g., "escaping a soul-crushing corporate job to find purpose in art"]
EMOTIONAL_WRECKAGE: [The most gut-wrenching, tear-jerking moment that destroys readers emotionally. Be visceral and specific.]
IDENTITY_MIRROR: [Who will see themselves in this story? Be specific about demographics, life situations, or emotional states - e.g., "burnt-out millennials questioning their life choices"]
CULTURE_HOOK: [Unique cultural mashups or references - e.g., "Greek mythology meets cyberpunk" or "K-drama tropes in Victorian England"]
PERSONAL_WOUND: [The painful human truth or vulnerability at the heart of this story, even if it's fiction]
CINEMATIC_MOMENT: [The most visual, movie-worthy scene that would look amazing on screen. Describe it vividly.]
WHAT_IF_SETUP: [The high-concept premise in one sentence - e.g., "What if your soulmate could only meet you once?"]
TROPE_TWIST: [How does this book subvert or twist familiar tropes? - e.g., "The chosen one refuses the call and has to be dragged kicking and screaming"]
SHOCK_FACTOR: [The twist, revelation, or moment that makes readers gasp out loud. Be specific but don't spoil everything.]

Make each angle 1-3 sentences. Be SPECIFIC, VISCERAL, and EMOTIONALLY COMPELLING. Avoid generic phrases like "journey of self-discovery" - instead say what KIND of self-discovery and WHY it matters.
`;

  let contents: any;
  if (bookFile) {
    const filePart = await fileToGenerativePart(bookFile);
    contents = { parts: [filePart, { text: prompt }] };
  } else if (bookText) {
    contents = `${prompt}\n\n[BOOK TEXT FOLLOWS]\n\n${bookText.substring(0, 100000)}`;
  } else {
    throw new Error("No book text or file provided");
  }

  const response = await ai.models.generateContent({
    model,
    contents,
  });

  const text = response.text;
  const parsedAngles: BookAnglesData = {};
  
  const keyMap: { [key: string]: string } = {
    'BOOK_TITLE': 'bookTitle',
    'READER_FANTASY': 'readerFantasy',
    'EMOTIONAL_WRECKAGE': 'emotionalWreckage',
    'IDENTITY_MIRROR': 'identityMirror',
    'CULTURE_HOOK': 'cultureHook',
    'PERSONAL_WOUND': 'personalWound',
    'CINEMATIC_MOMENT': 'cinematicMoment',
    'WHAT_IF_SETUP': 'whatIfSetup',
    'TROPE_TWIST': 'tropeTwist',
    'SHOCK_FACTOR': 'shockFactor',
  };

  const lines = text.split('\n');
  lines.forEach(line => {
    const parts = line.split(':');
    if (parts.length > 1) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      const mappedKey = keyMap[key];
      if (mappedKey) {
        parsedAngles[mappedKey] = value;
      }
    }
  });

  const finalAngles: BookAnglesData = {};
  BOOK_ANGLES.forEach(angle => {
      finalAngles[angle.id] = parsedAngles[angle.id] || '';
  });

  return finalAngles;
};

export const generateHooksWithAI = async (
    angles: BookAnglesData, 
    formats: ContentFormat[], 
    bookText: string
): Promise<GeneratedHook[]> => {
    const anglesText = Object.entries(angles)
        .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
        .join('\n');

    const formatsText = formats.map(f => `- ${f.name}`).join('\n');

    const prompt = `You are a book marketing expert. I need you to create compelling, platform-ready content hooks for promoting my book.

BOOK DETAILS:
${anglesText}

BOOK EXCERPT (for context):
${bookText.substring(0, 10000)}

CONTENT FORMATS TO USE:
${formatsText}

INSTRUCTIONS:
For EACH format listed above, create 3 unique variations of content hooks. Each hook should:
1. Be platform-ready for TikTok/Instagram/Reels (under 150 characters when possible)
2. Reference SPECIFIC details from the book angles or excerpt
3. Be emotionally engaging and visceral (not generic)
4. Match the format's style and purpose
5. Use the exact book details, character names, plot points from the content provided
6. Make each hook feel like it came from someone who ACTUALLY READ and LOVED this specific book.

Format your response EXACTLY like this for EACH hook, with each hook on a new set of lines:
FORMAT: [Format Name]
VARIATION: [1, 2, or 3]
CATEGORY: [The hook category]
HOOK: [The actual hook content - be specific and compelling]
---`;

    const response = await ai.models.generateContent({ model, contents: prompt });
    const text = response.text;
    
    const hooks: GeneratedHook[] = [];
    const hookBlocks = text.split('---').filter(b => b.trim() !== '');

    for (const block of hookBlocks) {
        const lines = block.trim().split('\n');
        try {
            const formatName = lines.find(l => l.startsWith('FORMAT:'))?.split(':')[1].trim() || '';
            const variation = parseInt(lines.find(l => l.startsWith('VARIATION:'))?.split(':')[1].trim() || '1', 10);
            const category = lines.find(l => l.startsWith('CATEGORY:'))?.split(':')[1].trim() || '';
            const hookText = lines.find(l => l.startsWith('HOOK:'))?.split(':').slice(1).join(':').trim() || '';
            if (formatName && hookText) {
                hooks.push({ formatName, variation, category, hookText });
            }
        } catch (e) {
            console.error("Error parsing hook block:", block, e);
        }
    }

    return hooks;
};

export const generateScriptWithAI = async (
    angles: BookAnglesData,
    bookText: string,
    hook: string,
    formatName: string,
    category: string,
    length: string,
    platform: string
): Promise<string> => {
    const anglesText = Object.entries(angles)
        .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
        .join('\n');
    
    const prompt = `
You are a video marketing scriptwriter specializing in book promotion AND AI video generation. Create a COMPLETE ${length}-second video script for ${platform} with detailed shot-by-shot prompts for AI video generators (like Runway, Pika, or Kling AI).

BOOK DETAILS:
${anglesText}

BOOK EXCERPT (for context):
${bookText.substring(0, 10000)}

SELECTED HOOK:
"${hook}"

FORMAT: ${formatName}
CATEGORY: ${category}

VIDEO SPECIFICATIONS:
- Length: ${length} seconds
- Platform: ${platform}
- Structure: HOOK (0-3s) -> BUILD (middle section) -> PAYOFF (emotional climax) -> CTA (final 5s)

CRITICAL REQUIREMENTS:
1. Create detailed CHARACTER DESCRIPTIONS for consistency across all shots.
2. Create detailed SCENERY/SETTING descriptions for visual continuity.
3. Write COMPLETE dialogue/voiceover for every section (not placeholders).
4. Provide shot-by-shot AI GENERATION PROMPTS with specific visual details.
5. Include timing for each shot.
6. Every AI generation prompt must be 20+ words with specific visual details.
7. Each prompt should work as a standalone instruction for an AI video generator.
8. Include camera movements (zoom in, pan right, dolly forward, etc.)
9. Make it specific to THIS book's story, characters, and scenes.
10. Make this script production-ready and specific to the book content provided!
11. YOU MUST generate between 4 and 7 shots for the COMPLETE VIDEO SCRIPT section. Do not leave it empty.

Format your response EXACTLY like this, using the delimiters to separate sections:

### CHARACTER GUIDE ###
[Describe main characters with specific visual details: age, appearance, clothing, distinctive features. Be detailed so AI generates them consistently.]

### SETTING GUIDE ###
[Describe key locations with specific details: time of day, lighting, weather, architecture, colors, mood]

### COMPLETE VIDEO SCRIPT ###
---
SHOT [N] - [NAME] ([TIMING])
VOICEOVER/DIALOGUE: [exact words to speak]
VISUAL DESCRIPTION: [what we see]
AI GENERATION PROMPT: "[Detailed prompt for AI video generator with character descriptions, setting, camera angle, movement, lighting, mood. Reference the CHARACTER GUIDE and SETTING GUIDE for consistency]"
---
[Continue with subsequent shots]

### PRODUCTION NOTES ###
- Music/Sound: [Specific recommendations]
- Text Overlays: [If needed, what text and when]
- Transitions: [How shots connect]
- Platform-Specific Tips: [[platform]-specific advice]
`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
};