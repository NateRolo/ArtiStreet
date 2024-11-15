// formats timestamp of posts as "x time ago"
function timeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval > 1 ? 's' : ''} ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval > 1 ? 's' : ''} ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;

    return "just now";
}

// populate page with user's info 
async function displayUserInfo() {
    firebase.auth().onAuthStateChanged(user => {

        console.log(user);
        if (!user) {
            console.log("You need to be signed in to see your posts.");
        }
        //go to the correct user document by referencing to the user uid
        currentUser = db.collection("users").doc(user.uid);
        //get the document for current user.
        currentUser.get()
            .then(userDoc => {
                //get the data fields of the user
                let userName = userDoc.data().username;
                let userHandle = userDoc.data().userHandle;
                let userBio = userDoc.data().bio;
                //if the data fields are not empty, then write them in to the form.
                if (userName != null) {
                    document.getElementById("user-name").innerHTML = userName;
                }
                if (userHandle != null) {
                    document.getElementById("user-handle").innerHTML = "@" + userHandle;
                }
                if (userBio != null) {
                    document.getElementById("user-bio").innerHTML = userBio;
                }
            })
    })
}
displayUserInfo();


// populate page with posts 
async function displayPostsDynamically(collection, filterType = "user") {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.log("User not logged in.");
        return;
    }

    const cardTemplate = document.getElementById("post-template");
    const postContainer = document.getElementById(`${collection}-go-here`);
    postContainer.innerHTML = "";

    let userLikes = [];
    if (currentUser) {
        // Fetch user's liked posts
        const userDoc = await db.collection('users').doc(user.uid).get();
        userLikes = userDoc.data().likes || [];
    }

    let query;
    if (filterType === "user") { // show user posts
        query = db.collection(collection)
            .where("user.uid", "==", user.uid)
            .orderBy("time", "desc");
    } else if (filterType === "liked") { // show liked posts
        const userDoc = await db.collection('users').doc(user.uid).get();
        const likes = userDoc.data().likes || [];
        query = db.collection(collection).where(firebase.firestore.FieldPath.documentId(), 'in', likes);
    }

    const posts = await query.get();
    // populate template with data
    posts.forEach(doc => {
        const data = doc.data();
        const docID = doc.id;
        const likesCount = data.likesCount || 0;
        let newPost = cardTemplate.content.cloneNode(true);

        const postPictureElement = newPost.querySelector('.post-picture');
        const postTitleElement = newPost.querySelector('.post-title');

        if (postPictureElement && data.image_URL) {
            postPictureElement.src = data.image_URL;
            postPictureElement.onclick = () => window.location.href = `content_view.html?postId=${doc.id}`;
        }

        postTitleElement.innerHTML = data.title;
        postTitleElement.onclick = () => window.location.href = `content_view.html?postId=${doc.id}`;

        newPost.querySelector('.post-user').innerHTML = data.user.username;
        newPost.querySelector('.post-location').innerHTML = `${data.street}, ${data.city}`;
        newPost.querySelector('.post-time').innerHTML = data.time ? timeAgo(data.time.toDate()) : "Unknown time";

        // Set like button and like count
        const likeButton = newPost.querySelector('.post-like');
        const likeCountElement = newPost.querySelector('.post-like-count');
        if (likeButton) {
            likeButton.id = 'save-' + docID;
            if (userLikes.includes(docID)) {
                likeButton.src = '../img/heart(1).png'; // Set to liked icon
            } else {
                likeButton.src = '../img/heart.png'; // Set to unliked icon
            }
            likeButton.onclick = () => toggleLike(docID);
        }
        if (likeCountElement) {
            likeCountElement.id = 'like-count-' + docID;
            likeCountElement.innerText = `${likesCount} like${likesCount !== 1 ? 's' : ''}`;
        }

        postContainer.appendChild(newPost);
    });
}

async function toggleLike(postID, filterType = "user") {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error("No user is signed in.");
        return;
    }

    const currentUser = db.collection('users').doc(user.uid);
    const postRef = db.collection('posts').doc(postID);
    const iconID = 'save-' + postID;
    const likeIcon = document.getElementById(iconID);
    const likeCountElement = document.getElementById('like-count-' + postID);
    const postElement = document.getElementById(`post-${postID}`); // Post container

    try {
        // Fetch current user's liked posts
        const userDoc = await currentUser.get();
        const likes = userDoc.data().likes || [];

        // Fetch current like count of the post
        const postDoc = await postRef.get();
        let likeCount = postDoc.data().likesCount || 0;

        if (likes.includes(postID)) {
            // Unlike the post
            await currentUser.update({
                likes: firebase.firestore.FieldValue.arrayRemove(postID)
            });
            await postRef.update({
                likesCount: firebase.firestore.FieldValue.increment(-1)
            });

            console.log("Post has been unliked for " + postID);
            if (likeIcon) {
                likeIcon.src = '../img/heart.png'; // Set to unliked icon
            }
            likeCount--; // Decrement local counter

            // Remove post dynamically if in "liked" tab
            if (filterType === "liked" && postElement) {
                postElement.remove();
            }
        } else {
            // Like the post
            await currentUser.update({
                likes: firebase.firestore.FieldValue.arrayUnion(postID)
            });
            await postRef.update({
                likesCount: firebase.firestore.FieldValue.increment(1)
            });

            console.log("Post has been liked for " + postID);
            if (likeIcon) {
                likeIcon.src = '../img/heart(1).png'; // Set to liked icon
            }
            likeCount++; // Increment local counter
        }

        // Update the like count display
        if (likeCountElement) {
            likeCountElement.innerText = `${likeCount} like${likeCount !== 1 ? 's' : ''}`;
        }
    } catch (error) {
        console.error("Error updating like status or count:", error);
    }
}


// confirm user is logged in
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        displayPostsDynamically("posts", "user");
    } else {
        console.log("User not logged in.");
    }
});

// nav tab to view liked posts
document.getElementById("user-likes").addEventListener("click", () => {
    displayPostsDynamically("posts", "liked");
    document.getElementById("user-likes").classList.toggle("active");
    document.getElementById("user-posts").classList.remove("active");
});

// nav tab  to view user's own posts
document.getElementById("user-posts").addEventListener("click", () => {
    displayPostsDynamically("posts", "user");
    document.getElementById("user-posts").classList.toggle("active");
    document.getElementById("user-likes").classList.remove("active");
});
