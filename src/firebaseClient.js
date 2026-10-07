import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDmupQfSoIzFv2MDZyQgUNX_GSYfJcZeCo',
  authDomain: 'nutrioproject.firebaseapp.com',
  projectId: 'nutrioproject',
  storageBucket: 'nutrioproject.firebasestorage.app',
  messagingSenderId: '192994596011',
  appId: '1:192994596011:web:7548e7e2ba003316ee53ee',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, 'nutrio');