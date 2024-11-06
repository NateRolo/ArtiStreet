document.getElementById("save_button").addEventListener("click", async () => {
    // Get values from user input.
    const titleInput = document.getElementById("input-title");
    const locationInput = document.getElementById("input-location");
    const img = document.getElementById("img-upload");
    const fileLabel = document.getElementById("img-label");

    const title = titleInput.value.trim();
    const location = locationInput.value.trim();
    const file = img.files[0];

    // Check if required fields are filled
    if (!title || !location || !file) {
        alert("Please fill in all required fields.");

        // Apply red border if fields are missing
        titleInput.style.border = title ? "" : "2px solid red";
        locationInput.style.border = location ? "" : "2px solid red";
        fileLabel.style.border = file ? "" : "2px solid red";

        return; // Exit the function if validation fails
    }

    try {
        // // Get the current authenticated user
        // const user = firebase.auth().currentUser;
        // if (!user) {
        //     alert("You need to be logged in to post.");
        //     return;
        // }

        // // Retrieve the user data from Firestore
        // const userDoc = await db.collection("users").doc(user.uid).get();
        // if (!userDoc.exists) {
        //     alert("User profile not found.");
        //     return;
        // }

        // const userData = userDoc.data();
        // const username = userData.USERNAME;
        // const handle = userData.HANDLE;


        // Split location into street and city
         const [street, city] = location.split(",").map(part => part.trim());

        // Upload the image to Firebase Storage
        const storageRef = storage.ref(`images/${file.name}`);
        await storageRef.put(file);
        const imageUrl = await storageRef.getDownloadURL();

        // Create a new post in Firestore
        const postRef = db.collection("posts").doc(); // Generate a unique ID for the post

        await postRef.set({
            title: title,
            city: city,
            street: street,
            // "USER.USERNAME": username,
            // "USER.HANDLE": handle,
            image_URL: imageUrl,
            time: firebase.firestore.FieldValue.serverTimestamp() // Current server timestamp
        });

        // if (document.getElementById("input-description").includes("")) {
        //     const descriptionInput = document.getElementById("input-description");
        //     const description = descriptionInput.value.trim();
        //     postRef.set({ DESCRIPTION: description });
        
        // Redirect to the landing page after posting
        window.location.href = "./Landing.html";
    } catch (error) {
        console.error("Error saving post:", error);
        alert("Failed to save the post. Please try again.");
    }
});
