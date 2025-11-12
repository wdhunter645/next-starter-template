"use client";
import { useEffect, useState } from "react";

export default function DebugOverlay() {
  const [widgetStatus, setWidgetStatus] = useState("initializing");
  
  useEffect(() => {
    const id = setInterval(() => {
      const el = document.querySelector(".eapps-widget");
      if (el) setWidgetStatus("initialized");
    }, 1500);
    return () => clearInterval(id);
  }, []);
  
  if (typeof window !== "undefined" && window.location.search.includes("debug=1")) {
    return (
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(0,0,0,0.8)",
        color: "#fff",
        fontSize: "0.8rem",
        padding: "0.5rem",
        zIndex: 9999
      }}>
        SocialWall widget status: {widgetStatus}
      </div>
    );
  }
  
  return null;
}
