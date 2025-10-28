
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ActionType, ScriptOutput, Shot } from '../types';
import { generateScriptWithAI } from '../services/geminiService';
import { TipBox } from './TipBox';
import { Spinner } from './Spinner';
import { GenerateIcon, CopyIcon } from './Icons';

const ScriptDisplay: React.FC<{ script: ScriptOutput }> = ({ script }) => {
    const { dispatch } = useContext(AppContext);
    
    const copyContent = (content: string, message: string) => {
        navigator.clipboard.writeText(content);
        dispatch({ type: ActionType.ADD_TOAST, payload: { message: message, type: 'success' } });
    };

    const getFullScriptText = () => {
        let text = `Title: ${script.title}\nSubtitle: ${script.subtitle}\n\n`;
        text += `CHARACTER GUIDE:\n${script.characterGuide}\n\n`;
        text += `SETTING GUIDE:\n${script.settingGuide}\n\n`;
        text += "COMPLETE VIDEO SCRIPT:\n";
        script.videoScript.forEach(shot => {
            text += `\nSHOT ${shot.shotNumber} - ${shot.name} (${shot.timing})\n`;
            text += `VOICEOVER/DIALOGUE: ${shot.voiceover}\n`;
            text += `VISUAL DESCRIPTION: ${shot.visual}\n`;
            text += `AI GENERATION PROMPT: "${shot.aiPrompt}"\n`;
        });
        text += `\nPRODUCTION NOTES:\n${script.productionNotes}`;
        return text;
    };
    
    const getAIPrompts = () => script.videoScript.map(s => s.aiPrompt).join('\n\n');
    const getVoiceover = () => script.videoScript.map(s => s.voiceover).join('\n');

    return (
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
             <div className="p-4 rounded-t-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white">
                <h2 className="text-2xl font-bold">{script.title}</h2>
                <p>{script.subtitle}</p>
            </div>
            <div className="p-4 space-y-6">
                <section>
                    <h3 className="text-xl font-bold text-[#667eea] dark:text-[#8b9ef7] mb-2">CHARACTER GUIDE (for AI consistency)</h3>
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{script.characterGuide}</p>
                </section>
                <section>
                    <h3 className="text-xl font-bold text-[#667eea] dark:text-[#8b9ef7] mb-2">SETTING GUIDE (for visual continuity)</h3>
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{script.settingGuide}</p>
                </section>
                <section>
                    <h3 className="text-xl font-bold text-[#667eea] dark:text-[#8b9ef7] mb-2">COMPLETE VIDEO SCRIPT</h3>
                    <div className="space-y-4">
                        {script.videoScript.map(shot => (
                            <div key={shot.shotNumber} className="border-l-4 border-purple-200 dark:border-purple-600 pl-4">
                                <h4 className="font-bold">SHOT {shot.shotNumber} - {shot.name} ({shot.timing})</h4>
                                <p><strong className="text-purple-700 dark:text-purple-400">VOICEOVER/DIALOGUE:</strong> {shot.voiceover}</p>
                                <p><strong className="text-purple-700 dark:text-purple-400">VISUAL DESCRIPTION:</strong> {shot.visual}</p>
                                <p className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm"><strong className="text-purple-700 dark:text-purple-400">AI PROMPT:</strong> "{shot.aiPrompt}"</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section>
                    <h3 className="text-xl font-bold text-[#667eea] dark:text-[#8b9ef7] mb-2">PRODUCTION NOTES</h3>
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{script.productionNotes}</p>
                </section>
                <div className="mt-6 flex flex-wrap gap-2">
                    <span className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm">{script.metadata.platform}</span>
                    <span className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm">{script.metadata.duration}s</span>
                    <span className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm">{script.metadata.category}</span>
                    <span className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm">{script.metadata.shotCount} shots</span>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                    <button onClick={() => copyContent(getFullScriptText(), 'Full script copied!')} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"><CopyIcon/> Copy Full Script</button>
                    <button onClick={() => copyContent(getAIPrompts(), 'AI prompts copied!')} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"><CopyIcon/> Copy AI Prompts Only</button>
                    <button onClick={() => copyContent(getVoiceover(), 'Voiceover copied!')} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"><CopyIcon/> Copy Voiceover Only</button>
                </div>
            </div>
        </div>
    );
}

export const TabCreateScripts: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const [selectedHook, setSelectedHook] = useState('');
    const [customHook, setCustomHook] = useState('');
    const [length, setLength] = useState('30');
    const [platform, setPlatform] = useState('TikTok');
    const [script, setScript] = useState<ScriptOutput | null>(null);
    
    useEffect(() => {
        if(customHook) setSelectedHook('');
    }, [customHook]);

    useEffect(() => {
        if(selectedHook) setCustomHook('');
    }, [selectedHook]);

    const parseScriptResponse = (text: string, hook: string, length: string, platform: string): ScriptOutput => {
        const charGuideMatch = text.match(/### CHARACTER GUIDE ###\s*([\s\S]*?)\s*### SETTING GUIDE ###/);
        const settingGuideMatch = text.match(/### SETTING GUIDE ###\s*([\s\S]*?)\s*### COMPLETE VIDEO SCRIPT ###/);
        const scriptBodyMatch = text.match(/### COMPLETE VIDEO SCRIPT ###\s*([\s\S]*?)\s*### PRODUCTION NOTES ###/);
        const productionNotesMatch = text.match(/### PRODUCTION NOTES ###\s*([\s\S]*)/);
        
        const videoScript: Shot[] = [];
        if (scriptBodyMatch) {
            const shotBlocks = scriptBodyMatch[1].split('---').filter(b => b.trim());
            shotBlocks.forEach(block => {
                const shotNumMatch = block.match(/SHOT (\d+)/);
                const nameMatch = block.match(/SHOT \d+ - (.*?)\s*\(/);
                const timingMatch = block.match(/\((.*?)\)/);
                const voMatch = block.match(/VOICEOVER\/DIALOGUE:\s*([\s\S]*?)\s*VISUAL DESCRIPTION/);
                const visualMatch = block.match(/VISUAL DESCRIPTION:\s*([\s\S]*?)\s*AI GENERATION PROMPT/);
                const aiPromptMatch = block.match(/AI GENERATION PROMPT:\s*"([\s\S]*?)"/);
                
                if(shotNumMatch && nameMatch && timingMatch && voMatch && visualMatch && aiPromptMatch) {
                    videoScript.push({
                        shotNumber: parseInt(shotNumMatch[1], 10),
                        name: nameMatch[1].trim(),
                        timing: timingMatch[1].trim(),
                        voiceover: voMatch[1].trim(),
                        visual: visualMatch[1].trim(),
                        aiPrompt: aiPromptMatch[1].trim(),
                    });
                }
            });
        }
        
        const hookData = state.generatedHooks.find(h => h.hookText === hook);
        
        return {
            title: `${length}-Second Video Script`,
            subtitle: `Based on: "${hook.substring(0, 60)}..."`,
            characterGuide: charGuideMatch ? charGuideMatch[1].trim() : 'N/A - Check AI response for formatting errors.',
            settingGuide: settingGuideMatch ? settingGuideMatch[1].trim() : 'N/A - Check AI response for formatting errors.',
            videoScript: videoScript,
            productionNotes: productionNotesMatch ? productionNotesMatch[1].trim() : 'N/A - Check AI response for formatting errors.',
            metadata: {
                platform,
                duration: length,
                category: hookData?.category || 'Custom',
                shotCount: videoScript.length,
            }
        };
    };

    const handleGenerateScript = async () => {
        const hookToUse = customHook.trim() || selectedHook;
        if (!hookToUse) {
            dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'Please select a hook or write a custom one.', type: 'error' }});
            return;
        }
        if (!state.bookAngles) {
            dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'Book angles are missing. Please complete Step 1.', type: 'error' }});
            return;
        }

        dispatch({ type: ActionType.SET_LOADING, payload: { key: 'generatingScript', value: true } });
        setScript(null);

        try {
            const hookData = state.generatedHooks.find(h => h.hookText === hookToUse);
            const responseText = await generateScriptWithAI(
                state.bookAngles,
                state.originalBookText,
                hookToUse,
                hookData?.formatName || 'Custom',
                hookData?.category || 'Custom',
                length,
                platform
            );
            
            const parsedScript = parseScriptResponse(responseText, hookToUse, length, platform);
            setScript(parsedScript);
        } catch (error) {
            console.error("Error generating script:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during script generation.";
            dispatch({ type: ActionType.ADD_TOAST, payload: { message: `Script generation failed: ${errorMessage}`, type: 'error' } });
        } finally {
            dispatch({ type: ActionType.SET_LOADING, payload: { key: 'generatingScript', value: false } });
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <TipBox>
                <strong>Next Step:</strong> Select a hook from the dropdown OR write your own custom hook, then click 'Generate Script' to create a production-ready video script!
            </TipBox>

            <div className="my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">1. Select Generated Hook</label>
                    <select value={selectedHook} onChange={e => setSelectedHook(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#667eea] focus:border-[#667eea] sm:text-sm rounded-md" disabled={state.generatedHooks.length === 0}>
                        <option value="">{state.generatedHooks.length > 0 ? 'Select a hook...' : 'Generate hooks first...'}</option>
                        {state.generatedHooks.map((h, i) => <option key={i} value={h.hookText}>{h.hookText.substring(0, 80)}...</option>)}
                    </select>
                </div>
                <div className="text-center text-gray-500 font-bold">OR</div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">2. Write Custom Hook</label>
                    <textarea value={customHook} onChange={e => setCustomHook(e.target.value)} placeholder="Write your own hook here..." className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#667eea] focus:border-[#667eea]"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">3. Video Length</label>
                        <select value={length} onChange={e => setLength(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#667eea] focus:border-[#667eea] sm:text-sm rounded-md">
                            <option value="15">15 seconds (TikTok/Reels)</option>
                            <option value="30">30 seconds (TikTok/Reels)</option>
                            <option value="60">60 seconds (TikTok/Reels/YouTube Shorts)</option>
                            <option value="90">90 seconds (YouTube)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">4. Platform Focus</label>
                        <select value={platform} onChange={e => setPlatform(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#667eea] focus:border-[#667eea] sm:text-sm rounded-md">
                            <option>TikTok</option>
                            <option>Instagram Reels</option>
                            <option>YouTube Shorts</option>
                            <option>Universal</option>
                        </select>
                    </div>
                </div>
                 <div className="text-center pt-4">
                     <button 
                        onClick={handleGenerateScript} 
                        disabled={state.isLoading.generatingScript}
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                         <GenerateIcon/> Generate Script
                     </button>
                 </div>
            </div>
            
            {state.isLoading.generatingScript && <Spinner message="Generating your video script... this can take some time."/>}
            {script && <ScriptDisplay script={script} />}
        </div>
    );
};