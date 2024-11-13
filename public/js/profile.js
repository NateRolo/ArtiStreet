

async function displayUserInfo() {
    firebase.auth().onAuthStateChanged(user => {

        console.log(user);
        if (!user) {
            console.log("You need to be signed in to see your posts.");
        }

        //go to the correct user document by referencing to the user uid
        currentUser = db.collection("users").doc(user.uid);
        //get the document for current user.
        currentUser.get()
            .then(userDoc => {
                //get the data fields of the user
                let userName = userDoc.data().username;
                let userHandle = userDoc.data().userHandle;
                let userBio = userDoc.data().userBio;

                //if the data fields are not empty, then write them in to the form.
                if (userName != null) {
                    document.getElementById("user-name").innerHTML = userName;
                }
                if (userHandle != null) {
                    document.getElementById("user-handle").innerHTML = "@" + userHandle;
                }
                if (userBio != null) {
                    document.getElementById("user-bio").innerHTML = userBio;
                }
            })
    })


}
displayUserInfo();

document.querySelector("#nav-profile-tab").addEventListener("click", async () => {
    db.collection("users").doc(user.uid).get()
        .then(userDoc => {
            var likes = userDoc.data.likes;
            console.log(likes);
            let newPostTemplate = document.getElementById("post-template");

            likes.forEach(thisPostID);
            db.collection("hikes").doc(thisPostId).get().then(doc => {
                const title = doc.data().title;
                const location = doc.data().street.concat(", " + doc.data().city);
                const time = doc.data().time;
                const imgURL = doc.data().image_URL;
                const userName = doc.data().user.username;
                const docID = doc.id;

                let newPost = newPostTemplate.content.cloneNode(true);
                const postPictureElement = newpost.querySelector('.post-picture');
                if (postPictureElement && imgURL) {
                    postPictureElement.src = imgURL;
                }

                newpost.querySelector('.post-user').innerHTML = userName;
                newpost.querySelector('.post-location').innerHTML = location;
                newpost.querySelector('.post-title').innerHTML = title;
                newpost.querySelector('.post-like').id = 'save-' + docID;
                newpost.querySelector('.post-like').onclick = () => saveLike(docID);
                
                if (time) {
                    const timeAgoText = timeAgo(time.toDate());
                    newpost.querySelector('.post-time').innerHTML = timeAgoText;
                } else {
                    newpost.querySelector('.post-time').innerHTML = "Unknown time";
                }

                document.getElementById(collection + "-go-here").appendChild(newpost);
            })

        })

});

// testing branch
