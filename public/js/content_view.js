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

        // Now fetch and display the user's profile picture
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
              document.getElementById("user-name").innerHTML = userData.username; // Use username from profile data
              document.getElementById("user-handle").innerHTML = "@" + userData.userHandle; // Use handle from profile data
            } else {
              console.log("User profile not found.");
            }
          })
          .catch((error) => {
            console.error("Error fetching user profile:", error);
          });
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

displayPictureInfo();

