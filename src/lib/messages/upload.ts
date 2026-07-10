import { updateDoc, serverTimestamp } from "firebase/firestore";
import { conversationDoc } from "./conversations";

export async function uploadGroupPhoto(
  conversationId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Sadece resim dosyaları kabul edilir");
  }
  if (file.size > 500 * 1024) {
    throw new Error("Dosya boyutu 500KB'dan büyük olamaz");
  }

  const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
  if (!signRes.ok) throw new Error("Cloudinary imza alınamadı");
  const { signature, timestamp, api_key, cloud_name, folder } = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder + "/groups");
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", api_key);
  formData.append("signature", signature);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = async () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        const url = data.secure_url;
        await updateDoc(conversationDoc(conversationId), {
          photoUrl: url,
          updatedAt: serverTimestamp(),
        });
        resolve(url);
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
