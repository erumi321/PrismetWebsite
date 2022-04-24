const firebaseConfig = {
    apiKey: "AIzaSyAhE_pGTeY31ppfH8z1kLcBmO6wU_Hb5gI",
    authDomain: "prismetwebsite.firebaseapp.com",
    projectId: "prismetwebsite",
    storageBucket: "prismetwebsite.appspot.com",
    messagingSenderId: "616484592542",
    appId: "1:616484592542:web:3fc6547ef899040781148f",
    measurementId: "G-XTMLZPYECN"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();