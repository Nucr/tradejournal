import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";

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
  uid: string,
  strategyId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Sadece resim dosyaları kabul edilir");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Dosya boyutu 5MB'dan büyük olamaz");
  }

  const filename = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `strategies/${uid}/${strategyId}/${filename}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress) {
          onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export async function deleteStrategyImage(imageUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch {
    // ignore if file already deleted
  }
}
