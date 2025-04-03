$(document).ready(function () {
    var table = $("#jobPostingsTable").DataTable({
        "processing": true,
        "serverSide": false,
        "ajax": {
            "url": "/Admin/GetAllJobPostings",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "JobId" },
            { "data": "JobTitle" },
            { "data": "CompanyName" },
            { "data": "Location" },
            { "data": "JobType" },
            { "data": "Experience" },
            
            { "data": "EndDate" },
            { "data": "Description" },
            { "data": "JobCategory" },
            
            
            { "data": "Salary", "render": function (data) { return `$${data.toFixed(2)}`; } },
            {
                "data": "ApplicationStatus",
                "render": function (data, type, row) {
                    let statusOptions = ["In Review", "Interview", "Selected", "Rejected"];
                    let selectHtml = `<select class="form-select status-dropdown" data-id="${row.ApplyId}">`;

                    statusOptions.forEach(status => {
                        selectHtml += `<option value="${status}" ${data === status ? 'selected' : ''}>${status}</option>`;
                    });

                    selectHtml += `</select>`;
                    return selectHtml;
                }
            },
            {
                "data": null,
                "render": function (data, type, row) {
                    return `
                        <button class="btn btn-sm btn-primary edit-btn" 
                            data-id="${row.JobId}" 
                            data-title="${row.JobTitle}" 
                            data-company="${row.CompanyName}" 
                            data-location="${row.Location}" 
                            data-type="${row.JobType}" 
                            data-experience="${row.Experience}" 
                            data-enddate="${row.EndDate}" 
                            data-description="${row.Description}" 
                            data-category="${row.JobCategory}" 
                            
                            data-salary="${row.Salary}">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${row.JobId}">
                            Delete
                        </button>
                    `;
                }
            }
        ],
        "responsive": true,
        "language": {
            "emptyTable": "No job postings found",
            "loadingRecords": "Loading..."
        }
    });


    // 🎯 Open Edit Modal & Populate Data
    $(document).on("click", ".edit-btn", function () {
        let jobId = $(this).data("id");
        let jobTitle = $(this).data("title");
        let company = $(this).data("company");
        let location = $(this).data("location");
        let jobType = $(this).data("type");
        let experience = $(this).data("experience");
        let endDate = $(this).data("enddate");
        let description = $(this).data("description");
        let jobCategory = $(this).data("category");
        
        let salary = $(this).data("salary");

        // Populate Modal Fields
        $("#editJobId").val(jobId);
        $("#editJobTitle").val(jobTitle);
        $("#editCompanyName").val(company);
        $("#editLocation").val(location);
        $("#editJobType").val(jobType);
        $("#editExperience").val(experience);
        $("#editEndDate").val(endDate);
        $("#editDescription").val(description);
        $("#editJobCategory").val(jobCategory);
        
        $("#editSalary").val(salary);

        // Open Modal
        $("#editModal").modal("show");
    });

    // 🎯 Save Changes (AJAX Update)
    $("#editForm").submit(function (e) {
        e.preventDefault();

        let formData = {
            JobId: $("#editJobId").val(),
            JobTitle: $("#editJobTitle").val(),
            CompanyName: $("#editCompanyName").val(),
            Location: $("#editLocation").val(),
            JobType: $("#editJobType").val(),
            Experience: $("#editExperience").val(),
            EndDate: $("#editEndDate").val(),
            Description: $("#editDescription").val(),
            JobCategory: $("#editJobCategory").val(),
            
            Salary: $("#editSalary").val()
        };

        $.ajax({
            url: `/Admin/UpdateJobPosting`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(formData),
            success: function (response) {
                if (response.success) {
                    alert("Job posting updated successfully!");
                    $("#editModal").modal("hide");
                    $("#jobPostingsTable").DataTable().ajax.reload(); // ✅ Refresh DataTable
                } else {
                    alert("Error: " + response.message);
                }
            }
        });
    });

    // 🎯 Delete Button Click
    $(document).on("click", ".delete-btn", function () {
        let jobId = $(this).data("id");

        if (confirm("Are you sure you want to delete this job posting?")) {
            $.ajax({
                url: `/Admin/DeleteJobPosting`,
                type: "POST",
                data: { JobId: jobId },
                success: function (response) {
                    if (response.success) {
                        alert("Job posting deleted successfully!");
                        $("#jobPostingsTable").DataTable().ajax.reload(); // ✅ Refresh DataTable
                    } else {
                        alert("Error: " + response.message);
                    }
                },
                error: function (xhr, status, error) {
                    console.log("AJAX Error:", error);
                    alert("Something went wrong. Please try again.");
                }
            });
        }
    });
});
