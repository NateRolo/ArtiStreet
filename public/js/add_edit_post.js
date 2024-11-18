// Initialize DOM Elements
const titleInput = document.getElementById("input-title");
const locationInput = document.getElementById("input-location");
const descOfPost = document.getElementById("exampleFormControlTextarea1");
const imgUpload = document.getElementById("img-upload");
const imgPreview = document.getElementById("img-upload-preview");
const imgLabel = document.getElementById("img-label");
const saveButton = document.getElementById("save_button");

// preview image function
const previewImage = () => {
    const file = imgUpload.files[0];
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


// input validation 
const validateInputs = (title, location, file, description) => {
    let isValid = true;

    if (!title) {
        titleInput.style.border = "2px solid red";
        isValid = false;
    } else {
        titleInput.style.border = "";
    }

    if (!location) {
        locationInput.style.border = "2px solid red";
        isValid = false;
    } else {
        locationInput.style.border = "";
    }

    if (!file) {
        imgLabel.style.border = "2px solid red";
        isValid = false;
    } else {
        imgLabel.style.border = "";
    }

    if (!description) {
        descOfPost.style.border = "2px solid red";
        isValid = false;
    } else {
        descOfPost.style.border = "";
    }

    return isValid;
};

// upload to firebase storage
const uploadImage = async (file) => {
    const storageRef = storage.ref(`images/${file.name}`);
    await storageRef.put(file);
    return await storageRef.getDownloadURL();
};

const savePostToFirestore = async (data) => {
    const postRef = db.collection("posts").doc(); // Generate unique ID
    await postRef.set(data);
};

const redirectToLanding = () => {
    window.location.href = "/html/Landing.html";
};

// Event Listeners
imgLabel.addEventListener("click", () => imgUpload.click());
imgUpload.addEventListener("change", previewImage);
imgPreview.addEventListener("click", () => {
    imgUpload.click();
});

saveButton.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const location = locationInput.value.trim();
    const file = imgUpload.files[0];
    const description = descOfPost.value.trim();

    if (!validateInputs(title, location, file, description)) {
        alert("Please fill in all required fields.");
        return;
    }

    const locationPattern = /^[^,]+,\s*[^,]+$/;
    if (!locationPattern.test(location)) {
        alert("Please enter the location in 'street, city' format.");
        locationInput.style.border = "2px solid red";
        return;
    }

    const [street, city] = location.split(",").map((part) => part.trim());

    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            alert("You need to be logged in to post.");
            return;
        }

        const userDoc = await db.collection("users").doc(user.uid).get();
        if (!userDoc.exists) {
            alert("User profile not found.");
            return;
        }

        const userData = userDoc.data();
        const imageUrl = await uploadImage(file);

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

        await savePostToFirestore(postData);
        alert("Post saved successfully!");
        redirectToLanding();
    } catch (error) {
        console.error("Error saving post:", error);
        alert("Failed to save the post. Please try again.");
    }
});
