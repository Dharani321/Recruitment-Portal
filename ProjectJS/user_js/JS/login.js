$(document).ready(function () {
    // Login functionality
    $("#login").click(function (e) {
        e.preventDefault();

        let email = $("#email").val();
        let password = $("#password").val();

        // Validate email and password
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email.");
            $("#email").val("");
            return;
        } else if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            $("#password").val("");
            return;
        }

        // AJAX request for user login
        $.ajax({
            url: "/user/Find_User",
            method: "POST",
            data: { email: email, password: password },
            success: function (response) {
                alert(response.message);

                if (response.success) {
                    // Storing the authentication token as a cookie
                    document.cookie = "auth_token=" + response.token + "; path=/";


                    // Storing user data in sessionStorage and localStorage
                    sessionStorage.setItem("user", JSON.stringify(response.data));
                    localStorage.setItem("userdetails", JSON.stringify(response.data));


                    //Saving the user id in local storage
                    localStorage.setItem("UserId", response.data.UserId);
                    sessionStorage.setItem("UserId", response.data.UserId);

                    // Storing FirstName separately in sessionStorage and localStorage
                    sessionStorage.setItem("FirstName", response.data.FirstName);
                    localStorage.setItem("FirstName", response.data.FirstName);

                    // Storing profile image URL 
                    if (response.data.ProfilePicture) {
                        localStorage.setItem("ProfilePicture", response.data.ProfilePicture);
                        sessionStorage.setItem("ProfilePicture", response.data.ProfilePicture);
                    }
                    

                    updateLastLogin(response.data.UserId);

                    // Redirect user to their dashboard
                    window.location.replace("/user/user_dashboard");
                }
            },
            error: function () {
                alert("An error occurred. Please try again.");
            }
        });

        // Function to update last login
        function updateLastLogin(userId) {
            $.ajax({
                url: "/user/UpdateLastLogin",
                method: "POST",
                data: { userId: userId, lastlogin: new Date().toISOString() },
                success: function () {
                    alert("Last Login Updated Successfully");
                }
            });
        }
    });

    // Signup redirection

    $("#signup").click(function (e) {
        e.preventDefault();
        window.location.href = "/user/Signup";
    });

    // Populating the profile image icon

    var userPhoto = JSON.parse(localStorage.getItem("userdetails"))?.ProfilePicture || "default-profile.jpg";
    $("#userProfileImage").attr("src", userPhoto);
});
