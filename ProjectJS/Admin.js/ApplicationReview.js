$(document).ready(function () {
    var table = $("#jobApplicationsTable").DataTable({
        processing: true,
        serverSide: false,
        ajax: {
            url: "/Admin/GetAllJobApplications",
            type: "GET",
            datatype: "json"
        },
        columns: [
            { data: "ApplyId"},
          
            { data: "FirstName"},
            { data: "LastName"},
            { data: "JobName"},
           
            {
                data: "ResumeUpload",
                render: function (data) {
                    return `<a href="${data}" target="_blank" class="btn btn-sm btn-primary">
                                <i class="fas fa-file-alt"></i> View Resume
                            </a>`;
                }
            },
            {
                data: "ApplicationStatus",
                render: function (data, type, row) {
                    let isRejected = (data === "Rejected") ? "disabled" : "";
                    let saveButton = (data === "Rejected") ? "" :
                        `<button class="btn btn-sm btn-success save-status" data-id="${row.ApplyId}" style="display:none;">
                            <i class="fas fa-save"></i> Save
                         </button>`;

                    return `
                        <div class="status-container">
                            <select class="form-select status-dropdown" data-id="${row.ApplyId}" ${isRejected}>
                                <option value="In Review" ${data === "In Review" ? "selected" : ""}>In Review</option>
                                <option value="Interview" ${data === "Interview" ? "selected" : ""}>Arrange Interview</option>
                                <option value="Rejected" ${data === "Rejected" ? "selected" : ""}>Rejected</option>
                            </select>
                            ${saveButton}
                        </div>`;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `<button class="btn btn-sm btn-danger delete-btn" data-id="${row.ApplyId}">
                                <i class="fas fa-trash-alt"></i> Delete
                            </button>`;
                }
            }
        ],
        responsive: true,
        language: {
            emptyTable: "No job applications found",
            loadingRecords: "Loading..."
        }
    });

    // 🎯 Show Save Button when Dropdown Changes
    $(document).on("change", ".status-dropdown", function () {
        let applyId = $(this).data("id");
        $(`button.save-status[data-id='${applyId}']`).show();
    });

    // 🎯 Save Status Change
    $(document).on("click", ".save-status", function () {
        let applyId = $(this).data("id");
        let newStatus = $(`select.status-dropdown[data-id='${applyId}']`).val();

        $.ajax({
            url: "/Admin/UpdateApplicationStatus",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ ApplyId: applyId, ApplicationStatus: newStatus }),
            beforeSend: function () {
                Swal.fire({
                    title: "Updating...",
                    text: "Please wait...",
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });
            },
            success: function (response) {
                Swal.close();
                if (response.success) {
                    Swal.fire("Success!", "Application status updated successfully!", "success").then(() => {
                        table.ajax.reload(null, false);
                    });

                    if (newStatus === "Interview") {
                        let row = table.row($(`button.save-status[data-id='${applyId}']`).closest("tr")).data();

                        // Populate Modal
                        $("#applyId").val(row.ApplyId);
                        $("#userId").val(row.UserId);
                        $("#jobId").val(row.JobId);
                        $("#EducationalDetails").val(row.EducationalDetails);
                        $("#Experience").val(row.Experience);
                        $("#resumeLink").attr("href", row.ResumeUpload);

                        $("#interviewModal").modal("show");
                    }
                } else {
                    Swal.fire("Error", response.message, "error");
                }
            },
            error: function () {
                Swal.close();
                Swal.fire("Error", "Something went wrong. Please try again!", "error");
            }
        });
    });

    // 🎯 Schedule Interview
    $("#scheduleInterviewBtn").click(function () {
        var interviewData = {
            ApplyId: $('#applyId').val(),
            UserId: $('#userId').val(),
            JobId: $('#jobId').val(),
            Experience: $('#Experience').val(),
            EducationalDetails: $('#EducationalDetails').val(),
            ResumeUpload: $('#resumeLink').attr('href'),
            InterviewDateTime: $('#interviewDateTime').val(),
            Location: $('#interviewLocation').val(),
            CreatedAt: new Date().toISOString()
        };

        $.ajax({
            url: "/Admin/ScheduleInterview",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(interviewData),
            beforeSend: function () {
                Swal.fire({
                    title: "Scheduling Interview...",
                    text: "Please wait...",
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });
            },
            success: function (response) {
                Swal.close();
                if (response.success) {
                    Swal.fire("Success!", "Interview scheduled successfully!", "success").then(() => {
                        $("#interviewModal").modal("hide");
                        table.ajax.reload(null, false);
                    });
                } else {
                    Swal.fire("Error", "Failed to schedule interview. Try again!", "error");
                }
            },
            error: function () {
                Swal.close();
                Swal.fire("Error", "Something went wrong. Please try again!", "error");
            }
        });
    });

    // 🎯 Delete Application
    $(document).on("click", ".delete-btn", function () {
        let applyId = $(this).data("id");

        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "/Admin/DeleteJobApplication",
                    type: "POST",
                    data: { ApplyId: applyId },
                    beforeSend: function () {
                        Swal.fire({
                            title: "Deleting...",
                            text: "Please wait...",
                            allowOutsideClick: false,
                            didOpen: () => Swal.showLoading()
                        });
                    },
                    success: function (response) {
                        Swal.close();
                        if (response.success) {
                            Swal.fire("Deleted!", "Application has been deleted.", "success").then(() => {
                                table.ajax.reload(null, false);
                            });
                        } else {
                            Swal.fire("Error", response.message, "error");
                        }
                    },
                    error: function () {
                        Swal.close();
                        Swal.fire("Error", "Something went wrong. Please try again!", "error");
                    }
                });
            }
        });
    });
});
