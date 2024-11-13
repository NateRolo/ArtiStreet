async function displayUserInfo() {
    firebase.auth().onAuthStateChanged(user => {
        if (!user) {
            console.log("You need to be signed in to see your posts.");
            return;
        }

        // Reference the current user's document by UID
        let currentUser = db.collection("users").doc(user.uid);

        currentUser.get().then(userDoc => {
            if (!userDoc.exists) {
                console.error("User document does not exist.");
                return;
            }

            let userName = userDoc.data().username;
            let userHandle = userDoc.data().userHandle;
            let userBio = userDoc.data().userBio;

            if (userName) document.getElementById("user-name").innerText = userName;
            if (userHandle) document.getElementById("user-handle").innerText = "@" + userHandle;
            if (userBio) document.getElementById("user-bio").innerText = userBio;
        }).catch(error => {
            console.error("Error fetching user data:", error);
        });
    });
}

displayUserInfo();


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
                let postCode = thisPost.image_URL; 
                let postName = thisPost.title;
                let postCity = thisPost.city; 
                let postStreet = thisPost.street; 
                let postTime = doc.data().time; 

                let postLocation = `${postCity} , ${postStreet}`;

                let formattedTime = postTime.toDate(); 

                let formattedTimeString = formattedTime.toLocaleString(); 

                // Populate the title, time, image, and location
                document.querySelector(".post-title").innerHTML = postName;
                document.querySelector(".post-time").innerHTML = formattedTimeString;
                document.querySelector(".post-location").innerHTML = postLocation;  
                
                let imgElement = document.querySelector(".post-picture");
                imgElement.src = postCode;  
                console.log("Image URL:", postCode);  
                console.log("Formatted Time:", formattedTimeString);  
                console.log("Location:", postLocation);  
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