document.addEventListener("DOMContentLoaded", function () {
    if (typeof jQuery === "undefined") {
        console.error("jQuery is not loaded.");
        return;
    }

    if ($(".navbar_search").length > 0 && $(".title-location-selection").length > 0) {
        const searchBox = $(".navbar_search").get(0);
        const searchButton = $(".title-location-selection").get(0);

        if (!searchBox || !searchButton) {
            console.error("Error: .navbar_search or .title-location-selection not found.");
            return;
        }

        searchButton.addEventListener("click", function () {
            let existingInput = searchBox.querySelector(".search-input");
            if (existingInput) {
                existingInput.focus();
                return;
            }

            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Enter job title or location...";
            input.classList.add("search-input", "form-control", "mt-2");

            searchBox.appendChild(input);
            input.focus();

            input.addEventListener("keypress", function (event) {
                if (event.key === "Enter") {
                    alert("Searching for: " + input.value);
                }
            });

            document.addEventListener("click", function handleClickOutside(event) {
                if (!searchBox.contains(event.target) && event.target !== searchButton) {
                    input.remove();
                    document.removeEventListener("click", handleClickOutside);
                }
            });
        });

        // TomSelect Initialization
        if (typeof TomSelect !== "undefined") {
            const selectElement = document.querySelector("#location-search");
            if (selectElement && !selectElement.classList.contains("ts-wrapper")) {
                try {
                    new TomSelect(selectElement, {
                        plugins: ["remove_button"],
                        persist: false,
                        create: true,
                    });
                } catch (error) {
                    console.error("TomSelect initialization failed:", error);
                }
            }
        } else {
            console.warn("TomSelect library is missing. Please include it in your project.");
        }
    }
});

   


//For User Login

$(document).ready(function () {

    // Login Click Event
    $("#login").click(function (e) {
        e.preventDefault();

        let email = $("#email").val();
        let password = $("#password").val();

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
            // AJAX Request to validate user
            $.ajax({
                url: "/user/Find_User",
                method: "POST",
                data: { email: email, password: password },
                success: function (response) {
                    console.log(response);
                    alert(response.message);

                    if (response.success) {
                        console.log("Login Successful!");

                        
                        sessionStorage.setItem("user", JSON.stringify(response.data));
                        let user1 = JSON.parse(sessionStorage.getItem("user"));
                        console.log(user1);

                        
                        localStorage.setItem("userdetails", JSON.stringify(response.data));

                        
                        console.log("Retrieve data from local storage");
                        let user2 = JSON.parse(localStorage.getItem("userdetails"));
                        console.log(user2);

                        
                        window.location.href = "/user/user_dashboard";
                    } else {
                        alert(response.message); 
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error: ", error);
                    alert("An error occurred. Please try again.");
                }
            });
        }
    });

    // Signup Click Event
    $("#signup").click(function (e) {
        e.preventDefault();
        alert("Signup Button Clicked");
        window.location.href = "/user/Signup";
    });

});


//For Login Modal

document.addEventListener("DOMContentLoaded", function () {
    var loginModal = document.getElementById('globalModal'); // Match the ID here

    if (loginModal) {
        // Add blur effect when modal opens
        loginModal.addEventListener('shown.bs.modal', function () {
            document.body.classList.add('modal-open');
        });

        // Remove blur effect when modal closes
        loginModal.addEventListener('hidden.bs.modal', function () {
            document.body.classList.remove('modal-open');
        });
    }
});



// -----------------------------------User Logged in section-------------------------------------------
$(document).ready(function () {
    // Open modal on profile icon click
    $(".profile-icon").click(function () {
        var profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
        profileModal.show();
    });

    // Logout function with Swal alert
    $("#signOut").click(function () {
        Swal.fire({
            title: "Want to log out?",
            text: "Choose an option below:",
            icon: "warning",
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "Login with Another Account",
            cancelButtonText: "Logout",
            denyButtonText: "Stay on Page",
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "/user/Login";
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                sessionStorage.removeItem("user");
                localStorage.removeItem("userdetails");
                window.location.href = "/Home/index";
            } else if (result.isDenied) {
                Swal.fire("You chose to stay!", "You are still logged in.", "info");
            }
        });
    });

    //this is kept in login.js

    ////populating the profile pic icon

    //$(document).ready(function () {
    //    // Fetch user profile image from localStorage (or sessionStorage, if preferred)
    //    var userPhoto = JSON.parse(localStorage.getItem("userdetails"))?.profilePicture || "default-profile.jpg";

    //    // Set the image source dynamically
    //    $("#userProfileImage").attr("src", userPhoto);
    //});


});


