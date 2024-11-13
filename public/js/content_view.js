

async function displayUserInfo() {
    firebase.auth().onAuthStateChanged(user => {
        if (!user) {
            console.log("You need to be signed in to see your posts.");
            return;
        }

        // Reference the current user's document by UID
        let currentUser = db.collection("users").doc(user.uid);

        currentUser.get().then(userDoc => {
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

function displayPostInfo() {
    let params = new URL(window.location.href); // Get URL of the search bar
    let ID = params.searchParams.get("docID"); // Get value for key "docID"
    if (!ID) {
        console.error("No post ID found in URL.");
        return;
    }
    console.log("Post ID:", ID);

    // Fetch the post document
    db.collection("posts")
        .doc(ID)
        .get()
        .then(doc => {
            if (!doc.exists) {
                console.error("Post not found");
                return;
            }
            const thisPost = doc.data();
            const PostCode = thisPost.code;
            const PostName = thisPost.name;
            
            // Populate title and image
            document.getElementById("title").innerHTML = PostName;
            let imgEvent = document.querySelector(".post-picture");
            imgEvent.src = "./images/" + PostCode + ".jpg";
        }).catch(error => {
            console.error("Error fetching post data:", error);
        });

}

displayPostInfo();

