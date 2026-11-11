import type { Opportunity, StudentData } from "./types";

/** Simple transparent scoring: skill overlap + matches with stated preferences. Excludes applied/closed listings. */
export function recommend(d: StudentData, opps: Opportunity[], limit = 3) {
  const mine = new Set(d.skills.map((s) => s.name.toLowerCase()));
  const { types, modes, roles, areas } = d.profile.preferences;
  const keywords = [...roles, ...areas].map((k) => k.toLowerCase());
  const scored = opps
    .filter((o) => new Date(o.deadline).getTime() >= Date.now() && !d.applications.some((a) => a.opportunityId === o.id))
    .map((o) => {
      let score = o.skills.filter((s) => mine.has(s.toLowerCase())).length * 2;
      if (types.includes(o.type)) score += 1;
      if (modes.includes(o.mode)) score += 1;
      const hay = (o.title + " " + o.skills.join(" ")).toLowerCase();
      if (keywords.some((k) => hay.includes(k))) score += 1;
      return { o, score };
    })
    .sort((a, b) => b.score - a.score || +new Date(b.o.postedAt) - +new Date(a.o.postedAt));
  return { items: scored.slice(0, limit).map((x) => x.o), personalised: scored.some((x) => x.score > 0) };
}
