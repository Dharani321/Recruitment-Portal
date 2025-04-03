$(document).ready(function () {
    // Login Click Event
    $("#login").click(function (e) {
        e.preventDefault();

        let email = $("#email").val();
        let password = $("#password").val();
        let loginType = $("#loginType").val(); // Get login type (User/Admin)

        console.log("Email :" + email + " , Password :" + password + " , logintype" + loginType);
        // Simple Validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email.");
            $("#email").val("");
            return;
        } else if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            $("#password").val("");
            return;
        } else {
            // AJAX Request to validate user/admin
            $.ajax({
                url: "/user/Common_Login",
                method: "POST",
                data: { email: email, password: password, loginType: loginType },
                success: function (response) {
                    console.log(response);
                    alert(response.message);

                    if (response.success) {
                        console.log("Login Successful!");

                        // Store user/admin details in sessionStorage & localStorage
                        sessionStorage.setItem("useroradminDetails", JSON.stringify(response.data));
                        localStorage.setItem("useroradminDetails", JSON.stringify(response.data));

                        let userData = JSON.parse(sessionStorage.getItem("useroradminDetails"));
                        console.log("Stored User Details:", userData);

                      

                        // Redirect based on login type
                        if (loginType ==="admin") {
                            alert("admin Login Successfull");
                            sessionStorage.setItem("adminDetails", JSON.stringify(response.data));
                            localStorage.setItem("adminDetails", JSON.stringify(response.data));
                            window.location.replace("/admin/index");
                        } else {
                            // Update last login in database
                            updateLastLogin(userData.UserId, userData.LoginType);
                            sessionStorage.setItem("userdetails", JSON.stringify(response.data));
                            localStorage.setItem("userdetails", JSON.stringify(response.data));
                            window.location.replace("/user/user_dashboard");
                        }
                    } else {
                        alert(response.message); // Show error message if login fails
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error: ", error);
                    alert("An error occurred. Please try again.");
                }
            });

            // Function to update last login time in the database
            function updateLastLogin(userId, loginType) {
                $.ajax({
                    url: "/user/UpdateLastLogin",
                    method: "POST",
                    data: { userId: userId, loginType: loginType, lastLogin: new Date().toISOString() },
                    success: function (response) {
                        console.log("Last login updated successfully:", response);
                    },
                    error: function (xhr, status, error) {
                        console.error("Failed to update last login:", error);
                    }
                });
            }
        }
    });

    $("#signup").click(function (e) {
        e.preventDefault();
        alert("Signup Button Clicked");
        window.location.href = "/user/Signup";
    });
});
