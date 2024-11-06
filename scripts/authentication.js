
 // Submit button 
 document.getElementById('submit').addEventListener("click", function (event) {
   event.preventDefault();
 
   // Get form input values
   const email = document.getElementById('email').value;
   const password = document.getElementById('password').value;
 
   // Sign up 
   firebase.auth().createUserWithEmailAndPassword(email, password)
     .then((userCredential) => {
       const user = userCredential.user;
 
       // Write user data to Firestore in the "users" collection
       return db.collection("users").doc(user.uid).set({
         userID: user.uid,
         email: user.email,
         });
     })
     .then(() => {
       // Redirect to the landing page
       window.location.href = "Landing.html";
     })
     .catch((error) => {
       const errorMessage = error.message;
       alert(errorMessage);
     });
 });
 