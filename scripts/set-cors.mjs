import { readFileSync } from "fs";
import { resolve } from "path";
import { homedir } from "os";

const PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "tradejounel";
const vercelUrl = process.env.VERCEL_URL;
const ORIGINS = [
  vercelUrl && vercelUrl !== "undefined" ? `https://${vercelUrl}` : "https://tradejournal-pink.vercel.app",
  "http://localhost:3000",
];

// Read Firebase CLI credentials
const configPath = resolve(homedir(), ".config", "configstore", "firebase-tools.json");
const config = JSON.parse(readFileSync(configPath, "utf-8"));
const token = config.tokens?.access_token;
if (!token) {
  console.error("No access_token found. Run: firebase login");
  process.exit(1);
}

const CORS_CONFIG = [
  { origin: ORIGINS, method: ["GET", "PUT", "POST", "DELETE", "HEAD"], responseHeader: ["Content-Type", "x-goog-*"], maxAgeSeconds: 3600 },
];

async function checkBucket(name) {
  const res = await fetch(`https://storage.googleapis.com/storage/v1/b/${name}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    const data = await res.json();
    console.log("✓ Found:", name, `(location: ${data.location})`);
    return true;
  }
  return false;
}

async function setCors(name) {
  const res = await fetch(`https://storage.googleapis.com/storage/v1/b/${name}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ cors: CORS_CONFIG }),
  });
  if (res.ok) {
    console.log("✓ CORS configured for", name);
    console.log("  Origins:", ORIGINS);
    return true;
  }
  const text = await res.text();
  console.log(`  ${res.status}: ${text.slice(0, 200)}`);
  return false;
}

// Check both possible bucket names
const candidates = [`${PROJECT}.firebasestorage.app`, `${PROJECT}.appspot.com`];
let found = false;
for (const name of candidates) {
  console.log("Checking:", name);
  if (await checkBucket(name)) {
    found = true;
    await setCors(name);
    break;
  }
}

if (!found) {
  console.error("\nNo storage bucket found. Enable Firebase Storage at:");
  console.error("  https://console.firebase.google.com/project/tradejounel/storage");
}
