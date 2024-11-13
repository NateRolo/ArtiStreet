
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
                let userBio = userDoc.data().userBio;
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

async function displayPostsDynamically(collection, type = "user") {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.log("User not logged in.");
        return;
    }

    const cardTemplate = document.getElementById("post-template");
    const postContainer = document.getElementById(`${collection}-go-here`);
    postContainer.innerHTML = ""; 

    let query;
    
    if (type === "user" ) {
        query = db.collection(collection)
        .where("user.uid", "==", user.uid)
        .orderBy("time", "desc");
        
    } else {
        query = db.collection(collection)
        .where("user,uid", "==", user.likes)
    }
   
    const posts = await query.get();

    posts.forEach(doc => {
        const title = doc.data().title;
        const location = `${doc.data().street}, ${doc.data().city}`;
        const time = doc.data().time;
        const imgURL = doc.data().image_URL;
        const userName = doc.data().user.username;
        const docID = doc.id;

        let newpost = cardTemplate.content.cloneNode(true);
        const postPictureElement = newpost.querySelector('.post-picture');
        const postTitleElement = newpost.querySelector('.post-title');

        if (postPictureElement && imgURL) {
            postPictureElement.src = imgURL;
            postPictureElement.onclick = () => {
                window.location.href = `content_view.html?postId=${docID}`;
            };
        }

        postTitleElement.innerHTML = title;
        postTitleElement.onclick = () => {
            window.location.href = `content_view.html?postId=${docID}`;
        };

        newpost.querySelector('.post-user').innerHTML = userName;
        newpost.querySelector('.post-location').innerHTML = location;
        const likeButton = newpost.querySelector('.post-like');
        likeButton.id = 'save-' + docID;

        
        likeButton.onclick = () => toggleLike(docID, likeButton);

        db.collection('users').doc(user.uid).get().then(userDoc => {
            const likes = userDoc.data().likes || [];
            if (likes.includes(docID)) {
                likeButton.src = `../img/heart(1).png`;
            }
        });

        if (time) {
            newpost.querySelector('.post-time').innerHTML = timeAgo(time.toDate());
        } else {
            newpost.querySelector('.post-time').innerHTML = "Unknown time";
        }

        postContainer.appendChild(newpost);
    });
}

// toggle likes
function toggleLike(postID, likeButton) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("You need to be logged in to view this content.");
        return;
    }

    const currentUserRef = db.collection('users').doc(user.uid);

    currentUserRef.get().then(userDoc => {
        const likes = userDoc.data().likes || [];
        // unlike post
        if (likes.includes(postID)) {
            currentUserRef.update({
                likes: firebase.firestore.FieldValue.arrayRemove(postID)
            }).then(() => {
                likeButton.src = '../img/heart.png'; 
                console.log("Post has been unliked for " + postID);
            }).catch(error => console.error("Error unliking post:", error));
        } else { // like post
                currentUserRef.update({
                likes: firebase.firestore.FieldValue.arrayUnion(postID)
            }).then(() => {
                likeButton.src = '../img/heart(1).png'; 
                console.log("Post has been liked for " + postID);
            }).catch(error => console.error("Error liking post:", error));
        }
    }).catch(error => console.error("Error retrieving user data:", error));
};

firebase.auth().onAuthStateChanged((user) => {
    if (user) {        
        displayPostsDynamically("posts", "user");
    } else {
        console.log("User not logged in.");        
    }
});

