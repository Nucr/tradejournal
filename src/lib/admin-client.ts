import { auth } from "./firebase";

export async function adminGet<T>(path: string): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new Error("Giriş yapılmamış");

  const token = await user.getIdToken();
  const res = await fetch(path, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let message = `Hata ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json();
}
