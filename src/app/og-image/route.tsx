import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #060D11 0%, #0B1A20 50%, #060D11 100%)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#2ED9A4" />
            <path d="M20 44V32l12 8 12-8v12" stroke="#060D11" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M20 28V20l12 8 12-8v8" stroke="#060D11" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span style={{ fontSize: 72, fontWeight: 700, color: "#E8ECF0", letterSpacing: -2 }}>Ledger</span>
        </div>
        <span style={{ fontSize: 28, color: "#97A6B2", marginTop: 8 }}>
          Trade Journal &bull; Performans Defteri
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
