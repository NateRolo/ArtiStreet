 // Populate the page with user info
 function displayPictureInfo() {
  let params = new URL(window.location.href);
  let ID = params.searchParams.get("docID");
  console.log("Post ID:", ID);

  db.collection("posts")
    .doc(ID)
    .get()
    .then((doc) => {
      if (doc.exists) {
        let thisPost = doc.data();
        console.log("Post Data:", thisPost); // Log the entire post document to see its structure

        let postCode = thisPost.image_URL;
        let postName = thisPost.title;
        let user = thisPost.user; // Access the user map from the post document
        let userName = user.username; // Access username from the user map
        let userHandle = user.handle; // Access handle from the user map
        let descOfPost = thisPost.description || ""; // Get description from the post document
        let postCity = thisPost.city;
        let postStreet = thisPost.street;
        let postTime = thisPost.time;

        let postLocation = `${postCity}, ${postStreet}`;

        let formattedTime = postTime.toDate();
        let formattedTimeString = formattedTime.toLocaleString();

        // Populate the title, description, time, image, and location
        document.querySelector(".post-title").innerHTML = postName;
        document.querySelector(".post-description").innerHTML = descOfPost; // Make sure description is displayed
        document.querySelector(".post-time").innerHTML = formattedTimeString;
        document.querySelector(".post-location").innerHTML = postLocation;

        let imgElement = document.querySelector(".post-picture");
        imgElement.src = postCode;
        console.log("Image URL:", postCode);
        console.log("Formatted Time:", formattedTimeString);
        console.log("Location:", postLocation);

        // Now populate the username and handle from the user map
        document.getElementById("user-name").innerHTML = userName; // Use username from user map
        document.getElementById("user-handle").innerHTML = "@" + userHandle; // Use handle from user map
        console.log("Username:", userName);
        console.log("Handle:", userHandle);
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

displayPictureInfo();

// Load comments under the post
function loadComments(postId) {
  const commentsRef = db.collection("comments").where("postId", "==", postId);
  commentsRef.onSnapshot((snapshot) => {
    const commentsList = document.getElementById("comments-list");
    commentsList.innerHTML = "";
    snapshot.forEach((doc) => {
      const comment = doc.data();
      const commentElement = document.createElement("div");
      commentElement.classList.add("comment");
      commentElement.innerHTML = `<strong>${comment.username}</strong>: ${comment.text}`;
      commentsList.appendChild(commentElement);
    });
  });
}

// Post a new comment
document.getElementById("comment-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const commentText = document.getElementById("comment-text").value;
  const postId = getPostIdFromURL(); // Get the current post ID dynamically

  // Ensure the user is logged in
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // Fetch additional user data if stored in Firestore
      db.collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            const username = userData.username; // Replace with the actual field for username in your Firestore

            // Add the comment to Firestore
            db.collection("comments")
              .add({
                postId: postId,
                username: username,
                text: commentText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .then(() => {
                console.log("Comment successfully added!");
                document.getElementById("comment-text").value = ""; // Clear comment input
              })
              .catch((error) => {
                console.error("Error adding comment: ", error);
              });
          } else {
            console.log("User document not found!");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
    } else {
      console.log("No user is logged in.");
    }
  });
});

// Helper function to get the post ID from URL parameters
function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("docID"); // Assumes post ID is passed as a query parameter
}

// Load comments for the current post
const postId = getPostIdFromURL();
loadComments(postId); // Dynamically load comments for the specific post