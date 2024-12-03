// get logged-in user data
function getUserData() {
    const user = auth.currentUser;
    if (user) {
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                document.getElementById('usernameInput').value = doc.data().username || '';
                document.getElementById('bioInput').value = doc.data().bio || '';
                if (doc.data().profilePicture) {
                    document.getElementById('profilePicture').src = doc.data().profilePicture;
                }
            } else {
                console.error("No user data found.");
                Swal.fire({
                    icon: 'error',
                    title: 'User Data Not Found',
                    text: 'Unable to fetch user data. Please try again.',
                });
            }
        }).catch((error) => {
            console.error("Error fetching user data: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to retrieve user data. Please try again later.',
            });
        });
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Sign-in Required',
            text: 'You need to be signed in to view this page.',
            confirmButtonText: 'Go to Login',
        }).then(() => {
            window.location.href = "/html/login.html"; // Redirect to sign-in page
        });
    }
}

// update username and bio to Firestore
document.getElementById('editProfileForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('usernameInput').value.trim();
    const bio = document.getElementById('bioInput').value.trim();
    const user = auth.currentUser;

    if (user) {
        db.collection('users').doc(user.uid).update({ username, bio })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your profile was updated successfully!',
                });
            })
            .catch((error) => {
                console.error('Error updating profile: ', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: 'Failed to update profile. Please try again.',
                });
            });
    }
});

// change profile picture and update to Firestore
document.getElementById('profilePictureInput').addEventListener('change', function (e) {
    const user = auth.currentUser;
    if (!user) {
        Swal.fire({
            icon: 'warning',
            title: 'Sign-in Required',
            text: 'Please sign in to upload a profile picture.',
        });
        return;
    }

    const file = e.target.files[0];
    if (file) {
        const storageRef = firebase.storage().ref(`profile_pictures/${user.uid}.jpg`);
        storageRef.put(file)
            .then((snapshot) => snapshot.ref.getDownloadURL())
            .then((url) => {
                document.getElementById('profilePicture').src = url;
                return db.collection('users').doc(user.uid).update({ profilePicture: url });
            })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Picture Updated',
                    text: 'Your profile picture was updated successfully!',
                });
            })
            .catch((error) => {
                console.error('Error uploading profile picture: ', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Upload Failed',
                    text: 'Failed to upload profile picture. Please try again.',
                });
            });
    } else {
        Swal.fire({
            icon: 'info',
            title: 'No File Selected',
            text: 'Please select a file to upload.',
        });
    }
});

window.onload = getUserData;
