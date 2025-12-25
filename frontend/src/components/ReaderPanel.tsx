import React from 'react';

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
}

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
