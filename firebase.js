import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
getFirestore
}
from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {

apiKey:"COLOQUE_AQUI",

authDomain:"COLOQUE_AQUI",

projectId:"COLOQUE_AQUI",

storageBucket:"COLOQUE_AQUI",

messagingSenderId:"COLOQUE_AQUI",

appId:"COLOQUE_AQUI"

};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
