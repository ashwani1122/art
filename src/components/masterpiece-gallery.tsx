"use client";

import Image from "next/image";
import { ExternalLink, Palette, X } from "lucide-react";
import { useState } from "react";
import { masterpieceReferences, type MasterpieceReference } from "@/lib/masterpiece-references";

type MasterpieceGalleryProps = {
  onOpenTemplate: (templateId: string) => void;
  onUsePalette: (colors: string[]) => void;
};

export function MasterpieceGallery({ onOpenTemplate, onUsePalette }: MasterpieceGalleryProps) {
  const [selected, setSelected] = useState<MasterpieceReference | null>(null);

  return (
    <>
      <section className="masterpiece-rail" aria-labelledby="masterpiece-heading">
        <div className="mini-heading">
          <div><span>Public domain</span><strong id="masterpiece-heading">Paint like a master</strong></div>
          <small>The Met Open Access</small>
        </div>
        <div className="masterpiece-grid">
          {masterpieceReferences.map((painting) => (
            <button type="button" key={painting.id} onClick={() => setSelected(painting)}>
              <span className="masterpiece-thumb">
                <Image src={painting.image} alt="" fill sizes="100px" />
              </span>
              <span><strong>{painting.title}</strong><small>{painting.artist}</small></span>
            </button>
          ))}
        </div>
      </section>

      {selected ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <section
            className="masterpiece-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="masterpiece-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={() => setSelected(null)} aria-label="Close reference">
              <X size={18} />
            </button>
            <div className="masterpiece-large">
              <Image src={selected.image} alt={`${selected.title} by ${selected.artist}`} fill sizes="(max-width: 700px) 90vw, 540px" />
            </div>
            <div className="masterpiece-copy">
              <p className="eyebrow">Masterpiece study</p>
              <h2 id="masterpiece-modal-title">{selected.title}</h2>
              <p className="masterpiece-byline">{selected.artist} · {selected.date}</p>
              <p className="masterpiece-lesson">{selected.lesson}</p>
              <div className="reference-palette" aria-label="Palette extracted for study">
                {selected.palette.map((color) => <span key={color} style={{ backgroundColor: color }} title={color} />)}
              </div>
              <div className="masterpiece-actions">
                <button type="button" className="button button-primary" onClick={() => { onUsePalette(selected.palette); setSelected(null); }}>
                  <Palette size={15} /> Use this palette
                </button>
                <button type="button" className="button button-ghost" onClick={() => { onOpenTemplate(selected.linkedTemplateId); setSelected(null); }}>
                  Open matching study
                </button>
              </div>
              <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
                View public-domain source at The Met <ExternalLink size={12} />
              </a>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
