import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let serviceAccount;
try {
  const paths = [
    join(__dirname, "..", "serviceAccountKey.json"),
    join(__dirname, "..", "firebase-service-account.json"),
  ];
  for (const p of paths) {
    try {
      serviceAccount = JSON.parse(readFileSync(p, "utf-8"));
      console.log("Service account loaded from", p);
      break;
    } catch {}
  }
} catch {}

if (!serviceAccount) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    serviceAccount = JSON.parse(raw);
    console.log("Service account loaded from env FIREBASE_SERVICE_ACCOUNT_KEY");
  }
}

if (!serviceAccount) {
  console.error("No service account found. Place serviceAccountKey.json in project root or set FIREBASE_SERVICE_ACCOUNT_KEY env.");
  process.exit(1);
}

const app =
  getApps().find((a) => a.name === "[DEFAULT]") ??
  initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore(app);

async function backfill() {
  const usersSnap = await db.collection("users").get();
  console.log(`Found ${usersSnap.size} users`);

  let total = 0;
  let updated = 0;

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const tradesSnap = await db.collection("users").doc(uid).collection("trades").get();
    total += tradesSnap.size;

    for (const tradeDoc of tradesSnap.docs) {
      const data = tradeDoc.data();
      if (data.tradeId == null || data.tradeId === "") {
        await tradeDoc.ref.update({ tradeId: tradeDoc.id });
        updated++;
        console.log(`  Updated trade ${tradeDoc.id} (user: ${uid})`);
      }
    }
  }

  console.log(`\nDone. Total trades: ${total}, updated: ${updated}`);
}

backfill()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
