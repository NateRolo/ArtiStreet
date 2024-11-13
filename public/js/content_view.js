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

// function displayPostInfo() {
//     let params = new URL(window.location.href); // Get URL of the search bar
//     let postID = params.searchParams.get("docID"); // Get value for key "docID"
//     if (!ID) {
//         console.error("No post ID found in URL.");
//         return;
//     }
//     console.log("Post ID:", ID);

//     console.log(postID);

//     // Fetch the post document
//     db.collection("posts")
//         .doc(ID)
//         .get()
//         .then(doc => {
//             if (!doc.exists) {
//                 console.error("Post not found");
//                 return;
//             }
//             const thisPost = doc.data();
//             const PostCode = thisPost.code;
//             const PostName = thisPost.name;
            
//             // Populate title and image, ensuring elements are loaded first
//             if (PostName) document.getElementById("title").innerText = PostName;
//             let imgEvent = document.querySelector(".post-picture");
//             if (imgEvent) imgEvent.src = "./images/" + PostCode + ".jpg";
//         }).catch(error => {
//             console.error("Error fetching post data:", error);
//         });
// }

// displayPostInfo();


function displayPictureInfo() {
    let params = new URL(window.location.href);
    let ID = params.searchParams.get("docID"); // get value for key "docID"
    console.log("Post ID:", ID);

    // Double-check the collection name, it should be "posts" based on your setup
    db.collection("posts")
        .doc(ID)
        .get()
        .then((doc) => {
            if (doc.exists) {
                let thisPost = doc.data();
                let postCode = thisPost.image_URL; // assuming 'code' is the field storing image names
                let postName = thisPost.title;

                // Populate the title and image
                document.querySelector(".post-title").innerHTML = postName;
                
                // Set the post image source based on the post code
                let imgElement = document.querySelector(".post-picture");
                imgElement.src = "../images/" + postCode + ".jpg";
            } else {
                console.log("No such document!");
            }
        })
        .catch((error) => {
            console.log("Error getting document:", error);
        });
}

// Call the function to load post info on page load
displayPictureInfo();
