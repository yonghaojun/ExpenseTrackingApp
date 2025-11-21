import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";

interface AuthContextType {
  user: User | null;
  isLoadingUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingUser(false);

      // Ensure a corresponding users document exists for every authenticated user.
      // This covers sign-ups via email/password and third-party providers.
      const ensureUserDoc = async () => {
        if (!currentUser) return;
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            await setDoc(userDocRef, {
              username: currentUser.displayName || "",
              email: currentUser.email || null,
              avatarUrl: currentUser.photoURL || null,
              defaultCurrency: 'MYR',
              createdAt: serverTimestamp(),
            });
          }
        } catch (err) {
          console.warn('Failed to create/check user doc:', err);
        }
      };

      ensureUserDoc();
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoadingUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
