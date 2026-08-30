"use client";

import Image from "next/image";
import { Download, X } from "lucide-react";

type WallPreviewProps = {
  artworkUrl: string;
  title: string;
  onClose: () => void;
  onDownload: () => void;
};

export function WallPreview({ artworkUrl, title, onClose, onDownload }: WallPreviewProps) {
  return (
    <div className="modal-backdrop wall-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="wall-modal" role="dialog" aria-modal="true" aria-labelledby="wall-preview-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="wall-modal-header">
          <div><span>Room preview</span><h2 id="wall-preview-title">See “{title}” at home</h2></div>
          <div>
            <button className="button button-ghost" type="button" onClick={onDownload}><Download size={15} /> Download art</button>
            <button className="modal-close is-static" type="button" onClick={onClose} aria-label="Close wall preview"><X size={18} /></button>
          </div>
        </div>
        <div className="luxury-room">
          <Image src="/images/luxury-wall-room.png" alt="Warm luxury living room with an empty central wall" fill sizes="95vw" priority />
          <div className="room-artwork-frame">
            {/* The artwork is generated from the user's canvas at runtime. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artworkUrl} alt={`${title} displayed on a luxury living-room wall`} />
          </div>
        </div>
        <p className="wall-caption">A scale preview for composition and presence. Final print color depends on paper, ink, and display calibration.</p>
      </section>
    </div>
  );
}
