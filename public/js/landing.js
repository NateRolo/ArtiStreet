// Convert time to format "x time ago"
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

async function displayPostsDynamically(collection, type = "all") {
    let cardTemplate = document.getElementById("post-template");

    let query;
    if (type === "user") {
        const user = firebase.auth().currentUser;
        if (!user) {
            alert("You need to be logged in to view your posts.");
            return;
        }

        query = db.collection(collection)
            .where("user.uid", "==", user.uid)
            .orderBy("time", "desc");
    } else {
        query = db.collection(collection)
            .orderBy("time", "desc");
    }

    const posts = await query.get();

    posts.forEach(doc => {
        const title = doc.data().title;
        const location = doc.data().street.concat(", " + doc.data().city);
        const time = doc.data().time;
        const imgURL = doc.data().image_URL;
        const userName = doc.data().user?.username || "Unknown User";
        const docID = doc.id;

        let newpost = cardTemplate.content.cloneNode(true);

        // Set image source and add click event for redirection
        const postPictureElement = newpost.querySelector('.post-picture');
        const postTitleElement = newpost.querySelector('.post-title');
        
        if (postPictureElement && imgURL) {
            postPictureElement.src = imgURL;
            postPictureElement.onclick = () => {
                window.location.href = `content_view.html?docID=${docID}`;
            };
        }

        if (postTitleElement) {
            postTitleElement.innerHTML = title;
            postTitleElement.onclick = () => {
                window.location.href = `content_view.html?docID=${docID}`;
            };
        }

        newpost.querySelector('.post-user').innerHTML = userName;
        newpost.querySelector('.post-location').innerHTML = location;
        const likeButton = newpost.querySelector('.post-like');
        if (likeButton) {
            likeButton.id = 'save-' + docID;
            likeButton.onclick = () => saveLike(docID);
        }

        currentUser = db.collection('users').doc(firebase.auth().currentUser.uid);
        currentUser.get().then(userDoc => {
            const likes = userDoc.data().likes || [];
            if (likes.includes(docID)) {
                likeButton.src = '../img/heart(1).png';
            }
        });

        // Add time display
        const timeElement = newpost.querySelector('.post-time');
        if (time && timeElement) {
            timeElement.innerHTML = timeAgo(time.toDate());
        } else {
            timeElement.innerHTML = "Unknown time";
        }

        document.getElementById(collection + "-go-here").appendChild(newpost);
    });
}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        const pageType = window.location.pathname.includes("profile.html") ? "user" : "all";
        displayPostsDynamically("posts", pageType);
    } else {
        if (window.location.pathname.includes("profile.html")) {
            alert("Please log in to view your posts.");
        } else {
            displayPostsDynamically("posts", "all");
        }
    }
});


function saveLike(postID) {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error("No user is signed in.");
        return;
    }

    currentUser = db.collection('users').doc(user.uid);
    currentUser.update({
        likes: firebase.firestore.FieldValue.arrayUnion(postID)
    })
    .then(() => {
        console.log("Post has been liked for " + postID);
        let iconID = 'save-' + postID;
        const likeIcon = document.getElementById(iconID);
        if (likeIcon) {
            likeIcon.src = '../img/heart(1).png'; 
        }
    })
    .catch(error => {
        console.error("Error liking the post:", error);
    });
}
