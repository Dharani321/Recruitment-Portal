//Section to render the top welcome message


$(document).ready(function () {

    var user = JSON.parse(sessionStorage.getItem("user")) || JSON.parse(localStorage.getItem("userdetails"));

    if (user && user.FirstName) {
        
        $("#username-placeholder").text(user.FirstName);
    } else {
        
        $("#username-placeholder").text("User");
    }
});



















window.searchJobs = function () {
    $('#search-job').show();
    $('#profile-section, #notification-section, #profile-matches, #feedback-section').hide();

    let allJobs = []; // Define globally within searchJobs

    $.ajax({
        url: '/user/GetAllJobs',
        type: 'GET',
        success: function (response) {
            if (!response.data) {
                console.error('No job data received.');
                return;
            }
             allJobs = response.data;
            renderJobs(allJobs);
            populateFilters(allJobs);
        },
        error: function (error) {
            console.error('Error fetching jobs:', error);
        }
    });

    // Bind filter change event
    $('#categoryFilter, #locationFilter, #jobTypeFilter').off('change').on('change', filterJobs);

    function filterJobs() {
        let selectedCategory = $('#categoryFilter').val();
        let selectedLocation = $('#locationFilter').val();
        let selectedJobType = $('#jobTypeFilter').val();

        let filteredJobs = allJobs.filter(job =>
            (selectedCategory === "" || job.JobCategory === selectedCategory) &&
            (selectedLocation === "" || job.Location === selectedLocation) &&
            (selectedJobType === "" || job.JobType === selectedJobType)
        );

        renderJobs(filteredJobs);
    }
};

function renderJobs(jobs) {
    let jobsHtml = jobs.map(job => `
        <div class="job-card" data-category="${job.JobCategory}" data-location="${job.Location}" data-jobtype="${job.JobType}">
            <h3>${job.JobTitle}</h3>
            <p><strong>Description:</strong> ${job.Description}</p>
            <p><strong>Category:</strong> ${job.JobCategory}</p>
            <p><strong>Location:</strong> ${job.Location}</p>
            <p><strong>Job Type:</strong> ${job.JobType}</p>
            <p><strong>Salary:</strong> ₹${job.Salary.toFixed(2)}</p> 
            <p><strong>Posted Date:</strong> ${new Date(job.PostedDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> ${new Date(job.EndDate).toLocaleDateString()}</p>
            <form class="apply-form">
                <input type="hidden" name="JobId" value="${job.JobId}">
                <button type="submit" class="apply-btn" value="${job.JobId}">Apply</button>
            </form>
        </div>
    `).join('');

    $('#jobs-container').html(jobsHtml);
}

// Handle Apply button click
$(document).on('submit', '.apply-form', function (e) {
    e.preventDefault();
    if (confirm("Do you want to Apply?")) {
        let jobId = $(this).find('input[name="JobId"]').val();
        sessionStorage.setItem('selectedJobId', jobId);
        fetchJobDetails(jobId);
    }
});

function populateFilters(jobs) {
    let categories = [...new Set(jobs.map(job => job.JobCategory))];
    let locations = [...new Set(jobs.map(job => job.Location))];
    let jobTypes = [...new Set(jobs.map(job => job.JobType))];

    $('#categoryFilter').empty().append('<option value="">All Categories</option>')
        .append(categories.map(cat => `<option value="${cat}">${cat}</option>`));

    $('#locationFilter').empty().append('<option value="">All Locations</option>')
        .append(locations.map(loc => `<option value="${loc}">${loc}</option>`));

    $('#jobTypeFilter').empty().append('<option value="">All Job Types</option>')
        .append(jobTypes.map(type => `<option value="${type}">${type}</option>`));

    checkForJobId();
}

// Check if Job ID exists (from sessionStorage or URL)
function checkForJobId() {
    let jobId = sessionStorage.getItem('selectedJobId') || new URLSearchParams(window.location.search).get('JobId');

    if (jobId) {
        fetchJobDetails(jobId);
    } else {
        console.warn("No Job ID found.");
    }
}

