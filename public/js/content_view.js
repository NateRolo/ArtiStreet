// Populate the page with user info and post details
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
        console.log("Post Data:", thisPost);

        // Post Details
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
        document.querySelector(".post-description").innerHTML = descOfPost; 
        document.querySelector(".post-time").innerHTML = formattedTimeString;
        document.querySelector(".post-location").innerHTML = postLocation;

        let imgElement = document.querySelector(".post-picture");
        imgElement.src = postCode;

        // Fetch and display the user's profile picture
        db.collection("users")
          .doc(user.uid)
          .get()
          .then((userDoc) => {
            if (userDoc.exists) {
              const userData = userDoc.data();
              const profilePic = userData.profile_picture || "default-profile-pic-url.png"; // Default fallback

              // Replace the SVG with the profile picture
              const profilePicElement = document.createElement("img");
              profilePicElement.src = profilePic;
              profilePicElement.alt = `${userName}'s Profile Picture`;
              profilePicElement.classList.add("profile-picture");
              profilePicElement.style.width = "50px"; // Adjust size as needed
              profilePicElement.style.height = "50px"; // Adjust size as needed
              profilePicElement.style.borderRadius = "50%";

              const svgElement = document.querySelector(".bi-person-circle");
              svgElement.replaceWith(profilePicElement);

              // Display username and user handle
              document.getElementById("user-name").innerHTML = userData.username; 
              document.getElementById("user-handle").innerHTML = "@" + userData.userHandle; 
            } else {
              console.log("User profile not found.");
            }
          })
          .catch((error) => {
            console.error("Error fetching user profile:", error);
          });

        // Load comments under the post
        loadComments(ID);

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