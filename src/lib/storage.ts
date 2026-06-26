import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85,
  maxSize = 120 * 1024
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width;
      let h = img.height;
      if (w > maxWidth || h > maxHeight) {
        const ratio = Math.min(maxWidth / w, maxHeight / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      let currentQuality = quality;
      function tryCompress(q: number) {
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size <= maxSize) {
              resolve(blob);
            } else if (blob && q > 0.1) {
              tryCompress(q - 0.1);
            } else if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Resim sıkıştırılamadı"));
            }
          },
          "image/jpeg",
          q
        );
      }
      tryCompress(currentQuality);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Resim yüklenemedi"));
    };
    img.src = url;
  });
}

export async function uploadAvatar(
  uid: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Sadece resim dosyaları kabul edilir");
  }

  const compressedBlob = await compressImage(file);

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

    reader.readAsDataURL(compressedBlob);
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
