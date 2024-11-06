//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
    apiKey: "AIzaSyBPz_uJEJn17ld3tEuoGTNgouSrmzjsccg",
    authDomain: "comp-1800-bby-31.firebaseapp.com",
    projectId: "comp-1800-bby-31",
    storageBucket: "comp-1800-bby-31.appspot.com",
    messagingSenderId: "698245109532",
    appId: "1:698245109532:web:38908fdd53d396a91f4cd9"
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
