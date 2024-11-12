document.getElementById('login-redirect').addEventListener("click", function () {
  window.location.href = "/html/login.html"; // send to login page
});

document.getElementById('submit').addEventListener("click", function (event) {
  event.preventDefault();


  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const username = document.getElementById('username').value;
  const userHandle = document.getElementById('userHandle').value;

  // input validation
  if (!email || !password || !username || !userHandle) {
    alert("Please fill out all fields.");
    return;
  }

  // Sign up 
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;


      return db.collection("users").doc(user.uid).set({
        userID: user.uid,
        email: user.email,
        username: username,
        userHandle: userHandle,
      });
    })
    .then(() => {
      // send to landing page
      window.location.href = "/html/Landing.html";
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage);
    });
});
