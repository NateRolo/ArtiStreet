document.getElementById('login-redirect').addEventListener("click", function () {
  window.location.href = "/html/login.html"; // send to login page
});

document.getElementById("userHandle").addEventListener("focus", () => {
  const message = document.getElementById("userHandleMessage");
  message.style.display = "block"; // Show the message
});

document.getElementById("userHandle").addEventListener("blur", () => {
  const message = document.getElementById("userHandleMessage");
  message.style.display = "none"; // Hide the message when the input loses focus
});


document.getElementById('submit').addEventListener("click", function (event) {
  event.preventDefault();

  const userHandle = document.getElementById('userHandle').value;

  // Notify the user about the permanence of the user handle
  const confirmation = confirm(
    `Heads up! The user handle "${userHandle}" is permanent and cannot be changed later. Are you sure you want to proceed?`
  );
  if (confirmation) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    

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
  }
});
