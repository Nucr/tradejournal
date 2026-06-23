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

  const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
  if (!signRes.ok) throw new Error("Cloudinary imza alınamadı");
  const { signature, timestamp, api_key, cloud_name, folder } = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", api_key);
  formData.append("signature", signature);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || "Cloudinary yükleme hatası"));
        } catch {
          reject(new Error("Cloudinary yükleme hatası"));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Cloudinary bağlantı hatası"));

    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`);
    xhr.send(formData);
  });
}

export async function deleteStrategyImage(): Promise<void> {
}
