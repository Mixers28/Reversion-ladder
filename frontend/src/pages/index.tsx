export default function Index() {
  return (
    <div className="min-h-screen bg-void flex flex-col justify-center items-center p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-sigil mb-6">REVERSION LADDER</h1>
        <p className="text-gray-300 mb-8 leading-relaxed">
          An apex cultivator, fallen and reborn. Climb again. Uncover the truth behind the Tribunal.
        </p>
        
        <div className="flex gap-4 justify-center">
          <a
            href="/reader/ch01_opening"
            className="inline-block px-8 py-3 bg-sigil/30 hover:bg-sigil/50 border border-sigil text-sigil font-bold rounded transition-all"
          >
            Begin Reading
          </a>
          <a
            href="/admin"
            className="inline-block px-8 py-3 bg-cosmic/50 hover:bg-cosmic border border-cosmic text-gray-300 hover:text-white font-bold rounded transition-all"
          >
            Create Chapter
          </a>
        </div>

        <div className="mt-12 text-left bg-cosmic p-6 rounded border border-sigil/20">
          <h2 className="font-bold text-sigil mb-4">About This Experience</h2>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>✦ Interactive narrative with your choices shaping the story</li>
            <li>✦ AI-assisted continuations keep the tale flowing</li>
            <li>✦ Sketch generation brings key scenes to life</li>
            <li>✦ Explore the Tribunal, the Veil, and the cosmic Ladder</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
