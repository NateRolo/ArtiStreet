// Initialize DOM Elements
const titleInput = document.getElementById("input-title");
const locationInput = document.getElementById("input-location");
const descOfPost = document.getElementById("exampleFormControlTextarea1");
const imgUpload = document.getElementById("img-upload");
const imgPreview = document.getElementById("img-upload-preview");
const imgLabel = document.getElementById("img-label");
const saveButton = document.getElementById("save_button");
const backButton = document.getElementById('backButton');

// Utility Function: Get Query String Parameter
const getQueryParam = (param) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
};

// Utility Function: Populate Post Info
const populatePostForm = async (docId) => {
    try {
        const postDoc = await db.collection("posts").doc(docId).get();
        if (!postDoc.exists) {
            Swal.fire({
                icon: "error",
                title: "Post Not Found",
                text: "The post you are looking for doesn't exist."
            });
            return;
        }

        const postData = postDoc.data();

        // Populate form fields
        titleInput.value = postData.title || "";
        locationInput.value = `${postData.street || ""}, ${postData.city || ""}`;
        descOfPost.value = postData.description || "";

        // Populate image preview
        if (postData.image_URL) {
            imgPreview.src = postData.image_URL;
            imgPreview.style.display = "block";
            imgLabel.style.display = "none";
        } else {
            imgLabel.style.display = "block";
            imgPreview.style.display = "none";
        }
    } catch (error) {
        console.error("Error fetching post data:", error);
        Swal.fire({
            icon: "error",
            title: "Failed to Load Post",
            text: "There was an error while fetching the post details."
        });
    }
};

// Utility Function: Save or Update Post
const saveOrUpdatePost = async (docId = null) => {
    let title = titleInput.value; // Get the raw title input value

    // Trim spaces and update the input visually
    title = title.trim();
    titleInput.value = title; // Update the displayed input to reflect trimmed value

    const location = locationInput.value.trim();
    const file = imgUpload.files[0];
    const description = descOfPost.value.trim();

    // Validate input fields
    if (!title) {
        Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Title cannot be empty or contain only spaces."
        });
        titleInput.style.border = "2px solid red"; // Highlight invalid input
        return;
    }
    titleInput.style.border = ""; // Reset border if valid

    if (!location || (!file && !docId)) {
        Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Please fill in all required fields."
        });
        return;
    }

    const locationPattern = /^[^,]+,\s*[^,]+$/;
    if (!locationPattern.test(location)) {
        Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Please enter the location in 'street, city' format."
        });
        locationInput.style.border = "2px solid red";
        return;
    }

    const [street, city] = location.split(",").map((part) => part.trim());

    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            Swal.fire({
                icon: "error",
                title: "Authentication Error",
                text: "You need to be logged in to post."
            });
            return;
        }

        const userDoc = await db.collection("users").doc(user.uid).get();
        if (!userDoc.exists) {
            Swal.fire({
                icon: "error",
                title: "User Error",
                text: "User profile not found."
            });
            return;
        }

        const userData = userDoc.data();
        let imageUrl = imgPreview.src; // Use existing image by default

        if (file) {
            // Upload new image if provided
            const storageRef = storage.ref(`images/${file.name}`);
            await storageRef.put(file);
            imageUrl = await storageRef.getDownloadURL();
        }

        const postData = {
            title,
            city,
            street,
            image_URL: imageUrl,
            user: {
                uid: user.uid,
                username: userData.username,
                handle: userData.userHandle,
            },
            description,
            time: firebase.firestore.FieldValue.serverTimestamp(),
        };

        if (docId) {
            // Update existing post
            await db.collection("posts").doc(docId).update(postData);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Post updated successfully!",
                showConfirmButton: false,
                timer: 1500,
            });
        } else {
            // Create new post
            const postRef = db.collection("posts").doc();
            await postRef.set(postData);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Post saved successfully!",
                showConfirmButton: false,
                timer: 1500,
            });
        }

        setTimeout(() => {
            window.location.href = "/html/Landing.html";
        }, 1500);
    } catch (error) {
        console.error("Error saving/updating post:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to save the post. Please try again."
        });
    }
};


