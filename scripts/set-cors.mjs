import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const KEY = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "tradejounel";
const ORIGINS = [
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://tradejournal-pink.vercel.app",
  "http://localhost:3000",
];

if (!getApps().length) {
  if (KEY) {
    initializeApp({ credential: cert(JSON.parse(KEY)) });
  } else {
    initializeApp({ projectId: PROJECT });
  }
}

const RAW = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (!RAW) {
  console.error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET not set");
  process.exit(1);
}

// Re-init with storageBucket for Admin SDK auto-discovery
if (!getApps().length) {
  initializeApp({ projectId: PROJECT, storageBucket: RAW });
}

async function tryBucket(bucketName) {
  try {
    const bucket = getStorage().bucket(bucketName);
    await bucket.getMetadata();
    return bucket;
  } catch (e) {
    console.log(`  → ${e.message?.split("\n")?.[0] || e.code}`);
    return null;
  }
}

// Try possible bucket names
const names = [
  RAW,
  RAW.replace(/\.firebasestorage\.app$/, ".appspot.com"),
  `${PROJECT}.appspot.com`,
  PROJECT,
];
let bucket = null;
for (const name of names) {
  console.log("Trying bucket:", name);
  bucket = await tryBucket(name);
  if (bucket) {
    console.log("✓ Found bucket:", name);
    break;
  }
}

// Also try without explicit name (uses storageBucket from init)
if (!bucket) {
  console.log("Trying default bucket (from storageBucket config)...");
  try {
    bucket = getStorage().bucket();
    await bucket.getMetadata();
    console.log("✓ Found default bucket");
  } catch (e) {
    console.log(`  → ${e.message?.split("\n")?.[0] || e.code}`);
    bucket = null;
  }
}

if (!bucket) {
  console.error("No bucket found. Tried all options.");
  console.error("\n👉 You need to enable Firebase Storage in the Firebase Console:");
  console.error("   https://console.firebase.google.com/project/tradejounel/storage");
  console.error("   Then run this script again.");
  process.exit(1);
}

const cors = [
  {
    origin: ORIGINS,
    method: ["GET", "PUT", "POST", "DELETE", "HEAD"],
    responseHeader: ["Content-Type", "x-goog-*"],
    maxAgeSeconds: 3600,
  },
];

await bucket.setCorsConfiguration(cors);
console.log("✓ CORS configured for origins:", ORIGINS);
console.log("Bucket:", bucket.name);
