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

// Display posts 
async function displayPostsDynamically(collection) {
    let cardTemplate = document.getElementById("post-landing-template");

    const allPosts = await db.collection(collection).orderBy("time", "desc").get();

    allPosts.forEach(async doc => {
        const title = doc.data().title;
        const location = doc.data().street.concat(", " + doc.data().city);
        const time = doc.data().time;
        const imgURL = doc.data().image_URL;

        // Clone the template
        let newpost = cardTemplate.content.cloneNode(true);

        // Set the image
        const postPictureElement = newpost.querySelector('.post-picture');
        if (postPictureElement && imgURL) {
            postPictureElement.src = imgURL;
        }

        // Update other fields
        newpost.querySelector('.post-location').innerHTML = location;
        newpost.querySelector('.post-title').innerHTML = title;

        // Convert Firestore timestamp to JS Date object
        if (time) {
            const timeAgoText = timeAgo(time.toDate());
            newpost.querySelector('.post-time').innerHTML = timeAgoText;
        } else {
            newpost.querySelector('.post-time').innerHTML = "Unknown time";
        }

        // Append to the collection container
        document.getElementById(collection + "-go-here").appendChild(newpost);
    });
}

// Call the function
displayPostsDynamically("posts");
