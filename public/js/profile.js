

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