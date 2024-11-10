// send back to signup page
document.getElementById('signup-redirect').addEventListener("click", function() {
    window.location.href = "/html/sign_up.html"; // Redirects to the signup page
  });
  
  // login button
  document.getElementById('login').addEventListener("click", function (event) {
    event.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    // input validation
    if (!email || !password) {
      alert("Please fill out all fields.");
      return;
    }
  
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        window.location.href = "/html/Landing.html";
      })
      .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
      });
  });
  