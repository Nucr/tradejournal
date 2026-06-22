"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";
import { getProfile } from "./profile";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  needsOnboarding: boolean | null;
  refreshOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SKIP_ROUTES = ["/login", "/register", "/onboarding"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  async function checkOnboarding(uid: string) {
    const profile = await getProfile(uid);
    if (!profile || !profile.displayName) {
      setNeedsOnboarding(true);
    } else {
      setNeedsOnboarding(false);
    }
  }

  async function refreshOnboarding() {
    if (user) {
      await checkOnboarding(user.uid);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        await checkOnboarding(u.uid);
      } else {
        setNeedsOnboarding(null);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (loading || !user || needsOnboarding === null) return;
    if (SKIP_ROUTES.includes(pathname)) return;
    if (needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [needsOnboarding, loading, user, pathname, router]);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(name: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, needsOnboarding, refreshOnboarding }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalı");
  return ctx;
}
