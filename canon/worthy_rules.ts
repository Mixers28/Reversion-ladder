export type CanonCheckResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export function checkWorthyCh01(scriptJson: any, captureMd?: string): CanonCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const textBlob = [JSON.stringify(scriptJson ?? {}), captureMd ?? ""].join("\n").toLowerCase();

  const required = [
    { name: "mom misdirect", keys: ["five more minutes", "mom"] },
    { name: "mass grave reveal", keys: ["mass grave", "corps"] },
    { name: "mark shown as rash/infection", keys: ["mark", "rash"] },
    { name: "triage / intake", keys: ["triage", "medic"] },
    { name: "cliffhanger horn or scouts", keys: ["horn", "scout", "ridge"] }
  ];

  for (const r of required) {
    const ok = r.keys.every(k => textBlob.includes(k));
    if (!ok) errors.push(`Missing required beat: ${r.name} (expected keywords: ${r.keys.join(", ")})`);
  }

  const filterMentions = (textBlob.match(/filter/g) || []).length;
  if (filterMentions > 2) warnings.push(`Filter mentioned ${filterMentions} times in Chapter 1. Keep it as rumor/whisper only.`);

  try {
    for (const p of (scriptJson?.panels ?? [])) {
      for (const d of (p.dialogue ?? [])) {
        const wc = String(d.text ?? "").trim().split(/\s+/).filter(Boolean).length;
        if (wc > 18) warnings.push(`Long dialogue bubble in panel ${p.panel}: ${wc} words. Consider splitting.`);
      }
    }
  } catch {}

  if (captureMd) {
    const paras = captureMd.split(/\n\s*\n/);
    for (const [i, para] of paras.entries()) {
      const wc = para.trim().split(/\s+/).filter(Boolean).length;
      if (wc > 60) warnings.push(`Long paragraph in capture.md (para ${i+1}): ${wc} words. Consider tightening.`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
