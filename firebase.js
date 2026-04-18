// js/firebase.js
// Firebase setup and authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "..."
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

// Sign in function
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Signed in:", user.displayName, user.uid);

    // Check if user exists in Firestore, if not create
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        createdAt: new Date(),
      });
    }

    return user;
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
}

// Sign out function
export async function signOutUser() {
  await signOut(auth);
  console.log("User signed out");
}

// Observe auth state
export function observeAuth(callback) {
  onAuthStateChanged(auth, user => {
    callback(user);
  });
}