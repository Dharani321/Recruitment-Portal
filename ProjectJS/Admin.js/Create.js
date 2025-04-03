$(document).ready(function () {
    $('#submit').on('click', function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the values of the form fields
        var title = $('#title').val();
        var companyName = $('#companyName').val();
        var location = $('#location').val();
        var jobType = $('#jobType').val();
        var salary = $('#salary').val();
        var experience = $('#experience').val();
        var endDate = $('#endDate').val();
        var description = $('#description').val();
        var jobCategory = $('#jobCategory').val();
        var additionaldetails = $('#details').val();
        var skills = $('#skills').val();
        // Basic validation
        if (!title || !companyName || !location || !jobType || !salary || !experience || !endDate || !jobCategory || !description) {
            alert('Please fill out all required fields.');
            return;
        }

        // Format the end date to "yyyy-MM-dd"
        var formattedEndDate = new Date(endDate).toISOString().split('T')[0];

        // Prepare FormData to send to the server
        var formData = new FormData();
        formData.append("JobTitle", title);
        formData.append("CompanyName", companyName);
        formData.append("Location", location);
        formData.append("JobType", jobType);
        formData.append("Salary", salary);
        formData.append("Experience", experience);
        formData.append("EndDate", formattedEndDate);
        formData.append("Description", description);
        formData.append("JobCategory", jobCategory);
        formData.append("Description2", additionaldetails);
        formData.append("SkillRequired", skills);
        
        var adminId = JSON.parse(localStorage.getItem('admindetails'));
        console.log("Logged-in Admin ID:", adminId.AdminId);
        formData.append("AdminId", adminId.AdminId);

        for (var pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
        }
        // AJAX call to send the data
        $.ajax({
            url: '/Admin/SaveJobData', // Make sure this URL is correct
            type: 'POST',
            data: formData,
            contentType: false, // Important for file uploads
            processData: false, // Important for file uploads
            success: function (response) {
                console.log(response);
                if (response.success) {
                    //alert(response.message); // Show success message

                    //sweetalert
                    let response = { message: "Job posted successfully!", status: "success" };

                    // Show styled alert
                    Swal.fire({
                        title: "Success!",
                        text: response.message,
                        icon: "success", // Can be 'success', 'error', 'warning', 'info', 'question'
                        confirmButtonText: "OK",
                        timer: 3000, // Auto-close after 3 seconds
                        showClass: {
                            popup: "animate__animated animate__fadeInDown" // Add animation
                        },
                        hideClass: {
                            popup: "animate__animated animate__fadeOutUp"
                        }
                    });
                    $('#jobForm')[0].reset(); // Reset form after success
                } else {
                    alert('Error: ' + response.message); // Show error message
                }
            },
            error: function (xhr, status, error) {
                console.error(xhr.responseText); // Log response error for debugging
                alert('AJAX Error: ' + error); // Show AJAX error message
            }
        });
    });
});
