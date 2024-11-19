// Get Query Parameter
const getQueryParam = (param) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
};


// Populate Profile Header
async function displayUserProfile(userId) {
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            alert("User not found!");
            return;
        }

        const { username, userHandle, bio, profile_picture } = userDoc.data();

        // Populate profile details
        document.getElementById("user-name").innerText = username || "Unknown User";
        document.getElementById("user-handle").innerText = userHandle ? `@${userHandle}` : "@unknown";
        document.getElementById("user-bio").innerText = bio || "No bio available.";
        document.getElementById("pfp").src = profile_picture || "/img/profileImage.png";

        // Hide edit profile and log out button if this is not the current user's profile
        const currentUser = firebase.auth().currentUser;
        if (!currentUser || currentUser.uid !== userId) {
            document.getElementById("edit-profile").style.display = "none";
            document.getElementById("log-out").style.display = "none";
            document.getElementById("nav-tab").style.display = "none";
        } else {
            document.getElementById("edit-profile").style.display = "block";
            document.getElementById("log-out").style.display = "block";
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        alert("Failed to load user profile.");
    }
}

// Display User's Posts
async function displayUserPosts(userId) {
    try {
        const postsContainer = document.getElementById("posts-go-here");
        postsContainer.innerHTML = ""; // Clear existing posts

        const querySnapshot = await db.collection("posts")
            .where("user.uid", "==", userId)
            .orderBy("time", "desc")
            .get();

        const cardTemplate = document.getElementById("post-template");

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const newPost = cardTemplate.content.cloneNode(true);

            // Populate post details
            newPost.querySelector(".post-title").innerText = data.title || "Untitled";
            newPost.querySelector(".post-location").innerText = `${data.street || ""}, ${data.city || ""}`;
            newPost.querySelector(".post-picture").src = data.image_URL || "https://dummyimage.com/600x400/7eb9e0/fff";
            newPost.querySelector(".post-user").innerText = data.user.username || "Unknown User";
            newPost.querySelector(".post-time").innerText = data.time ? timeAgo(data.time.toDate()) : "Unknown time";

            // Redirect to user profile on username or profile picture click
            const postUserId = data.user?.uid;
            newPost.querySelector(".post-user").onclick = () => redirectToProfile(postUserId);
            newPost.querySelector(".profileIcon").onclick = () => redirectToProfile(postUserId);

            postsContainer.appendChild(newPost);
        });

    } catch (error) {
        console.error("Error fetching user posts:", error);
        alert("Failed to load posts.");
    }
}

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



// Initialize Profile Page
async function initializeProfilePage() {
    const userId = getQueryParam("userId"); // Get the userId from query string
    if (!userId) {
       
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            window.location.href = `profile.html?userId=${currentUser.uid}`;
        } else {
            window.location.href = "Landing.html";
        }
        return;
    }

    // Display user's profile and posts
    await displayUserProfile(userId);
    await displayUserPosts(userId);
}

// Redirect to Profile Page
function redirectToProfile(userId) {
    if (userId) {
        window.location.href = `profile.html?userId=${userId}`;
    } else {
        alert("Unable to view user profile.");
    }
}

// Edit Profile Logic (for current user's profile)
async function editProfile() {
    const profileHeader = document.getElementById("profileHeader");
    const editButton = document.getElementById("edit-profile");
    const postsElement = document.getElementById("posts-go-here");
    const navTabElement = document.getElementById("nav-tab");

    // Hide the Edit Profile button, posts, and nav tab
    editButton.style.display = "none";
    postsElement.style.display = "none";
    navTabElement.style.display = "none";

    const user = firebase.auth().currentUser;
    const userDoc = await db.collection("users").doc(user.uid).get();
    const { username, userHandle, bio, profile_picture } = userDoc.data();

    profileHeader.innerHTML = `
        <div id="edit-profile-forms">
            <form>
                <div>
                    <label for="edit-pfp">Profile Picture:</label>
                    <br>
                    <img id="current-pfp" src="${profile_picture}" alt="Current Profile Picture">
                    <input type="file" id="edit-pfp" name="edit-pfp" accept="image/*" style="display: none;">
                    <img id="pfp-preview" style="display: none;" alt="Preview">
                </div>
                <div>
                    <label for="edit-username">Username:</label>
                    <input type="text" id="edit-username" value="${username}">
                </div>
                <div>
                    <label for="edit-bio">Bio:</label>
                    <textarea id="edit-bio">${bio}</textarea>
                </div>
                <button id="save-profile" type="button">Save</button>
                <button id="cancel-edit" type="button">Cancel</button>
            </form>
        </div>
    `;
}


// Initialize Page on Load
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        initializeProfilePage();
    } else {
        window.location.href = "Landing.html";
    }
});
