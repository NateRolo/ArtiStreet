 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries

 import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
 // Your web app's Firebase configuration
 const firebaseConfig = {
    apiKey: "AIzaSyBPz_uJEJn17ld3tEuoGTNgouSrmzjsccg",
    authDomain: "comp-1800-bby-31.firebaseapp.com",
    projectId: "comp-1800-bby-31",
    storageBucket: "comp-1800-bby-31.firebasestorage.app",
    messagingSenderId: "698245109532",
    appId: "1:698245109532:web:38908fdd53d396a91f4cd9"
 };

 // Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const auth = getAuth(app);

 //submit button

 const submit = document.getElementById('submit');
 submit.addEventListener("click", function (event){
 event.preventDefault()

 //inputs
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
 
 createUserWithEmailAndPassword(auth, email, password)
 .then((userCredential) => {
    // signed up

    const user = userCredential.user;
    alert("Creating Account...")
    window.location.href = "Landing.html";

 })
 .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage)
 })


})

 
