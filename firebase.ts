import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDHKJVzi5UvUwBd9aZ5HuU87ZlaiJXZzYE',
  authDomain: 'ecoscoremobile.firebaseapp.com',
  projectId: 'ecoscoremobile',
  storageBucket: 'ecoscoremobile.firebasestorage.app',
  messagingSenderId: '429592274923',
  appId: '1:429592274923:web:f9283f4999e2dcb6a51bae',
  measurementId: 'G-YKMN84L9WP'
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export { app };