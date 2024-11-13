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


function redirectToComment() {
    window.location.href = "Comment.html";
}