// Fetch job details
function fetchJobDetails(jobId) {
    if (!jobId) {
        alert("Job ID is missing.");
        return;
    }

    console.log("Fetching details for Job ID:", jobId);

    $.ajax({
        url: '/user/JobDetails',
        type: 'POST',
        data: { JobId: jobId },
        success: function (response) {
            if (!response.success) {
                alert("Error: " + response.error);
                return;
            }

            console.log("Received job details:", response.data);
            localStorage.setItem('jobDetails', JSON.stringify(response.data));
            displayJobDetails(response.data);
        },
        error: function (xhr) {
            console.error("AJAX Error:", xhr.responseText);
            alert("Failed to load job details.");
        }
    });
}

// Display job details
function displayJobDetails(job) {
    const jobDetailHtml = `
        <h2>${job.JobTitle}</h2>
        <p><strong>Job Id :</strong> ${job.JobId}</p>
        <p><strong>Company Name:</strong> ${job.CompanyName}</p>
        <p><strong>Category:</strong> ${job.JobCategory}</p>
        <p><strong>Location:</strong> ${job.Location}</p>
        <p><strong>Job Type:</strong> ${job.JobType}</p>
        <p><strong>Experience Required:</strong> ${job.Experience}</p>
        <p><strong>Salary:</strong> ₹${job.Salary.toFixed(2)}</p> 
        <p><strong>Description:</strong> ${job.Description}</p>
        <p><strong>Posted Date:</strong> ${new Date(job.PostedDate).toLocaleDateString()}</p> 
        <p><strong>End Date:</strong> ${new Date(job.EndDate).toLocaleDateString()}</p> 
        <p><strong>Apply Link:</strong> <a href="#"  class="apply-now-btn">Apply Here</a></p>
    `;

    $('#job-detail-card').html(jobDetailHtml);
    $('#search-job').show();



}


// Handle Apply Now Click (Triggered from "Apply Here" button)
$(document).on("click", ".apply-now-btn", function () {
    let jobId = $(this).data("jobid");
    let jobDetails = JSON.parse(localStorage.getItem("jobDetails") || "{}");
    let userDetails = JSON.parse(sessionStorage.getItem("userdetails") || localStorage.getItem("userdetails"));

    if (!jobDetails || !userDetails) {
        alert("Error retrieving job details. Please try again.");
        return;
    }

    // Prefill Job Details
    $('#job-id').val(jobDetails.JobId);
    $('#job-title').val(jobDetails.JobTitle);
    $('#job-category').val(jobDetails.JobCategory);
    $('#job-description').val(jobDetails.Description);

    $("#application-modal").fadeIn(); // Show application modal
});

// Close Modal
$(".close-modal").click(function () {
    $("#application-modal").fadeOut();
});



$("#submit-application-form").on("submit", function (event) {
    event.preventDefault();

    let formData = new FormData();
    let userDetails = JSON.parse(sessionStorage.getItem("userdetails") || localStorage.getItem("userdetails"));

    formData.append("JobId", $("#job-id").val());
    formData.append("UserId", userDetails.UserId);
    formData.append("Experience", $("#experience").val());
    formData.append("EducationalDetails", $("#education").val());
    formData.append("ResumeUpload", $("#resume")[0].files[0]);

    $.ajax({
        url: "/user/SubmitApplication",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            if (!response.success) {
                alert("Error: " + response.error);
                return;
            }

            alert(response.message);
            $('body').html(`
               <div id="success-message" class="success-container">
                     <div class="success-card">
                      <div class="check-icon">✔</div>
                         <h2>🎉 Application Submitted Successfully! 🎉</h2>
                          <p>Thank you for applying! Your application has been successfully submitted.</p>
                                 <button id="go-to-dashboard">Go to Dashboard</button>
                       </div>
               </div>
            `);
            $("#application-modal").fadeOut();
            sessionStorage.removeItem("jobDetails");
            $('#go-to-dashboard').on('click', function () {
                window.location.href = "/user/user_dashboard"; // Redirect to dashboard
            });
        },
        error: function (xhr) {
            alert("AJAX Error: " + xhr.responseText);
        }
    });
});



function previewProfilePicture(event) {
    var input = event.target;
    var preview = document.getElementById("profilePicturePreview");

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = "block";
        };

        reader.readAsDataURL(input.files[0]);
    }
}



//search job












