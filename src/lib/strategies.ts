import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { Strategy } from "./types";

function strategiesRef() {
  return collection(db, "strategies");
}

function strategyDoc(id: string) {
  return doc(db, "strategies", id);
}

export async function getStrategies(uid: string): Promise<Strategy[]> {
  const publicQuery = query(
    strategiesRef(),
    where("isPublic", "==", true),
    orderBy("createdAt", "desc")
  );
  const ownQuery = query(
    strategiesRef(),
    where("createdBy", "==", uid),
    orderBy("createdAt", "desc")
  );

  const [publicSnap, ownSnap] = await Promise.all([
    getDocs(publicQuery),
    getDocs(ownQuery),
  ]);

  const seen = new Set<string>();
  const result: Strategy[] = [];

  const pushUnique = (snap: typeof publicSnap) => {
    for (const d of snap.docs) {
      if (seen.has(d.id)) continue;
      seen.add(d.id);
      const data = d.data();
      result.push({
        id: d.id,
        name: data.name,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        isPublic: data.isPublic,
        images: data.images ?? [],
        note: data.note ?? "",
      } as Strategy);
    }
  };

  pushUnique(ownSnap);
  pushUnique(publicSnap);

  return result;
}

export function subscribeToStrategies(
  uid: string,
  callback: (strategies: Strategy[]) => void
) {
  const publicQuery = query(
    strategiesRef(),
    where("isPublic", "==", true),
    orderBy("createdAt", "desc")
  );
  const ownQuery = query(
    strategiesRef(),
    where("createdBy", "==", uid),
    orderBy("createdAt", "desc")
  );

  const publicUnsub = onSnapshot(publicQuery, () => {
    void refresh();
  });
  const ownUnsub = onSnapshot(ownQuery, () => {
    void refresh();
  });

  let cached: Strategy[] = [];
  let pending = false;

  async function refresh() {
    if (pending) return;
    pending = true;
    try {
      const both = await getStrategies(uid);
      cached = both;
      callback(cached);
    } finally {
      pending = false;
    }
  }

  void refresh();

  return () => {
    publicUnsub();
    ownUnsub();
  };
}

export async function addStrategy(
  name: string,
  uid: string,
  isPublic: boolean
): Promise<string> {
  const ref = await addDoc(strategiesRef(), {
    name,
    createdBy: uid,
    createdAt: serverTimestamp(),
    isPublic,
    images: [],
    note: "",
  });
  return ref.id;
}

export async function updateStrategy(
  id: string,
  uid: string,
  data: { name?: string; note?: string; images?: string[] }
): Promise<void> {
  const snap = await getDoc(strategyDoc(id));
  if (!snap.exists()) return;
  if (snap.data().createdBy !== uid) {
    throw new Error("Bu stratejiyi düzenleme yetkiniz yok.");
  }
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.note !== undefined) updates.note = data.note;
  if (data.images !== undefined) updates.images = data.images;
  await updateDoc(strategyDoc(id), updates);
}

export async function deleteStrategy(id: string, uid: string): Promise<void> {
  const snap = await getDoc(strategyDoc(id));
  if (!snap.exists()) return;
  const data = snap.data();
  if (data.createdBy !== uid) {
    throw new Error("Bu stratejiyi silme yetkiniz yok.");
  }
  await deleteDoc(strategyDoc(id));
}
