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

var currentUser;

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
        const userName = doc.data().user.username;
        const docID = doc.id;

        let newpost = cardTemplate.content.cloneNode(true);

        const postPictureElement = newpost.querySelector('.post-picture');
        if (postPictureElement && imgURL) {
            postPictureElement.src = imgURL;
        }

        newpost.querySelector('.post-user').innerHTML = userName;
        newpost.querySelector('.post-location').innerHTML = location;
        newpost.querySelector('.post-title').innerHTML = title;
        newpost.querySelector('.post-like').id = 'save-' + docID;
        newpost.querySelector('.post-like').onclick = () => saveLike(docID);

        currentUser = db.collection('users').doc(firebase.auth().currentUser.uid);


        currentUser.get().then(userDoc => {
            var likes = userDoc.data().likes;
            console.log(likes);
            if (likes.includes(docID)) {
                document.getElementById('save-' + docID).src = `../img/heart(1).png`;
            }
        });

        
        
        if (time) {
            const timeAgoText = timeAgo(time.toDate());
            newpost.querySelector('.post-time').innerHTML = timeAgoText;
        } else {
            newpost.querySelector('.post-time').innerHTML = "Unknown time";
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

//-----------------------------------------------------------------------------
// This function is called whenever the user clicks on the "bookmark" icon.
// It adds the hike to the "bookmarks" array
// Then it will change the bookmark icon from the hollow to the solid version. 
//-----------------------------------------------------------------------------
function saveLike(postID) {
    const user = firebase.auth().currentUser;
    currentUser = db.collection('users').doc(user.uid);
    console.log(currentUser);
    // Manage the backend process to store the hikeDocID in the database, recording which hike was bookmarked by the user.
    currentUser.update({
        // Use 'arrayUnion' to add the new bookmark ID to the 'bookmarks' array.
        // This method ensures that the ID is added only if it's not already present, preventing duplicates.
        likes: firebase.firestore.FieldValue.arrayUnion(postID)
    })
        // Handle the front-end update to change the icon, providing visual feedback to the user that it has been clicked.
        .then(function () {
            console.log("Post has been liked for" + postID);
            let iconID = 'save-' + postID;
            //console.log(iconID);
            //this is to change the icon of the hike that was saved to "filled"
            document.getElementById(iconID).src = '../img/heart(1).png';
        });
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
        const userName = doc.data().user.username;
        const docID = doc.id;

        let newpost = cardTemplate.content.cloneNode(true);

        const postPictureElement = newpost.querySelector('.post-picture');
        if (postPictureElement && imgURL) {
            postPictureElement.src = imgURL;
            // Add click event to the image only to redirect to content_view.html
            postPictureElement.onclick = () => {
                window.location.href = `content_view.html?postId=${docID}`;
            };
        }

        newpost.querySelector('.post-user').innerHTML = userName;
        newpost.querySelector('.post-location').innerHTML = location;
        newpost.querySelector('.post-title').innerHTML = title;
        newpost.querySelector('.post-like').id = 'save-' + docID;
        newpost.querySelector('.post-like').onclick = () => saveLike(docID);

        currentUser = db.collection('users').doc(firebase.auth().currentUser.uid);

        currentUser.get().then(userDoc => {
            var likes = userDoc.data().likes;
            if (likes.includes(docID)) {
                document.getElementById('save-' + docID).src = `../img/heart(1).png`;
            }
        });

        // Add time display
        if (time) {
            const timeAgoText = timeAgo(time.toDate());
            newpost.querySelector('.post-time').innerHTML = timeAgoText;
        } else {
            newpost.querySelector('.post-time').innerHTML = "Unknown time";
        }

        document.getElementById(collection + "-go-here").appendChild(newpost);
    });
}
