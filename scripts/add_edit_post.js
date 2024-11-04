document.getElementById("save_button").addEventListener("click", async () => {
    // Get input values from user
    const title = document.getElementById("input-title");
    const location = document.getElementById("input-location");
    const description = document.getElementById("input-description");
    const img = document.getElementById("img-upload");
    const file = img.files[0];

    if (!title || !location || !file) {
        alert ("Please fill in all required fields.")
        // Add red border to highlight empty required fields
    if (!title) {
        titleInput.style.border = "2px solid red";
    } else {
        titleInput.style.border = ""; // Reset border if field is filled
    }

    if (!location) {
        locationInput.style.border = "2px solid red";
    } else {
        locationInput.style.border = ""; // Reset border if field is filled
    }

    if (!file) {
        fileInput.style.border = "2px solid red";
    } else {
        fileInput.style.border = ""; // Reset border if file is selected
    }

    return;
    }

    try {
        const storageRef = storage.ref('images/${file-name}');
        await storageRef.put(file);
        const imageURL = await storageRef.getDownloadURL();

    }
    catch {


    }
});