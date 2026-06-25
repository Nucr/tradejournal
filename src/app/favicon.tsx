import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2ED9A4",
          borderRadius: 10,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
          <path d="M20 44V32l12 8 12-8v12" stroke="#060D11" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M20 28V20l12 8 12-8v8" stroke="#060D11" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
