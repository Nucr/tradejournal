import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function uploadAvatar(
  uid: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Sadece resim dosyaları kabul edilir");
  }
  if (file.size > 200 * 1024) {
    throw new Error("Dosya boyutu 200KB'dan büyük olamaz");
  }

  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        await updateDoc(doc(db, "users", uid), { avatarUrl: dataUrl });
        resolve(dataUrl);
      } catch (err) {
        reject(new Error("Avatar kaydedilemedi"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Dosya okunamadı"));
    };

    reader.readAsDataURL(file);
  });
}

export async function deleteAvatar(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { avatarUrl: "" });
}

export async function uploadStrategyImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Sadece resim dosyaları kabul edilir");
  }
  if (file.size > 150 * 1024) {
    throw new Error("Dosya boyutu 150KB'dan büyük olamaz");
  }

  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error("Dosya okunamadı"));
    };

    reader.readAsDataURL(file);
  });
}

export async function deleteStrategyImage(): Promise<void> {
}
