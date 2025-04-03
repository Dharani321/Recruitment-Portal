document.addEventListener("DOMContentLoaded", function () {
    var user = JSON.parse(sessionStorage.getItem("user")) || JSON.parse(localStorage.getItem("userdetails")) || {};

    // Displaying the user's name
    document.getElementById("profile-firstname-placeholder").textContent = user.FirstName || "User";
    document.getElementById("profile-lastname-placeholder").textContent = user.LastName || "";

    // Display user details if available
    document.getElementById("profile-user-location").textContent = `Location: ${user.Location || "Not Available"}`;
    document.getElementById("profile-user-email").textContent = `Email: ${user.Email || "Not Available"}`;
    document.getElementById("profile-user-phone").textContent = `Phone: ${user.PhoneNumber || "Not Available"}`;

    // Resume file upload handling
    document.getElementById("profile-resume-upload").addEventListener("change", function () {
        const file = this.files[0];
        document.getElementsByClassName("profile-file-input").value = file ? file.name : "No file selected";
    });

    document.querySelector(".profile-upload-btn").addEventListener("click", function () {
        const file = document.getElementById("profile-resume-upload").files[0];
        if (file) {
            let formData = new FormData();
            formData.append("resume", file);

            fetch("/user/UploadResume", {
                method: "POST",
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    alert("Resume uploaded successfully");
                    user.resume = file.name;
                    localStorage.setItem("userdetails", JSON.stringify(user));
                })
                .catch(() => {
                    alert("Failed to upload resume");
                });
        } else {
            alert("Please select a file to upload");
        }
    });





    // Qualifications section 


    // Update file name on file selection
    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("certUpload").addEventListener("change", function () {
            const file = this.files[0];
            // Update the input field with ID "fileName"
            document.getElementById("fileName").value = file ? file.name : "No file selected";
        });
    });

    // Handling qualification save
    document.getElementById("saveQualificationBtn").addEventListener("click", function () {
        const qualification = document.getElementById("qualificationInput").value; // Reference the qualification input by ID
        const fileInput = document.getElementById("certUpload");
        const file = fileInput.files[0];

        if (qualification && file) {
            let formData = new FormData();
            formData.append("qualification", qualification);
            formData.append("certFile", file);

            fetch("/user/SaveQualification", {
                method: "POST",
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Qualification saved successfully");
                        let user = JSON.parse(localStorage.getItem("userdetails")) || {};
                        user.qualification = qualification;
                        user.certFile = file.name;
                        localStorage.setItem("userdetails", JSON.stringify(user));
                    } else {
                        alert("Error: " + data.message);
                    }
                })
                .catch(() => {
                    alert("Failed to save qualification");
                });
        } else {
            alert("Please fill in all fields");
        }
    });


    // Save job preferences
    document.querySelector("#preferencesCollapse button").addEventListener("click", function () {
        const preferredIndustry = document.querySelector('input[placeholder="E.g., IT, Finance, Healthcare"]').value;
        const preferredJobRole = document.querySelector('input[placeholder="E.g., Software Engineer, Data Scientist"]').value;

        if (preferredIndustry && preferredJobRole) {
            fetch("/user/SaveJobPreferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    industry: preferredIndustry,
                    role: preferredJobRole
                })
            })
                .then(response => response.json())
                .then(data => {
                    alert("Job preferences saved successfully");
                    user.preferredIndustry = preferredIndustry;
                    user.preferredJobRole = preferredJobRole;
                    localStorage.setItem("userdetails", JSON.stringify(user));
                })
                .catch(() => {
                    alert("Failed to save preferences");
                });
        } else {
            alert("Please fill in all fields");
        }
    });

    // Handle removing bookmarks
    document.querySelectorAll(".btn-danger").forEach(button => {
        button.addEventListener("click", function () {
            const selectedJob = document.querySelector("select").value;

            if (selectedJob) {
                fetch("/user/RemoveBookmark", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ job: selectedJob })
                })
                    .then(response => response.json())
                    .then(data => {
                        alert("Bookmark removed successfully");
                        user.bookmarks = (user.bookmarks || []).filter(job => job !== selectedJob);
                        localStorage.setItem("userdetails", JSON.stringify(user));
                    })
                    .catch(() => {
                        alert("Failed to remove bookmark");
                    });
            } else {
                alert("Please select a job to remove");
            }
        });
    });

    // Prevent "Please fill in all fields" when opening dropdowns
    document.querySelectorAll("select").forEach(select => {
        select.addEventListener("focus", function () {
            // Clear any previous alerts
            document.querySelectorAll("alert").forEach(alert => alert.remove());
        });
    });


// ---------------------------------------------------------(not ready yet)-------------------------------------------------

    // Save job search keywords



    // $('#keywordsCollapse button').click(function () {
    //     const keywords = $('input[placeholder="E.g., Machine Learning, Web Development"]').val();

    //     if (keywords) {
    //         $.ajax({
    //             url: '/saveKeywords',
    //             method: 'POST',
    //             data: {
    //                 keywords: keywords
    //             },
    //             success: function () {
    //                 alert('Keywords saved successfully');
    //                 // Save keywords in user details (sessionStorage or localStorage)
    //                 user.keywords = keywords;
    //                 localStorage.setItem('userdetails', JSON.stringify(user));
    //             },
    //             error: function () {
    //                 alert('Failed to save keywords');
    //             }
    //         });
    //     } else {
    //         alert('Please enter keywords');
    //     }
    // });

   
});
