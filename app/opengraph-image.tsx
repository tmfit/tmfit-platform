import { ImageResponse } from "next/og";

export const alt = "TMFIT — Nutrizione, allenamento e monitoraggio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07111f",
          color: "white",
          padding: "72px 80px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: -3 }}>TMFIT</div>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#5eead4" }} />
        </div>
        <div style={{ maxWidth: 960, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, color: "#5eead4", fontWeight: 700, letterSpacing: 3 }}>
            NUTRIZIONE · ALLENAMENTO · MONITORAGGIO
          </div>
          <div style={{ marginTop: 24, fontSize: 70, lineHeight: 1.02, fontWeight: 900, letterSpacing: -4 }}>
            Un percorso costruito sui tuoi dati.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
