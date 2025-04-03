document.addEventListener("DOMContentLoaded", function () {
    var loginModal = document.getElementById('globalModal');
    var signupModal = document.getElementById('adminSignupModal');

    function applyModalEffects(modal) {
        if (!modal) return;

        modal.addEventListener('shown.bs.modal', function () {
            document.body.classList.add('modal-open');
            document.getElementById("globalModal").style.marginBottom = "0px";
            

             //container.classList.add("blur-effect");
             //navbar.classList.add("blur-effect");
             // hideElement.style.opacity = "0"; // Keep this if necessary

            document.querySelector(".container").classList.add("blur-effect");
            document.querySelector(".navbar").classList.add("blur-effect");
            //document.querySelector("#hide").style.display = "none";
            document.querySelector("#hide").classList.add("blur-effect");
          
        });

        modal.addEventListener('hidden.bs.modal', function () {
            document.body.classList.remove('modal-open');
            document.querySelector(".container").classList.remove("blur-effect");
            document.querySelector(".navbar").classList.remove("blur-effect");
            //document.querySelector("#hide").style.display = "none";
            document.querySelector("#hide").classList.remove("blur-effect");
        });
    }

    applyModalEffects(loginModal);
    applyModalEffects(signupModal);

    // Prevent conflict when opening one modal while another is open
    document.querySelectorAll("[data-bs-toggle='modal']").forEach(button => {
        button.addEventListener("click", function () {
            const alreadyOpen = document.querySelector(".modal.show");
            if (alreadyOpen) {
                const modalInstance = bootstrap.Modal.getInstance(alreadyOpen);
                if (modalInstance) {
                    modalInstance.hide();  // Only call hide() if instance exists
                }
            }
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize login modal
    var loginModalElement = document.getElementById('globalModal');
    var loginModal = new bootstrap.Modal(loginModalElement, { keyboard: false });

    document.querySelectorAll('[data-bs-target="#globalModal"]').forEach(function (button) {
        button.addEventListener('click', function () {
            loginModal.show();
        });
    });

    loginModalElement.addEventListener('shown.bs.modal', function () {
        document.body.classList.add('modal-open');
    });

    loginModalElement.addEventListener('hidden.bs.modal', function () {
        document.body.classList.remove('modal-open');
    });

    document.querySelector('.btn-close').addEventListener('click', function () {
        loginModal.hide();
    });

    document.getElementById('login').addEventListener('click', function (e) {
        e.preventDefault();

        var emailInput = document.getElementById('email');
        var passwordInput = document.getElementById('password');
        var email = emailInput.value.trim();
        var password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            emailInput.classList.add('is-invalid');
            passwordInput.classList.add('is-invalid');
            return;
        }

        emailInput.classList.remove('is-invalid');
        passwordInput.classList.remove('is-invalid');

        var formData = new FormData();
        formData.append('Email', email);
        formData.append('Password', password);

        fetch('/Admin/AdminLogin', {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    loginModal.hide();
                    window.location.href = '/Admin/Index';
                } else {
                    emailInput.value = '';
                    passwordInput.value = '';
                }
            })
            .catch(() => {
                alert("Request failed. Please check your connection.");
            });
    });

    // Signup modal functionality
    const signupModal = document.getElementById("adminSignupModal");
    const clearButton = document.getElementById("btn_ClearSignup");
    const signupButton = document.getElementById("btnsignup");
    const imageUpload = document.getElementById("imageUpload");
    const imagePreview = document.getElementById("SignupImagePreview");

    if (clearButton) {
        clearButton.addEventListener("click", function () {
            document.getElementById("FirstName").value = "";
            document.getElementById("LastName").value = "";
            document.getElementById("Email").value = "";
            document.getElementById("Password").value = "";
            document.getElementById("DateOfBirth").value = "";
            document.getElementById("RoleType").value = "";
            document.getElementById("imageUpload").value = "";

            // Reset image preview while keeping the border
            imagePreview.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        });
    }

    if (signupButton) {
        signupButton.addEventListener("click", function (e) {
            e.preventDefault();

            var firstName = document.getElementById("FirstName").value.trim();
            var lastName = document.getElementById("LastName").value.trim();
            var email = document.getElementById("Email").value.trim();
            var password = document.getElementById("Password").value.trim();
            var dob = document.getElementById("DateOfBirth").value;
            var roleType = document.getElementById("RoleType").value;

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

            var uploadedImage = imageUpload.files[0];
            if (uploadedImage) {
                formData.append("ProfileImage", uploadedImage);
            }

            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/Admin/AdminSignup", true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

            xhr.onload = function () {
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        alert(response.message);
                        if (response.success) {
                            window.location.href = "/Admin/AdminLogin";
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
    }

    if (imageUpload) {
        imageUpload.addEventListener("change", function (e) {
            previewImage(e.target);
        });
    }

    if (signupModal) {
        signupModal.addEventListener("hidden.bs.modal", function () {
            document.getElementById("FirstName").value = "";
            document.getElementById("LastName").value = "";
            document.getElementById("Email").value = "";
            document.getElementById("Password").value = "";
            document.getElementById("DateOfBirth").value = "";
            document.getElementById("RoleType").value = "";
            document.getElementById("imageUpload").value = "";

            imagePreview.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        });
    }
});

function previewImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var imagePreview = document.getElementById("SignupImagePreview");
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
        };
        reader.readAsDataURL(input.files[0]);
    }
}


