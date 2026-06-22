import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";
import { updateUser } from "./users";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

function avatarRef(uid: string) {
  return ref(storage, `avatars/${uid}`);
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  if (file.size > MAX_SIZE) {
    throw new Error("Dosya boyutu 2MB'dan büyük olamaz");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Sadece JPEG, PNG, WebP, GIF ve AVIF dosyaları kabul edilir");
  }

  const snapshot = await uploadBytesResumable(avatarRef(uid), file, {
    contentType: file.type,
  });
  const url = await getDownloadURL(snapshot.ref);

  await updateUser(uid, { avatarUrl: url });

  return url;
}

export async function deleteAvatar(uid: string): Promise<void> {
  try {
    await deleteObject(avatarRef(uid));
  } catch {
    // dosya zaten yoksa sorun değil
  }
  await updateUser(uid, { avatarUrl: "" });
}
