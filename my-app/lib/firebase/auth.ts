"use client";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  onAuthStateChanged as _onAuthStateChanged,
  Unsubscribe,
  User,
} from "firebase/auth";
import { useState } from "react";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function onAuthStateChanged(cb: (user: any) => void): Unsubscribe {
  return _onAuthStateChanged(auth, cb);
}

export async function createUser(email: string, password: string): Promise<UserCredential> {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error creating new user", error);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out", error);
  }
}

export function useAuthState(): User | null {
  const [user, setUser] = useState<User | null>(null);

  onAuthStateChanged((currentUser) => {
    setUser(currentUser);
  });

  return user;
}