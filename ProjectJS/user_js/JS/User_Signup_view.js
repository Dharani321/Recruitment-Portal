$(document).ready(function () {
    $("#submit").on("click", function (e) {
        e.preventDefault();

        var isValid = true;
        $(".error").remove(); // Clear any previous error messages

        // Validate First Name
        if ($("#firstName").val() === "") {
            $("#firstName").after("<span class='error'>First Name is required</span>");
            isValid = false;
        }

        // Validate Last Name
        if ($("#lastName").val() === "") {
            $("#lastName").after("<span class='error'>Last Name is required</span>");
            isValid = false;
        }

        // Validate Email
        var email = $("#email").val();
        var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (email === "") {
            $("#email").after("<span class='error'>Email is required</span>");
            isValid = false;
        } else if (!emailPattern.test(email)) {
            $("#email").after("<span class='error'>Invalid email format</span>");
            isValid = false;
        }

        // Validate Password
        var password = $("#password").val();
        if (password === "") {
            $("#password").after("<span class='error'>Password is required</span>");
            isValid = false;
        } else if (password.length < 6) {
            $("#password").after("<span class='error'>Password must be at least 6 characters</span>");
            isValid = false;
        }

        // Validate Confirm Password
        var confirmPassword = $("#confirmPassword").val();
        if (confirmPassword === "") {
            $("#confirmPassword").after("<span class='error'>Please confirm your password</span>");
            isValid = false;
        } else if (confirmPassword !== password) {
            $("#confirmPassword").after("<span class='error'>Passwords do not match</span>");
            isValid = false;
        }

        // If form is valid, submit the form
        if (isValid) {
            var formData = new FormData($("#registrationForm")[0]);
            console.log("Form Data:", [...formData.entries()]);

            $.ajax({
                url: '/user/Save_user',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (response) {
                    if (response.success) {
                        setTimeout(function () {
                            window.location.href = response.redirectUrl;
                        }, 500);
                    } else {
                        alert(response.message || "Something went wrong!");
                    }
                },
                error: function (xhr, status, error) {
                    console.error("AJAX Error: ", error);
                    alert("An error occurred. Please try again.");
                }
            });
        }
    });
});


//This is for ensuring that the modal is triggered after successful registration

$(window).on('load', function () {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('showModal') && urlParams.get('showModal') === 'true') {
        var loginModalEl = document.getElementById("globalModal");

        if (loginModalEl) {
            var loginModal = bootstrap.Modal.getInstance(loginModalEl) || new bootstrap.Modal(loginModalEl);
            loginModal.show();
        } else {
            console.error("Error: #globalModal does not exist in the DOM.");
        }
    }
});
