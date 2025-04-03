document.addEventListener('DOMContentLoaded', function () {
    fetchAndPrefillAdminDetails();
    fetchAdminDetails();

    document.getElementById('btnSaveChanges').addEventListener('click', function (e) {
        e.preventDefault();

        var formData = new FormData();
        formData.append("FirstName", document.getElementById('firstName').value);
        formData.append("LastName", document.getElementById('lastName').value);
        formData.append("Email", document.getElementById('email').value);

        var password = document.getElementById('password').value;
        if (password) {
            formData.append("Password", password);
        }

        var profilePicture = document.getElementById('profilePicture').files[0];
        if (profilePicture) {
            formData.append("ProfileImage", profilePicture); // Matches backend parameter
        }

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/Admin/UpdateAdminDetails', true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                if (response.success) {
                    alert(response.message);
                    window.location.reload();
                } else {
                    alert(response.message);
                }
            } else {
                alert("An error occurred: " + xhr.statusText);
            }
        };
        xhr.send(formData);
    });

    document.getElementById('profilePicture').addEventListener('change', function (e) {
        previewImage(e.target);
    });
});


function fetchAndPrefillAdminDetails() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/Admin/GetAdminDetails', true);
    xhr.onload = function () {
        console.log("onload triggered with status:", xhr.status);
        console.log("Response Text:", xhr.responseText);

        if (xhr.status === 200) {
            try {
                var response = JSON.parse(xhr.responseText);
                console.log("Parsed Response:", response);

                if (response.success && response.data) {
                    document.getElementById('firstName').value = response.data.FirstName || '';
                    document.getElementById('lastName').value = response.data.LastName || '';
                    document.getElementById('email').value = response.data.Email || '';

                    var imagePreview = document.getElementById('imagePreview');
                    if (imagePreview && response.data.ImagePath) {
                        imagePreview.src = response.data.ImagePath;
                        imagePreview.style.display = 'block';
                    } else {
                        imagePreview.style.display = 'none';
                    }
                } else {
                    alert('Error fetching admin details!');
                }
            } catch (error) {
                console.error("JSON Parsing Error:", error);
                alert("Error parsing response data.");
            }
        } else {
            alert("An error occurred: " + xhr.statusText);
        }
    };
    xhr.send();
}

function fetchAdminDetails() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/Admin/GetAdminDetails', true); // Ensure correct endpoint
    xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response) {
                document.getElementById('firstName').value = response.FirstName || '';
                document.getElementById('lastName').value = response.LastName || '';
                document.getElementById('email').value = response.Email || '';

                var imagePreview = document.getElementById('imagePreview');
                if (imagePreview && response.ImagePath) {
                    imagePreview.src = response.ImagePath;
                    imagePreview.style.display = 'block';
                } else {
                    imagePreview.style.display = 'none';
                }
            } else {
                alert('Error fetching admin details!');
            }
        } else {
            alert("An error occurred: " + xhr.statusText);
        }
    };
    xhr.send();
}

function previewImage(input) {
    let imagePreview = document.getElementById('imagePreview');
    if (imagePreview && input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}


function togglePassword() {
    var passwordField = document.getElementById("password");
    passwordField.type = passwordField.type === "password" ? "text" : "password";
}