// Event Listeners
const handleFileSelection = (event) => {
    event.stopPropagation(); // Ensure the event does not bubble up
    const file = imgUpload.files[0];
    console.log("File selected: ", file);
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imgPreview.src = e.target.result;
            imgPreview.style.display = "block";
            imgLabel.style.display = "none";
        };
        reader.readAsDataURL(file);
    } else {
        imgLabel.style.display = "block";
        imgPreview.style.display = "none";
    }
};

// File upload behaviours
const triggerFileInput = (event) => {
    event.preventDefault(); 
    imgUpload.click();
};

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

// Add Event Listeners
imgLabel.addEventListener("click", triggerFileInput);
imgPreview.addEventListener("click", debounce(triggerFileInput, 200));
imgUpload.addEventListener("change", handleFileSelection);

// delete post button
const deleteButton = document.getElementById("delete_button");
deleteButton.addEventListener("click", async () => {
    const docId = getQueryParam("docId"); // Get the post ID from the query string
    await deletePost(docId);
});

// hide post button if adding new post, change button to "post" instead of "save"
function hideDeletePostButton() {
    if (getQueryParam("docId") == null) {
        document.getElementById("delete_button").style.display = "none";
        document.getElementById("save_button").innerHTML = "Post";
    }
} hideDeletePostButton();


// save changes button
saveButton.addEventListener("click", async () => {
    const docId = getQueryParam("docId"); // Check if editing a post
    await saveOrUpdatePost(docId);
});

const cancelEdit = () => {
    Swal.fire({
        title: 'Are you sure?',
        text: "Any unsaved changes will be lost.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, cancel',
        cancelButtonText: 'No, keep editing',
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "/html/profile.html"; // Redirect to profile.html
        }
    });
};


// Attach to Cancel Button
const cancelButton = document.getElementById("cancel_button"); // Ensure the button has this ID in your HTML
if (cancelButton) {
    cancelButton.addEventListener("click", cancelEdit);
}

// Populate form on page load
window.addEventListener("DOMContentLoaded", async () => {
    const docId = getQueryParam("docId");
    if (docId) {
        await populatePostForm(docId); // Populate form if editing
    }
});

// delete post function 
const deletePost = async (docId) => {
    if (!docId) {
        Swal.fire({
            icon: "error",
            title: "Post Not Found",
            text: "Post ID is missing. Unable to delete post."
        });
        return;
    }

    const confirmDelete = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel"
    });

    if (!confirmDelete.isConfirmed) return;

    try {
        const user = firebase.auth().currentUser; // Get the current authenticated user
        if (!user) {
            Swal.fire({
                icon: "error",
                title: "Not Logged In",
                text: "You must be logged in to delete a post."
            });
            return;
        }

        const postRef = db.collection("posts").doc(docId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            Swal.fire({
                icon: "error",
                title: "Post Not Found",
                text: "Post not found!"
            });
            return;
        }

        const postData = postDoc.data();

        // Check if the current user is the owner of the post
        if (postData.user.uid !== user.uid) {
            Swal.fire({
                icon: "error",
                title: "Unauthorized",
                text: "You are not authorized to delete this post."
            });
            return;
        }

        // Delete the associated image from Firebase Storage, if it exists
        if (postData.image_URL) {
            const storageRef = storage.refFromURL(postData.image_URL);
            await storageRef.delete();
        }

        // Delete the post document from Firestore
        await postRef.delete();

        Swal.fire({
            icon: "success",
            title: "Post Deleted",
            text: "Post deleted successfully!"
        });

        window.location.href = "/html/Landing.html"; // Redirect to landing page after deletion
    } catch (error) {
        console.error("Error deleting post:", error);
        Swal.fire({
            icon: "error",
            title: "Failed to Delete Post",
            text: "Please try again later."
        });
    }
};

backButton.addEventListener('click', () => {
    // Navigate to the previous page
    window.history.back();
});

// set nav button to active when clicked
const navPostButton = document.getElementById("nav-post");
navPostButton.onload = navPostButton.classList.toggle("active");
