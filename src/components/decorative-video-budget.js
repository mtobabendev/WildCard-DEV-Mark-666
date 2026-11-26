// Only decorative autoplay participates. Revoke old grants before starting new ones.
export function createDecorativeVideoBudget(initialLimit = Infinity) {
  let limit = initialLimit, serial = 0;
  const entries = new Map();
  function reconcile() {
    const winners = new Set([...entries.values()].filter(e => e.score > 0)
      .sort((a,b) => b.score-a.score || a.order-b.order).slice(0,limit));
    for (const e of entries.values()) if (e.granted && !winners.has(e)) { e.granted=false; e.change(false); }
    for (const e of winners) if (!e.granted) { e.granted=true; e.change(true); }
  }
  return {
    setLimit(value) { limit=value; reconcile(); },
    register(change) {
      const e={score:0,order:serial++,granted:false,change}; entries.set(e.order,e);
      return { update(score) { if (!entries.has(e.order) || e.score===score) return; e.score=score; reconcile(); },
        dispose() { if (!entries.delete(e.order)) return; if(e.granted){e.granted=false;e.change(false);} reconcile(); } };
    },
  };
}
export const decorativeVideoBudget = createDecorativeVideoBudget();
