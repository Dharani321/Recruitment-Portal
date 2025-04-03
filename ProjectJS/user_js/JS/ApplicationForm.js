$(document).ready(function () {
    // Retrieve Job Details from sessionStorage
    let jobDetails = localStorage.getItem('jobDetails');
    console.log(jobDetails);
    console.log("Hi");
    //user details from session

  
    let user1 = JSON.parse(sessionStorage.getItem("user"));
    console.log(user1);

    //user details from local

   

    // Retrieve data from local storage
    console.log("Retrieve data from local storage");
    let user2 = JSON.parse(localStorage.getItem("userdetails"));

    console.log(user2);


    if (!jobDetails) {
        console.error("Job details not found in sessionStorage!");
        alert("Job details are missing. Please go back and select a job.");
        return;
    }

    // Parse stored job details
    jobDetails = JSON.parse(jobDetails);

    // Populate predefined fields in the form
    $('#job-id').val(jobDetails.JobId);
    $('#job-title').val(jobDetails.JobTitle);
    $('#job-category').val(jobDetails.JobCategory);
    $('#job-description').val(jobDetails.Description);
    $('#job-qualification').val(jobDetails.Qualification);


    var JobId = jobDetails.JobId;
    var UserId = user2.UserId;
    var Experience = $('#experience').val();
    var EducationalDetails = $('#education').val();
    
    var ResumeUpload = $('#resume').val();


    // Handle form submission
    $('#submit-application-form').on('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        let formData = new FormData(); // Automatically includes form fields
        formData.append('JobId', jobDetails.JobId);
        formData.append('UserId', user2.UserId);
        formData.append('Experience', $('#experience').val());
        formData.append('EducationalDetails', $('#education').val());
        formData.append('ResumeUpload', $('#resume')[0].files[0]); // File input handling


        console.log("Form Data Submitted:");
        for (let pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1]); // Logs each key-value pair
        }

        $.ajax({
            url: '/user/SubmitApplication', // Adjust endpoint as needed
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (!response.success) {
                    console.error("Server Error:", response.error);
                 
                    return;
                }
                alert(response.message);
                // Show success message with animation
                // Replace entire body with success message
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
                sessionStorage.removeItem('jobDetails'); // Clear job details after successful submission
                $('#go-to-dashboard').on('click', function () {
                    window.location.href = "/user/user_dashboard"; // Update with actual dashboard URL
                });
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", xhr.responseText);
                alert(response.message);
            }
        });
    });
});
