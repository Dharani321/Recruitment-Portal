document.addEventListener('DOMContentLoaded', function () {
    // Clear Signup Fields
    document.getElementById('btn_ClearSignup').addEventListener('click', function () {
        document.getElementById('FirstName').value = '';
        document.getElementById('LastName').value = '';
        document.getElementById('Email').value = '';
        document.getElementById('Password').value = '';
        document.getElementById('DateOfBirth').value = '';
        document.getElementById('RoleType').value = '';
        document.getElementById('imageUpload').value = '';

        // Reset image preview while keeping the border
        document.getElementById('imagePreview').src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    });

    // Handle form submission
    document.getElementById('btnsignup').addEventListener('click', function (e) {
        e.preventDefault();

        var firstName = document.getElementById('FirstName').value.trim();
        var lastName = document.getElementById('LastName').value.trim();
        var email = document.getElementById('Email').value.trim();
        var password = document.getElementById('Password').value.trim();
        var dob = document.getElementById('DateOfBirth').value;
        var roleType = document.getElementById('RoleType').value;

        // Validate fields
        if (!firstName || !lastName || !email || !password || !dob || !roleType) {
            alert("All fields are required!");
            return;
        }

        var formData = new FormData();
        formData.append("FirstName", firstName);
        formData.append("LastName", lastName);
        formData.append("Email", email);
        formData.append("Password", password);
        formData.append("DateOfBirth", dob);
        formData.append("RoleType", roleType);

        var imageUpload = document.getElementById('imageUpload').files[0];
        if (imageUpload) {
            formData.append("ProfileImage", imageUpload);
        }

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/Admin/AdminSignup', true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); // Helps the server recognize AJAX requests

        xhr.onload = function () {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    alert(response.message);
                    if (response.success) {
                        window.location.href = '/Admin/AdminLogin';
                    }
                } catch (error) {
                    alert("Invalid server response.");
                }
            } else {
                alert("An error occurred: " + xhr.status + " " + xhr.statusText);
            }
        };
        
        xhr.onerror = function () {
            alert("Request failed. Please check your connection.");
        };

        xhr.send(formData);
    });

    // Handle image preview
    document.getElementById('imageUpload').addEventListener('change', function (e) {
        previewImage(e.target);
    });
});

// Image preview function
function previewImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var imagePreview = document.getElementById('imagePreview');
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}
