
document.getElementById("save_button").addEventListener("click", async () => {
    // Get input values 
    const titleInput = document.getElementById("input-title");
    const locationInput = document.getElementById("input-location");
    const img = document.getElementById("img-upload");
    const fileLabel = document.getElementById("img-label");
    const descOfPost = document.getElementById("exampleFormControlTextarea1"); // Description textarea

    const title = titleInput.value.trim();
    const location = locationInput.value.trim();
    const file = img.files[0];
    const description = descOfPost.value.trim(); // Get the description value

    // Input validation
    if (!title || !location || !file) {
        alert("Please fill in all required fields.");

        titleInput.style.border = title ? "" : "2px solid red";
        locationInput.style.border = location ? "" : "2px solid red";
        fileLabel.style.border = file ? "" : "2px solid red";

        return;
    }

    // User needs to be logged in
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
        const username = userData.username;
        const handle = userData.userHandle;

        // Split location into city and street
        const [street, city] = location.split(",").map(part => part.trim());

        // Upload image to Firebase storage
        const storageRef = storage.ref(`images/${file.name}`);
        await storageRef.put(file);
        const imageUrl = await storageRef.getDownloadURL();

        // Users must input location in "street, city" format
        const locationPattern = /^[^,]+,\s*[^,]+$/;

        if (!locationPattern.test(location)) {
            alert("Please enter the location in 'street, city' format.");
            locationInput.style.border = "2px solid red";
            return; // Exit the function if location format is incorrect
        } else {
            locationInput.style.border = ""; // Reset border if format is correct
        }

        // Create a new post document in Firestore
        const postRef = db.collection("posts").doc(); // Generate a unique ID for the post

        // Set post data, including description
        await postRef.set({
            title: title,
            city: city,
            street: street,
            image_URL: imageUrl,
            user: {
                uid: user.uid,
                username: username,
                handle: handle
            },
            description: description, // Store the description
            time: firebase.firestore.FieldValue.serverTimestamp() // Current server timestamp
        });

        // Redirect to the landing page after posting
        window.location.href = "/html/Landing.html";

    } catch (error) {
        console.error("Error saving post:", error);
        alert("Failed to save the post. Please try again.");
    }
});

