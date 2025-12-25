import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ReaderPanel from '@/components/ReaderPanel';
import ChoicePrompt from '@/components/ChoicePrompt';
import axios from 'axios';

interface Panel {
  panel_id: number;
  scene: string;
  dialogue?: Array<{ speaker: string; text: string }>;
  visual_notes: string[];
  thought?: string;
}

interface Choice {
  choice_id: string;
  trigger_panel: number;
  prompt: string;
  branches: Array<{
    id: string;
    label: string;
    text: string;
    consequence: string;
  }>;
}

export default function Chapter() {
  const router = useRouter();
  const { chapterId } = router.query;
  const [panels, setPanels] = useState<Panel[]>([]);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chapterId) return;

    const loadChapter = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/chapters/${chapterId}`
        );
        setPanels(response.data.panels || []);
        setChoices(response.data.choice_points || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load chapter', error);
        setLoading(false);
      }
    };

    loadChapter();
  }, [chapterId]);

  const handleChoiceSelect = async (choiceId: string, branchId: string) => {
    setSelectedChoices(new Map(selectedChoices).set(choiceId, branchId));

    const choice = choices.find((c) => c.choice_id === choiceId);
    if (choice) {
      const nextJump = choice.branches.find((b) => b.id === branchId)?.next_scene_jump;
      if (nextJump) {
        setCurrentPanel(nextJump);
      }
    }
  };

  const handleScroll = () => {
    if (currentPanel < panels.length - 1) {
      setCurrentPanel(currentPanel + 1);
    }
  };

  if (loading) return <div className="p-8">Loading chapter...</div>;

  const currentPanelData = panels[currentPanel];
  const activeChoice = choices.find((c) => c.trigger_panel === currentPanel);

  return (
    <div className="w-full bg-void text-white overflow-hidden">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 bg-cosmic p-4 border-b border-sigil/20 z-10">
          <h1 className="text-lg font-bold">REVERSION LADDER</h1>
          <p className="text-sm text-sigil/60">Panel {currentPanel + 1} / {panels.length}</p>
        </div>

        {currentPanelData && (
          <>
            <ReaderPanel
              panelData={currentPanelData}
              onScroll={handleScroll}
              currentIndex={currentPanel}
              totalPanels={panels.length}
            />

            {activeChoice && !selectedChoices.has(activeChoice.choice_id) && (
              <ChoicePrompt
                choice={activeChoice}
                onSelect={(branchId) =>
                  handleChoiceSelect(activeChoice.choice_id, branchId)
                }
              />
            )}
          </>
        )}

        <div className="flex justify-between p-4 border-t border-sigil/20">
          <button
            onClick={() => setCurrentPanel(Math.max(0, currentPanel - 1))}
            className="px-4 py-2 bg-sigil/20 hover:bg-sigil/40 rounded"
          >
            ← Previous
          </button>
          <button
            onClick={handleScroll}
            className="px-4 py-2 bg-sigil/20 hover:bg-sigil/40 rounded"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
