import {
  collection,
  addDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { Goal, GoalInput } from "./types";

function goalsCollection(uid: string) {
  return collection(db, "users", uid, "goals");
}

function goalDoc(uid: string, id: string) {
  return doc(db, "users", uid, "goals", id);
}

function mapGoal(d: { id: string; data: () => Record<string, unknown> }): Goal {
  const data = d.data();
  return {
    id: d.id,
    title: data.title as string,
    targetValue: (data.targetValue as number) ?? 0,
    currentValue: (data.currentValue as number) ?? 0,
    metric: data.metric as Goal["metric"],
    period: data.period as Goal["period"],
    createdAt: (data.createdAt as string) ?? new Date().toISOString(),
  };
}

export async function addGoal(uid: string, input: GoalInput): Promise<string> {
  const docRef = await addDoc(goalsCollection(uid), {
    ...input,
    currentValue: 0,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateGoal(uid: string, id: string, data: Partial<GoalInput & { currentValue: number }>) {
  await updateDoc(goalDoc(uid, id), data);
}

export async function deleteGoal(uid: string, id: string) {
  await deleteDoc(goalDoc(uid, id));
}

export async function getGoals(uid: string): Promise<Goal[]> {
  const snap = await getDocs(goalsCollection(uid));
  return snap.docs.map(mapGoal);
}

export function subscribeToGoals(
  uid: string,
  callback: (goals: Goal[]) => void
): Unsubscribe {
  return onSnapshot(goalsCollection(uid), (snap) => {
    callback(snap.docs.map(mapGoal));
  });
}
