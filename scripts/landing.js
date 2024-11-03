//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------



async function displayCardsDynamically(collection) {
    let cardTemplate = document.getElementById("post-landing-template");

    const allPosts = await db.collection(collection).get();

    allPosts.forEach(async doc => { 
        const title = doc.data().title;
        const location = doc.data().street.concat(", " + doc.data().city);
        const time = doc.data().time;
        
        // Clone the template
        let newpost = cardTemplate.content.cloneNode(true);
        console.log("Cloned template content:", newpost); // Log the cloned content
        
        // Function to fetch image URL.
        async function getImageURL() {
            try {
                const storageRef = storage.refFromURL('gs://comp-1800-bby-31.appspot.com/images/ippoVsSendAction.webp');
                const url = await storageRef.getDownloadURL();
                return url;
            } catch (error) {
                console.error("Error fetching download URL:", error);
                return null;
            }
        }

        // Fetch the image URL
        const imageUrl = await getImageURL();

        // Attempt to get .post-picture element
        const postPictureElement = newpost.querySelector('.post-picture');
        console.log("postPictureElement found:", postPictureElement); // Log check for the element

        if (postPictureElement && imageUrl) {
            postPictureElement.src = imageUrl;
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

