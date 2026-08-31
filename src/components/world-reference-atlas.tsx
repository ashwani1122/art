"use client";

import { ExternalLink, LoaderCircle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MasterpieceReference } from "@/lib/masterpiece-references";

type AtlasItem = { id: string; title: string; image: string; sourceUrl: string; credit: string; license: string; groupId: string; groupLabel: string };
type AtlasGroup = { id: string; label: string };

type WorldReferenceAtlasProps = { onOpenReference: (reference: MasterpieceReference) => void };

export function WorldReferenceAtlas({ onOpenReference }: WorldReferenceAtlasProps) {
  const [items, setItems] = useState<AtlasItem[]>([]);
  const [groups, setGroups] = useState<AtlasGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState("wildlife");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reference-atlas", { cache: "force-cache" })
      .then((response) => response.ok ? response.json() as Promise<{ groups: AtlasGroup[]; items: AtlasItem[] }> : Promise.reject(new Error("Atlas unavailable")))
      .then((data) => { if (!cancelled) { setGroups(data.groups); setItems(data.items); } })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const visibleItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => item.groupId === activeGroup && (!term || item.title.toLowerCase().includes(term)));
  }, [activeGroup, items, query]);

  const openItem = (item: AtlasItem) => onOpenReference({
    id: item.id,
    title: item.title,
    artist: item.credit,
    date: item.license,
    image: item.image,
    sourceUrl: item.sourceUrl,
    linkedTemplateId: "blank-canvas",
    palette: ["#f5f0e8", "#1c1c1c", "#ed5b45", "#4d55a5", "#5c8f6e", "#d9af57"],
    lesson: "Study the large shapes first, then translate the edges, light, and texture into your own marks.",
  });

  return (
    <section className="world-atlas" aria-labelledby="world-atlas-heading">
      <div className="mini-heading">
        <div><span>Open reference atlas</span><strong id="world-atlas-heading">Real places to study</strong></div>
        <small>{items.length || "120"} studies</small>
      </div>
      <label className="atlas-search"><Search size={14} /><span className="sr-only">Search references</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search animals, rivers, walls…" /></label>
      <div className="atlas-tabs" role="tablist" aria-label="Reference categories">
        {groups.map((group) => <button type="button" role="tab" aria-selected={activeGroup === group.id} className={activeGroup === group.id ? "is-active" : ""} key={group.id} onClick={() => setActiveGroup(group.id)}>{group.label}</button>)}
      </div>
      {loading ? <p className="atlas-loading"><LoaderCircle size={15} /> Loading open references…</p> : <div className="atlas-grid">{visibleItems.map((item) => <button type="button" className="atlas-card" key={item.id} onClick={() => openItem(item)}><span className="atlas-thumb"><img src={item.image} alt="" loading="lazy" /></span><span><strong>{item.title}</strong><small>{item.license}</small></span></button>)}</div>}
      {!loading && visibleItems.length === 0 ? <p className="atlas-empty">No references match that search.</p> : null}
      <p className="atlas-credit"><ExternalLink size={11} /> Images load from Wikimedia Commons; open each card for its attribution and source.</p>
    </section>
  );
}