$(document).ready(function () {
    console.log("Document is ready.");
    searchJobs();
    checkForJobId();

    //show data from local or session

    let user1 = JSON.parse(sessionStorage.getItem("userdetails"));
    let user2 = JSON.parse(localStorage.getItem("userdetails"));


    

    console.log("User Data from sessionStorage:", user1);
    console.log("User Data from localStorage:", user2);


    // Show Profile
    window.showProfile = function () {
        $('#profile-section').css('display', 'flex');
        $('#notification-section, #search-job, #profile-matches, #feedback-section').hide();
        if (user2) {
            $("#user-name").text(`${user2.FirstName} ${user2.LastName}`);
            $("#user-email").text(user2.Email);
            $("#user-phone").text(user2.PhoneNumber);
            $("#user-bio").text(user2.Bio || "No bio available.");

            if (user2.ProfilePicture) {
                $("#user-image").attr("src", user2.ProfilePicture).show();
                $("#user-icon").hide();
            } else {
                $("#user-image").hide();
                $("#user-icon").show();
            }
        } else {
            console.warn("No user data found in sessionStorage.");
        }
    };

    // Show Search Jobs
    function filterJobs() {
        let selectedCategory = $('#categoryFilter').val();
        let selectedLocation = $('#locationFilter').val();
        let selectedJobType = $('#jobTypeFilter').val();

        let filteredJobs = allJobs.filter(job => {
            return (selectedCategory === "" || job.JobCategory === selectedCategory) &&
                (selectedLocation === "" || job.Location === selectedLocation) &&
                (selectedJobType === "" || job.JobType === selectedJobType);
        });

        renderJobs(filteredJobs);
    }
    

    // Show Notifications
    window.showNotifications = function () {
        $('#notification-section').show();
        $('#profile-section, #search-job, #profile-matches, #feedback-section').hide();
    };

    // Show Feedback
    window.showFeedback = function () {
        $('#feedback-section').show();
        $('#profile-section, #notification-section, #profile-matches, #search-job, #manage-account').hide();


        //functionality

        $(".star").click(function () {
            let rating = $(this).data("value");
            $("#feedback-rating").val(rating);
            $(".star").removeClass("selected");
            $(this).addClass("selected").prevAll().addClass("selected");
        });

        $("#feedback-form").submit(function (event) {
            event.preventDefault();

            let rating = $("#feedback-rating").val();
            let feedbackText = $("#feedback-text").val();
            let userDetails = JSON.parse(sessionStorage.getItem("userdetails") || localStorage.getItem("userdetails"));

            if (!userDetails || !userDetails.UserId) {
                alert("User not logged in. Please log in to submit feedback.");
                return;
            }

            let userId = userDetails.UserId;

            $.ajax({
                url: "/User/SubmitFeedback",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ UserId: userId, Rating: rating, Comment: feedbackText }),
                success: function (response) {
                    if (response.success) {
                        let feedbackItem = `<li class="list-group-item">
                        <strong>${"★".repeat(rating)}</strong> - ${feedbackText}
                    </li>`;

                        if ($('#feedback-list li').text().trim() === "No feedback available.") {
                            $('#feedback-list').html("Your Feedback: " + feedbackItem + " Submitted");
                        } else {
                            $('#feedback-list').append(feedbackItem);
                        }
                        $("#feedback-text").val(""); // Clear input field
                        $("#feedback-rating").val("0"); // Reset rating
                        $(".star").removeClass("selected");
                    } else {
                        alert(response.message);
                    }
                },
                error: function () {
                    alert("Error submitting feedback.");
                }
            });
        });

    };

    // Show Manage Account
    window.showManageAccount = function () {
        $('#manage-account').show();
        $('#profile-section, #notification-section, #profile-matches, #feedback-section, #search-job').hide();


        // Retrieve user details from sessionStorage

           


            $('#manage-account').show();
            $('#profile-section,#notification-section, #profile-matches, #feedback-section,#search-job').hide();

            let user3 = JSON.parse(localStorage.getItem("userdetails"));
            console.log(user3);
            if (user3 && user3.UserId) {
                fetchUserDetails(user3.UserId); // Fetch details and pre-fill form
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
                            $("#first-name").val(user.FirstName);
                            $("#last-name").val(user.LastName);
                            $("#phone-number").val(user.PhoneNumber);
                            $("#password").val(user.Password);
                            $("#email").val(user.Email);



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
                $("body").html(`
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
    };

    // Ensure functions are globally accessible
    window.filterJobs = filterJobs;
    window.renderJobs = renderJobs;
    window.populateFilters = populateFilters;

    console.log("Functions registered globally.");

    // Load initial sections
    $('#search-job').show();
});
