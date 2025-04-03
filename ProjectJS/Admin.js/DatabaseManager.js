$(document).ready(function () {
    var table = $(".table").DataTable({
        processing: true,
        serverSide: false,
        ajax: {
            url: "/Admin/GetAllApplications",
            type: "GET",
            datatype: "json"
        },
        columns: [
            { data: "ApplyId" },
            { data: "UserId" },
            { data: "FirstName" },
            { data: "LastName" },
            { data: "Experience" },
            { data: "EducationalDetails" },
            { data: "JobTitle" },
            {
                data: "ResumeUpload",
                render: function (data) {
                    return data
                        ? `<a href="/Resumes/${data}" target="_blank" class="btn btn-sm btn-success">
                            <i class="fas fa-file-alt"></i> View Resume
                        </a>`
                        : `<span class="text-muted">No Resume</span>`;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-primary edit-btn" 
                                data-id="${row.ApplyId}" 
                                data-userid="${row.UserId}" 
                                data-jobid="${row.JobTitle}" 
                                data-firstname="${row.FirstName}" 
                                data-lastname="${row.LastName}" 
                                data-experience="${row.Experience}" 
                                data-education="${row.EducationalDetails}" 
                                data-resume="${row.ResumeUpload}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${row.ApplyId}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    `;
                }
            }
        ],
        responsive: true,
        language: {
            emptyTable: "No applications found",
            loadingRecords: "Loading..."
        }
    });

    // 🎯 Open Edit Modal & Populate Data
    $(document).on("click", ".edit-btn", function () {
        let applyId = $(this).data("id");
        let userId = $(this).data("userid");
        let firstName = $(this).data("firstname");
        let lastName = $(this).data("lastname");
        let experience = $(this).data("experience");
        let education = $(this).data("education");
        let resume = $(this).data("resume");

        // Populate Modal Fields
        $("#editApplyId").val(applyId);
        $("#editUserId").val(userId);
        $("#editFirstName").val(firstName);
        $("#editLastName").val(lastName);
        $("#editExperience").val(experience);
        $("#editEducation").val(education).change();

        if (resume) {
            $("#resumeLink").html(`<a href="/Resumes/${resume}" target="_blank" class="btn btn-info">
                <i class="fas fa-file-alt"></i> View Resume
            </a>`);
            $("#existingResume").val(resume);
        } else {
            $("#resumeLink").html(`<span class="text-muted">No Resume</span>`);
            $("#existingResume").val("");
        }

        $("#editModal").modal("show");
    });

    // 🎯 Save Changes (AJAX with File Upload)
    $("#editForm").submit(function (e) {
        e.preventDefault();

        let formData = new FormData(this);
        formData.append("ApplyId", $("#editApplyId").val());
        formData.append("UserId", $("#editUserId").val());
        formData.append("FirstName", $("#editFirstName").val());
        formData.append("LastName", $("#editLastName").val());
        formData.append("EducationalDetails", $("#editEducation").val());
        formData.append("ExistingResume", $("#existingResume").val());

        $.ajax({
            url: `/Admin/UpdateApplication`,
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
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
                    Swal.fire("Success!", "Application updated successfully!", "success").then(() => {
                        $("#editModal").modal("hide");
                        table.ajax.reload();
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
    });

    // 🎯 Delete Button Click
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
                    url: `/Admin/DeleteApplication`,
                    type: "POST",
                    data: { applyId: applyId },
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
                                table.ajax.reload();
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
