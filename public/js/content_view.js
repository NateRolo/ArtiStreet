// Populate the page with user info and post details
function displayPictureInfo() {
  const params = new URL(window.location.href);
  const ID = params.searchParams.get("docID");

  if (!ID) {
    console.error("No post ID found in the URL.");
    return;
  }

  console.log("Post ID:", ID);

  db.collection("posts")
    .doc(ID)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.error("No such post document!");
        return;
      }

      const thisPost = doc.data();
      console.log("Post Data:", thisPost);

      const {
        image_URL: postCode,
        title: postName,
        user,
        description: descOfPost = "",
        city: postCity,
        street: postStreet,
        time: postTime,
      } = thisPost;

      const postLocation = `${postCity}, ${postStreet}`;
      const formattedTimeString = postTime.toDate().toLocaleString();

      // Populate the title, description, time, image, and location
      document.querySelector(".post-title").innerHTML = postName;
      document.querySelector(".post-description").innerHTML = descOfPost;
      document.querySelector(".post-time").innerHTML = formattedTimeString;
      document.querySelector(".post-location").innerHTML = postLocation;
      document.querySelector(".post-picture").src = postCode;

      // Fetch and display the user's profile picture
      if (user?.uid) {
        db.collection("users")
          .doc(user.uid)
          .get()
          .then((userDoc) => {
            if (!userDoc.exists) {
              console.warn("User profile not found.");
              return;
            }

            const { profile_picture: profilePic = "default-profile-pic-url.png", username, handle } = userDoc.data();

            // Replace the SVG with the profile picture
            const profilePicElement = document.createElement("img");
            profilePicElement.src = profilePic;
            profilePicElement.alt = `${username}'s Profile Picture`;
            profilePicElement.classList.add("profile-picture");
            profilePicElement.style.width = "50px";
            profilePicElement.style.height = "50px";
            profilePicElement.style.borderRadius = "50%";

            document.querySelector(".bi-person-circle").replaceWith(profilePicElement);

            // Display username and user handle
            document.getElementById("user-name").innerHTML = username;
            document.getElementById("user-handle").innerHTML = `@${handle}`;
          })
          .catch((error) => {
            console.error("Error fetching user profile:", error);
          });
      } else {
        console.warn("No user data found in the post document.");
      }

      // Load comments for this post
      loadComments(ID);
    })
    .catch((error) => {
      console.error("Error fetching post document:", error);
    });
}

displayPictureInfo();

// Load comments for a specific post
// Load comments under the post with profile pictures
function loadComments(postId) {
  const commentsRef = db.collection("comments").where("postId", "==", postId);

  commentsRef.onSnapshot(
    (snapshot) => {
      const commentsList = document.getElementById("comments-list");
      commentsList.innerHTML = ""; // Clear existing comments

      snapshot.forEach((doc) => {
        const { username, text, profile_picture } = doc.data();

        // Create comment container
        const commentElement = document.createElement("div");
        commentElement.classList.add("comment-item");

        // Add profile image
        const profileImg = document.createElement("img");
        profileImg.src = profile_picture || "img/default-profile-pic.png"; // Default fallback
        profileImg.alt = `${username}'s Profile Picture`;
        profileImg.classList.add("comment-profile-img");
        profileImg.style.width = "40px";
        profileImg.style.height = "40px";
        profileImg.style.borderRadius = "50%";
        profileImg.style.marginRight = "10px";

        // Add comment text
        const commentText = document.createElement("div");
        commentText.classList.add("comment-text");
        commentText.innerHTML = `<strong>${username}</strong>: ${text}`;

        // Append profile image and text to the comment element
        commentElement.appendChild(profileImg);
        commentElement.appendChild(commentText);

        // Append the comment element to the comments list
        commentsList.appendChild(commentElement);
      });
    },
    (error) => {
      console.error("Error loading comments:", error);
    }
  );
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
            const { username, profile_picture } = doc.data();

            // Add the comment to Firestore
            db.collection("comments")
              .add({
                postId: postId,
                username: username,
                text: commentText,
                profile_picture: profile_picture || "img/default-profile-pic.png", // Default fallback
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
          console.error("Error fetching user data:", error);
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
