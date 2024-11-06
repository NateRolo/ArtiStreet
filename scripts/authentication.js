// Submit button
document.getElementById('submit').addEventListener("click", function (event) {
   event.preventDefault();

   // Inputs
   const email = document.getElementById('email').value;
   const password = document.getElementById('password').value;

   // Sign up the user
   firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
         // Successfully signed up
         const user = userCredential.user;
         window.location.href = "Landing.html";
      })
      .catch((error) => {
         const errorMessage = error.message;
         alert(errorMessage);
      });
});
