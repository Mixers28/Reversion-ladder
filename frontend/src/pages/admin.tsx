import { useState } from 'react';

const STYLES = [
  'clean_manhwa_shade',
  'expressive_sketch_ink',
  'digital_paint_vibrant',
  'grave_black_ink',
  'cinematic_3d_render'
];

export default function Admin() {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    narrative: '',
    panels: 35,
    style: 'grave_black_ink',
    openai_key: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [chapterStatus, setChapterStatus] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'panels' ? parseInt(value) : value
    }));
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://reversion-ladder.up.railway.app';
      
      const response = await fetch(`${backendUrl}/api/admin/chapters/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `✓ Chapter "${formData.title}" created! Generated at: ${data.chapter_path}`
        });
        
        // Fetch status
        fetchChapterStatus(formData.id);
        
        // Reset form
        setFormData({
          id: '',
          title: '',
          narrative: '',
          panels: 35,
          style: 'grave_black_ink',
          openai_key: ''
        });
      } else {
        setMessage({
          type: 'error',
          text: `Error: ${data.message || data.error}`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to create chapter: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChapterStatus = async (chapterId: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://reversion-ladder.up.railway.app';
      
      const response = await fetch(`${backendUrl}/api/admin/chapters/${chapterId}/status`);
      const data = await response.json();
      
      if (data.success) {
        setChapterStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch chapter status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-sigil mb-2">Chapter Creator</h1>
          <p className="text-gray-400">Auto-generate chapters using the WORTHY orchestrator</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded border ${
            message.type === 'success' 
              ? 'bg-green-900/20 border-green-500/50 text-green-300'
              : 'bg-red-900/20 border-red-500/50 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleCreateChapter} className="bg-cosmic p-6 rounded border border-sigil/20 mb-8">
          <div className="space-y-4">
            {/* Chapter ID */}
            <div>
              <label className="block text-sm font-semibold text-sigil mb-2">
                Chapter ID (lowercase, no spaces)
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                placeholder="e.g., ch04_revelation"
                required
                className="w-full px-4 py-2 bg-void border border-sigil/30 text-white rounded focus:outline-none focus:border-sigil"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-sigil mb-2">
                Chapter Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Chapter 4: Revelation"
                required
                className="w-full px-4 py-2 bg-void border border-sigil/30 text-white rounded focus:outline-none focus:border-sigil"
              />
            </div>

            {/* Narrative */}
            <div>
              <label className="block text-sm font-semibold text-sigil mb-2">
                Narrative Summary
              </label>
              <textarea
                name="narrative"
                value={formData.narrative}
                onChange={handleInputChange}
                placeholder="Describe the key plot points and character arcs for this chapter..."
                required
                rows={4}
                className="w-full px-4 py-2 bg-void border border-sigil/30 text-white rounded focus:outline-none focus:border-sigil resize-none"
              />
            </div>

            {/* Panels */}
            <div>
              <label className="block text-sm font-semibold text-sigil mb-2">
                Panel Count ({formData.panels})
              </label>
              <input
                type="range"
                name="panels"
                value={formData.panels}
                onChange={handleInputChange}
                min="10"
                max="100"
                step="5"
                className="w-full"
              />
              <p className="text-xs text-gray-400 mt-1">10-100 panels • Cost ~$0.05-0.30 USD</p>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-semibold text-sigil mb-2">
                Art Style
              </label>
              <select
                name="style"
                value={formData.style}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-void border border-sigil/30 text-white rounded focus:outline-none focus:border-sigil"
              >
                {STYLES.map(style => (
                  <option key={style} value={style}>
                    {style.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* OpenAI API Key */}
            <div>
              <label className="block text-sm font-semibold text-sigil mb-2">
                OpenAI API Key (Optional - uses env var if not provided)
              </label>
              <input
                type="password"
                name="openai_key"
                value={formData.openai_key}
                onChange={handleInputChange}
                placeholder="sk-proj-..."
                className="w-full px-4 py-2 bg-void border border-sigil/30 text-white rounded focus:outline-none focus:border-sigil"
              />
              <p className="text-xs text-gray-400 mt-1">Not stored, only used for this request</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-sigil/30 hover:bg-sigil/50 disabled:bg-sigil/10 disabled:opacity-50 border border-sigil text-sigil font-bold rounded transition-all"
            >
              {loading ? '⏳ Generating Chapter (2-3 min)...' : '🚀 Create Chapter'}
            </button>
          </div>
        </form>

        {/* Chapter Status */}
        {chapterStatus && (
          <div className="bg-cosmic p-6 rounded border border-sigil/20">
            <h2 className="text-xl font-bold text-sigil mb-4">Chapter Status</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-sigil font-semibold">ID:</span> {chapterStatus.chapter_id}</p>
              <p><span className="text-sigil font-semibold">Status:</span> {chapterStatus.status}</p>
              <p><span className="text-sigil font-semibold">Panels:</span> {chapterStatus.panels}</p>
              <p><span className="text-sigil font-semibold">Style:</span> {chapterStatus.style}</p>
              {chapterStatus.images && (
                <p><span className="text-sigil font-semibold">Images:</span> {chapterStatus.images.succeeded}/{chapterStatus.images.total_panels} generated</p>
              )}
              <p><span className="text-sigil font-semibold">Created:</span> {new Date(chapterStatus.created_at).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-cosmic border border-sigil/20 rounded text-xs text-gray-400">
          <p className="mb-2"><strong>How it works (OpenAI GPT-4 Turbo):</strong></p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Triggers the WORTHY orchestrator backend (Mode B)</li>
            <li>Generates plot, script, dialogue via OpenAI gpt-4-turbo</li>
            <li>Guided by WORTHY Story Bible for canon-aware generation</li>
            <li>Creates panel storyboards and character sketches</li>
            <li>Stores output in /chapters/{'{id}'} directory</li>
            <li>Typical generation time: 2-3 minutes per chapter</li>
            <li>Cost: ~$0.25-0.40 per chapter (higher quality than gpt-4o-mini)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
