
document.getElementById("save_button").addEventListener("click", async () => {
    // get input values 
    const titleInput = document.getElementById("input-title");
    const locationInput = document.getElementById("input-location");
    const img = document.getElementById("img-upload");
    const fileLabel = document.getElementById("img-label");

    const title = titleInput.value.trim();
    const location = locationInput.value.trim();
    const file = img.files[0];

    // input validation
    if (!title || !location || !file) {
        alert("Please fill in all required fields.");

       
        titleInput.style.border = title ? "" : "2px solid red";
        locationInput.style.border = location ? "" : "2px solid red";
        fileLabel.style.border = file ? "" : "2px solid red";

        return; 
    }
    // user needs to be logged in
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
       
        // splits location into city and street
        const [street, city] = location.split(",").map(part => part.trim());

        // Uploads image to firebase storage
        const storageRef = storage.ref(`images/${file.name}`);
        await storageRef.put(file);
        const imageUrl = await storageRef.getDownloadURL();
        
        // users must input location according to format "street, city"
        const locationPattern = /^[^,]+,\s*[^,]+$/;

        
        if (!locationPattern.test(location)) {
            alert("Please enter the location in 'street, city' format.");
            locationInput.style.border = "2px solid red";
            return; // Exit the function if location format is incorrect
        } else {
            locationInput.style.border = ""; // Reset border if format is correct
        }


        
        const postRef = db.collection("posts").doc(); // Generate a unique ID for the post

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
