import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// Your Firebase configuration (REPLACE WITH YOUR OWN FROM FIREBASE CONSOLE)
const firebaseConfig = {
  apiKey: "AIzaSyBfhaStSy55MSqIsJBTi0VM9KZjN_SmKvo",
  authDomain: "diya-b0b34.firebaseapp.com",
  projectId: "diya-b0b34",
  storageBucket: "diya-b0b34.firebasestorage.app",
  messagingSenderId: "600717395589",
  appId: "1:600717395589:web:58e59f6f8a8041f6f4cbec",
  measurementId: "G-P39322P13Q" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Email/Password Auth functions
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const registerUser = async (email, password, displayName, phoneNumber) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Add user data to Firestore
    await addDoc(collection(db, 'users'), {
      uid: userCredential.user.uid,
      email: email,
      displayName: displayName,
      phoneNumber: phoneNumber,
      isPhoneVerified: false,
      createdAt: new Date().toISOString()
    });
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset email sent!" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Phone OTP Verification functions
export const setupRecaptcha = (containerId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'invisible',
      'callback': (response) => {
        console.log("reCAPTCHA verified");
      }
    });
  }
  return window.recaptchaVerifier;
};

export const sendOTP = async (phoneNumber, recaptchaContainer) => {
  try {
    const appVerifier = setupRecaptcha(recaptchaContainer);
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return { success: true, message: "OTP sent successfully!" };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: error.message };
  }
};

export const verifyOTP = async (otpCode) => {
  try {
    const result = await window.confirmationResult.confirm(otpCode);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Task operations with Firestore
export const saveTaskToFirestore = async (userId, task) => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      userId: userId,
      ...task,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getTasksFromFirestore = async (userId) => {
  try {
    const q = query(collection(db, 'tasks'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, tasks };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateTaskInFirestore = async (taskId, updatedTask) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, updatedTask);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteTaskFromFirestore = async (taskId) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};