// Firebase Configuration and Firestore Sync Utility
// Signs students in anonymously, then saves progress at:
//   students/<anonymous user ID>/records/<student name>
// This path matches the Firestore rules (each user can only touch their own students/<uid>/... data).
// If Firebase is unavailable, the app falls back to localStorage.

const firebaseConfig = {
  apiKey: "AIzaSyC9k1-BbyseUMja6GHwIp5t2yAi8PgmIOY",
  authDomain: "lessonapp-c37f3.firebaseapp.com",
  projectId: "lessonapp-c37f3",
  storageBucket: "lessonapp-c37f3.firebasestorage.app",
  messagingSenderId: "822960009356",
  appId: "1:822960009356:web:185e9f42368ad18112cba9"
};

let db = null;
let auth = null;
let firebaseInitialized = false;

// Initialize Firebase and sign in anonymously
async function initFirebase() {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.log("Firebase config placeholder detected. Using localStorage fallback.");
    return;
  }
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const { getAuth, signInAnonymously } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
    const { getFirestore, doc, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Reuses the existing anonymous user in this browser, or creates a new one
    await signInAnonymously(auth);

    window.firestoreUtils = { doc, setDoc, getDoc };
    firebaseInitialized = true;
    console.log("Firebase initialized. Signed in as:", auth.currentUser.uid);
  } catch (e) {
    console.warn("Firebase initialization failed, using localStorage fallback:", e);
  }
}

// Other code awaits this so it never reads/writes before sign-in finishes
const firebaseReady = initFirebase();

// Student Data Sync Service
const StudentTracker = {
  studentId: null,
  studentName: "",

  setStudent(name) {
    this.studentName = name.trim();
    this.studentId = this.studentName.toLowerCase().replace(/[^a-z0-9_-]/g, "_") || "student_guest";
  },

  // Returns the Firestore document reference, or null if Firebase isn't ready
  _ref() {
    if (firebaseInitialized && db && auth && auth.currentUser && window.firestoreUtils) {
      const { doc } = window.firestoreUtils;
      return doc(db, "students", auth.currentUser.uid, "records", this.studentId);
    }
    return null;
  },

  async loadProgress() {
    const defaultData = {
      name: this.studentName,
      completedQuestions: [],
      attempts: {}, // questionId -> number of attempts
      totalPoints: 0,
      streak: 0,
      updatedAt: new Date().toISOString()
    };

    if (!this.studentId) return defaultData;

    await firebaseReady;

    const ref = this._ref();
    if (ref) {
      try {
        const { getDoc } = window.firestoreUtils;
        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
          return docSnap.data();
        }
      } catch (err) {
        console.warn("Firestore read failed, falling back to local:", err);
      }
    }

    // Local Storage Fallback
    const local = localStorage.getItem(`std_dev_student_${this.studentId}`);
    return local ? JSON.parse(local) : defaultData;
  },

  async saveQuestionAttempt(questionId, isCorrect, stepAttempts) {
    if (!this.studentId) return;

    const currentData = await this.loadProgress();

    // Update attempts
    currentData.attempts[questionId] = (currentData.attempts[questionId] || 0) + 1;

    if (isCorrect && !currentData.completedQuestions.includes(questionId)) {
      currentData.completedQuestions.push(questionId);
      currentData.totalPoints += 100;
      currentData.streak += 1;
    } else if (!isCorrect) {
      currentData.streak = 0;
    }

    currentData.name = this.studentName;
    currentData.totalAttempts = Object.values(currentData.attempts).reduce((a, b) => a + b, 0);
    currentData.updatedAt = new Date().toISOString();

    // Save to LocalStorage
    localStorage.setItem(`std_dev_student_${this.studentId}`, JSON.stringify(currentData));

    // Save to Firestore if available
    const ref = this._ref();
    if (ref) {
      try {
        const { setDoc } = window.firestoreUtils;
        await setDoc(ref, currentData, { merge: true });
        console.log("Firestore synced successfully for student:", this.studentName);
      } catch (err) {
        console.warn("Firestore write failed:", err);
      }
    }

    return currentData;
  }
};
