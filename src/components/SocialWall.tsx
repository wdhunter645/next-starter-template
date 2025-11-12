"use client";
import { ElfsightWidget } from "next-elfsight-widget";

export default function SocialWall() {
  return (
    <section id="social" className="social-wall">
      <h2 className="section-title">Social Wall</h2>
      <div className="social-wall-frame">
        <ElfsightWidget widgetId="805f3c5c-67cd-4edf-bde6-2d5978e386a8" />
      </div>
    </section>
  );
}
