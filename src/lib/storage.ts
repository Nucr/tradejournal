import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function uploadAvatar(
  uid: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Sadece resim dosyaları kabul edilir");
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Dosya boyutu 2MB'dan büyük olamaz");
  }

  const storage = getStorage();
  const storageRef = ref(storage, `avatars/${uid}/profile.jpg`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.(pct);
      },
      (err) => {
        reject(new Error(`Yükleme başarısız: ${err.message}`));
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await updateDoc(doc(db, "users", uid), { avatarUrl: downloadURL });
        resolve(downloadURL);
      }
    );
  });
}

export async function deleteAvatar(uid: string): Promise<void> {
  const storage = getStorage();
  const storageRef = ref(storage, `avatars/${uid}/profile.jpg`);
  try {
    await deleteObject(storageRef);
  } catch {
    // Dosya zaten yoksa sorun değil
  }
  await updateDoc(doc(db, "users", uid), { avatarUrl: "" });
}
