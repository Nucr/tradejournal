import { Storage } from "@google-cloud/storage";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!raw) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set");
  process.exit(1);
}

const credentials = JSON.parse(raw);
const storage = new Storage({ credentials });
const bucketName = `${credentials.project_id}.firebasestorage.app`;

const corsConfig = [
  {
    origin: ["*"],
    method: ["*"],
    maxAgeSeconds: 3600,
  },
];

try {
  await storage.bucket(bucketName).setCorsConfiguration(corsConfig);
  console.log(`CORS configured successfully for ${bucketName}`);
} catch (err) {
  console.error("Failed to set CORS:", err.message);
  process.exit(1);
}
