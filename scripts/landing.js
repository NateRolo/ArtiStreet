
async function displayCardsDynamically(collection) {
    let cardTemplate = document.getElementById("post-landing-template");

    const allPosts = await db.collection(collection).get();

    allPosts.forEach(async doc => {
        const title = doc.data().title;
        const location = doc.data().street.concat(", " + doc.data().city);
        const time = doc.data().time;
        const imgURL = doc.data().image_URL;

        // Clone the template
        let newpost = cardTemplate.content.cloneNode(true);
        console.log("Cloned template content:", newpost); // Log the cloned content
        
        // Attempt to get .post-picture element
        const postPictureElement = newpost.querySelector('.post-picture');
        console.log("postPictureElement found:", postPictureElement); // Log check for the element

        // Assign imageURL to .post-picture element
        if (postPictureElement && imgURL) {
            postPictureElement.src = imgURL;
        } else {
            console.warn("Warning: .post-picture element is missing or image URL failed to load.");
        }

        // Update other fields
        newpost.querySelector('.post-location').innerHTML = location;
        newpost.querySelector('.post-title').innerHTML = title;
        newpost.querySelector('.post-time').innerHTML = time;

        // Append to the collection container
        document.getElementById(collection + "-go-here").appendChild(newpost);
        console.log("New post appended"); // Log successful append
    });
}

// Call the function
displayCardsDynamically("posts");

