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
        const userName = doc.data().user.username;

        let newpost = cardTemplate.content.cloneNode(true);

        const postPictureElement = newpost.querySelector('.post-picture');
        if (postPictureElement && imgURL) {
            postPictureElement.src = imgURL;
        }

        newpost.querySelector('.post-user').innerHTML = userName;
        newpost.querySelector('.post-location').innerHTML = location;
        newpost.querySelector('.post-title').innerHTML = title;

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
