import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Panel {
  panel_id: number;
  scene: string;
  dialogue?: Array<{ speaker: string; text: string }>;
  visual_notes: string[];
  thought?: string;
  on_panel_text?: string[];
}

interface ReaderPanelProps {
  panelData: Panel;
  onScroll: () => void;
  currentIndex: number;
  totalPanels: number;
  apiUrl?: string;
}

const ReaderPanel: React.FC<ReaderPanelProps> = ({
  panelData,
  onScroll,
  currentIndex,
  totalPanels,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSketch = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const prompt = panelData.visual_notes.join(' ');
        const response = await fetch(`${apiUrl}/sketches/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt,
            panel_id: panelData.panel_id,
            scene: panelData.scene,
          }),
        });
        
        if (!response.ok) throw new Error('Failed to generate sketch');
        
        const data = await response.json();
        setImageUrl(data.image_url);
      } catch (err) {
        console.error('Sketch generation error:', err);
        setError('Could not generate sketch');
      } finally {
        setLoading(false);
      }
    };

    generateSketch();
  }, [panelData.panel_id, panelData.scene, panelData.visual_notes, apiUrl]);

const ReaderPanel: React.FC<ReaderPanelProps> = ({
  panelData,
  onScroll,
  currentIndex,
  totalPanels,
}) => {
  return (
    <div
      className="min-h-screen bg-cosmic flex flex-col justify-center items-center p-6 cursor-pointer"
      onClick={onScroll}
    >
      <div className="w-full max-w-xl border-2 border-sigil/40 p-8 bg-void rounded">
        {imageUrl ? (
          <div className="mb-6 w-full aspect-video relative rounded border border-sigil/30">
            <Image
              src={imageUrl}
              alt={`Panel ${panelData.panel_id}: ${panelData.scene}`}
              fill
              className="object-cover rounded"
              priority
            />
          </div>
        ) : loading ? (
          <div className="mb-6 w-full aspect-video flex items-center justify-center bg-cosmic/50 rounded border border-sigil/20">
            <span className="text-sigil/60 text-sm">Generating sketch...</span>
          </div>
        ) : error ? (
          <div className="mb-6 w-full aspect-video flex items-center justify-center bg-cosmic/50 rounded border border-sigil/20">
            <span className="text-red-400/60 text-sm">{error}</span>
          </div>
        ) : null}

        <div className="text-sm font-mono text-sigil/60 mb-4">
          [{panelData.scene}] — Panel {panelData.panel_id}
        </div>

        <div className="mb-6 text-sm leading-relaxed text-gray-300">
          {panelData.visual_notes.join(' ')}
        </div>

        {panelData.on_panel_text && (
          <div className="my-6 p-4 border-l-2 border-sigil/60 italic text-sigil/80">
            {panelData.on_panel_text.map((text, idx) => (
              <p key={idx} className="mb-2">
                {text}
              </p>
            ))}
          </div>
        )}

        {panelData.dialogue && (
          <div className="space-y-3 mb-6">
            {panelData.dialogue.map((line, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-bold text-sigil">{line.speaker}</span>
                <p className="text-gray-200 ml-4">"{line.text}"</p>
              </div>
            ))}
          </div>
        )}

        {panelData.thought && (
          <div className="italic text-gray-400 text-sm border-t border-sigil/20 pt-4 mt-4">
            "{panelData.thought}"
          </div>
        )}
      </div>

      <div className="w-full max-w-xl mt-8">
        <div className="h-1 bg-sigil/20 rounded overflow-hidden">
          <div
            className="h-full bg-sigil transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / totalPanels) * 100}%`,
            }}
          ></div>
        </div>
        <p className="text-xs text-sigil/60 mt-2 text-center">
          Click to advance • {currentIndex + 1} of {totalPanels}
        </p>
      </div>
    </div>
  );
};

export default ReaderPanel;
