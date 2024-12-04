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

// populate page with data from firebase
async function displayPostsDynamically(collection, type = "all") {
    const cardTemplate = document.getElementById("post-template");
    const currentUser = firebase.auth().currentUser;

    let userLikes = [];
    if (currentUser) {
        // Fetch user's liked posts
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        userLikes = userDoc.data().likes || [];
    }

    let query;
    if (type === "user") {
        if (!currentUser) {
            alert("You need to be logged in to view your posts.");
            return;
        }

        query = db.collection(collection)
            .where("user.uid", "==", currentUser.uid)
            .orderBy("time", "desc");
    } else {
        query = db.collection(collection)
            .orderBy("time", "desc");
    }

    const posts = await query.get();

    posts.forEach(async (doc) => {
        const data = doc.data();
        const title = data.title;
        const location = data.street.concat(", " + data.city);
        const time = data.time;
        const imgURL = data.image_URL;
        const userName = data.user?.username || "Unknown User";
        const docID = doc.id;
        const likesCount = data.likesCount || 0;
        const userID = data.user?.uid;



        let pfp = "/img/profileImage.png"; // Default profile picture
        // fetch user profile img
        if (userID) {
            try {
                const userDoc = await db.collection('users').doc(userID).get();
                pfp = userDoc.exists && userDoc.data().profile_picture ? userDoc.data().profile_picture : pfp;
            } catch (error) {
                console.error(`Error fetching user document for userID: ${userID}`, error);
            }
        }



        const newpost = cardTemplate.content.cloneNode(true);

        // Set image, title, location, and username
        const postPictureElement = newpost.querySelector('.post-picture');
        const postTopBar = newpost.querySelector('.post-topbar');
        const postBottomBar = newpost.querySelector('.post-bottombar');
        const postTitleElement = newpost.querySelector('.post-title');
        const postProfilePictureElement = newpost.querySelector('.profileIcon');

   

        if (postTopBar || postBottomBar) {
            postTopBar.onclick = () => {
                window.location.href = `content_view.html?docID=${docID}`;
            };

            postBottomBar.onclick = () => {
                window.location.href = `content_view.html?docID=${docID}`;
            };

        
            // Prevent clicks on child elements (e.g., buttons) from overriding the card click
            const likeButton = newpost.querySelector('.post-like');
            if (likeButton) {
                likeButton.onclick = (event) => {
                    event.stopPropagation(); // Prevent click event from bubbling up to the card
                    toggleLike(docID);
                };
            }
        
            const postPictureElement = newpost.querySelector('.post-picture');
            if (postPictureElement) {
                postPictureElement.onclick = (event) => {
                    event.stopPropagation(); // Prevent click event from bubbling up to the card
                    window.location.href = `content_view.html?docID=${docID}`;
                };
            }
        }
        

        //shows the title
        postTitleElement.innerHTML = title;
        postPictureElement.src = imgURL;

        // set profile image
        if (postProfilePictureElement) {
            postProfilePictureElement.src = pfp;
        }

        newpost.querySelector('.post-user').innerHTML = userName;
        newpost.querySelector('.post-user').setAttribute("data-user-id", userID);
        newpost.querySelector('.profileIcon').setAttribute("data-user-id", userID);
        newpost.querySelector('.post-location').innerHTML = location;


        // Set like button and like count
        const likeButton = newpost.querySelector('.post-like');
        const likeCountElement = newpost.querySelector('.post-like-count');
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

        // Display time ago
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




// Toggle like/unlike for a post
async function toggleLike(postID) {
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

// set nav button to active when clicked
const homeButton = document.getElementById("nav-home");
homeButton.onload = homeButton.classList.toggle("active");




document.addEventListener("DOMContentLoaded", () => {
    // Use event delegation on the document or a common parent container
    document.body.addEventListener("click", (event) => {
        // Check if the clicked element has the class "post-user" or "profileIcon"
        if (event.target.classList.contains("post-user") || event.target.classList.contains("profileIcon")) {
            const userId = event.target.getAttribute("data-user-id"); // Get userId from data attribute
            if (userId) {
                window.location.href = `profile.html?userId=${userId}`;
            } else {
                alert("User ID not found. Cannot redirect to profile.");
            }
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    Welcome();
});

function Welcome() {
    const referrer = document.referrer; 
    console.log(document.referrer); 

    const specificPage = "http://localhost:8080/html/login.html"; 

    if (referrer == specificPage) {

        Swal.fire({
            title: "Welcome to Artistreet",
            showConfirmButton: false,
            timer: 500,
            customClass: {
                popup: "my-center-class"
            }
        });
        
    } else {
        console.log("Referrer does not match. Function will not run.");
    }
}

