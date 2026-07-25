import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnhpeV6nenhdiaeWMjMR6F8xq0aA-yg3g",
  authDomain: "escala-culto-infantil.firebaseapp.com",
  projectId: "escala-culto-infantil",
  storageBucket: "escala-culto-infantil.firebasestorage.app",
  messagingSenderId: "451702979289",
  appId: "1:451702979289:web:a43f34a184f0d20757dcc8",
  measurementId: "G-F1VB6HBC9M"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
