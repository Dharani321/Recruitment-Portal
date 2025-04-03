$(document).ready(function () {





    //prefilled


    // Retrieve user details from sessionStorage
    let user1 = JSON.parse(sessionStorage.getItem("user"));

    if (user1 && user1.UserId) {
        fetchUserDetails(user1.UserId); // Fetch details and pre-fill form
    } else {
        console.error("User details not found in sessionStorage!");
        alert("User details missing! Please log in again.");
        return;
    }

    // Function to fetch user details and pre-fill the form
    function fetchUserDetails(userId) {
        $.ajax({
            url: "/User/GetUserDetails", // API endpoint to fetch user details
            type: "GET",
            data: { userId: userId },
            success: function (response) {
                if (response.success) {
                    let user = response.data;
                    console.log("Fetched User Data:", user);

                    // Pre-fill form fields
                    $("#FirstName").val(user.FirstName);
                    $("#LastName").val(user.LastName);
                    $("#PhoneNumber").val(user.PhoneNumber);
                    $("#Email").val(user.Email);

                    // Display profile picture preview if available
                    if (user.ProfilePicture) {
                        $("#profilePicturePreview").attr("src", user.ProfilePicture).show();
                    }
                } else {
                    console.error("Error fetching user details:", response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", xhr.responseText);
            }
        });
    }


    // Handle form submission using AJAX
    $("form").on("submit", function (event) {
        event.preventDefault(); // Prevent default form submission
        let formData = new FormData(this); // Capture form data
        // Create FormData object to handle file uploads
        // Retrieve user details from localStorage
        let user2 = JSON.parse(localStorage.getItem("userdetails"));
        if (user2 && user2.UserId) {
            console.log("User Data from localStorage:", user2.UserId);

            // Append UserId to formData
            formData.append("UserId", user2.UserId);
        } else {
            console.error("User details not found in localStorage!");
            alert("User details missing! Please log in again.");
            return;
        }

        // Log FormData for debugging
        console.log("Form Data Submitted:");
        for (let pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
        }

        $.ajax({
            url: "/User/UpdateAccount", // Controller endpoint
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: function () {
                // Show a loading message (optional)
                $("button[type=submit]").prop("disabled", true).text("Updating...");
            },
            success: function (response) {
                if (response.success) {
                    sessionStorage.setItem("user", JSON.stringify(response.data));
                    let user1 = JSON.parse(sessionStorage.getItem("user"));
                    console.log("Session Storage Updated:", user1);

                    // Update localStorage
                    localStorage.setItem("userdetails", JSON.stringify(response.data));
                    let user2 = JSON.parse(localStorage.getItem("userdetails"));
                    console.log("Local Storage Updated:", user2);
                    showSuccessMessage(response.message); // Display success message
                } else {
                    showErrorMessage(response.message || "Something went wrong.");
                }
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", xhr.responseText);
                showErrorMessage("An error occurred while updating your account.");
            },
            complete: function () {
                $("button[type=submit]").prop("disabled", false).text("Update Account");
            }
        });
    });

    // Function to show success message
    function showSuccessMessage(message) {
        $("body").append(`
            <div id="success-message" class="success-container">
                <div class="success-card">
                    <div class="check-icon">✔</div>
                    <h2>✅ Update Successful!</h2>
                    <p>${message}</p>
                    <button id="go-to-dashboard">Go to Dashboard</button>
                </div>
            </div>
        `);

        $("#go-to-dashboard").on("click", function () {
            window.location.href = "/user/user_dashboard"; // Redirect to dashboard
        });
    }

    // Function to show error message
    function showErrorMessage(message) {
        alert(message); // Simple alert, replace with a modal if needed
    }
});
