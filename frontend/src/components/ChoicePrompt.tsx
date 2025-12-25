import React, { useState } from 'react';

interface Branch {
  id: string;
  label: string;
  text: string;
  consequence: string;
}

interface Choice {
  choice_id: string;
  prompt: string;
  branches: Branch[];
}

interface ChoicePromptProps {
  choice: Choice;
  onSelect: (branchId: string) => void;
}

const ChoicePrompt: React.FC<ChoicePromptProps> = ({ choice, onSelect }) => {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [showConsequence, setShowConsequence] = useState(false);

  const handleSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    setShowConsequence(true);
    setTimeout(() => onSelect(branchId), 1500);
  };

  return (
    <div className="bg-cosmic border-t border-sigil/40 p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-sm font-mono text-sigil/60">⚔ CHOICE POINT</p>
        <h3 className="text-lg font-bold mt-2">{choice.prompt}</h3>
      </div>

      <div className="space-y-3">
        {choice.branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => handleSelect(branch.id)}
            className={`w-full text-left p-4 border-2 rounded transition-all ${
              selectedBranch === branch.id
                ? 'border-sigil bg-sigil/20'
                : 'border-sigil/20 hover:border-sigil/60'
            }`}
          >
            <p className="font-bold text-sigil mb-1">{branch.label}</p>
            <p className="text-sm text-gray-300 italic">"{branch.text}"</p>
          </button>
        ))}
      </div>

      {showConsequence && selectedBranch && (
        <div className="mt-6 p-4 bg-void border-l-4 border-sigil/60 animate-pulse">
          <p className="text-xs font-mono text-sigil/60 mb-2">CONSEQUENCE</p>
          <p className="text-sm text-gray-200">
            {choice.branches.find((b) => b.id === selectedBranch)?.consequence}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChoicePrompt;
