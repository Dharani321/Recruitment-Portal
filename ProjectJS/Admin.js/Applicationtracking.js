$(document).ready(function () {
    var table = $("#jobApplicationsTable").DataTable({
        "processing": true,
        "serverSide": false,
        "ajax": {
            "url": "/Admin/GetAllJobApplications",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "ApplyId" },
            { "data": "UserId" },
            { "data": "JobId" },
            { "data": "Experience" },
            { "data": "EducationalDetails" },
            {
                "data": "ResumeUpload", "render": function (data) {
                    return `<a href="${data}" target="_blank">View Resume</a>`;
                }
            },
            {
                "data": "ApplicationStatus",
                "render": function (data, type, row) {
                    let isRejected = (data === "Rejected" || data === "Selected") ? "disabled" : "";
                    let saveButton = (data === "Rejected" || data === "Selected") ? "" : `<button class="btn btn-sm btn-success save-status" data-id="${row.ApplyId}" style="display:none;">Save</button>`;

                    return `
                        <div class="status-container">
                            <select class="form-select status-dropdown" data-id="${row.ApplyId}" ${isRejected}>
                                <option value="In Review" ${data === "In Review" ? "selected" : ""}>In Review</option>
                                <option value="Interview" ${data === "Interview" ? "selected" : ""}>Interview</option>
                                <option value="Selected" ${data === "Selected" ? "selected" : ""}>Selected</option>
                                <option value="Rejected" ${data === "Rejected" ? "selected" : ""}>Rejected</option>
                            </select>
                            ${saveButton}
                        </div>`;
                }
            },
            {
                "data": null,
                "render": function (data, type, row) {
                    return `<button class="btn btn-sm btn-danger delete-btn" data-id="${row.ApplyId}">Delete</button>`;
                }
            }
        ],
        "responsive": true,
        "language": {
            "emptyTable": "No job applications found",
            "loadingRecords": "Loading..."
        }
    });

    // 🎯 Show Save Button on Dropdown Change
    $(document).on("change", ".status-dropdown", function () {
        let applyId = $(this).data("id");
        $(`button.save-status[data-id='${applyId}']`).show(); // Show Save Button
    });

    // 🎯 Save Status Change to Database
    $(document).on("click", ".save-status", function () {
        let applyId = $(this).data("id");
        let newStatus = $(`select.status-dropdown[data-id='${applyId}']`).val();

        $.ajax({
            url: "/Admin/UpdateApplicationStatus",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ ApplyId: applyId, ApplicationStatus: newStatus }),
            success: function (response) {
                if (response.success) {
                    alert("Application status updated successfully!");
                    $("#jobApplicationsTable").DataTable().ajax.reload(); // ✅ Refresh Table
                } else {
                    alert("Error: " + response.message);
                }
            }
        });
    });

    //Delete the data

    // 🎯 Delete Application
    // 🎯 Delete Application
    $(document).on("click", ".delete-btn", function () {
        let applyId = $(this).data("id");

        if (confirm("Are you sure you want to delete this application?")) {
            $.ajax({
                url: "/Admin/DeleteJobApplication",
                type: "POST",
                data: { ApplyId: applyId }, // 🔹 Pass directly without JSON.stringify
                success: function (response) {
                    if (response.success) {
                        alert(response.message);
                        $("#jobApplicationsTable").DataTable().ajax.reload(null, false); // ✅ Correct way to reload
                    } else {
                        alert("Error: " + response.message);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("AJAX Error:", error);
                    alert("Something went wrong. Please try again.");
                }
            });
        }
    });

});
