$(document).ready(function () {
    let table = $("#jobApplicationsTable").DataTable({
        processing: true,
        serverSide: false,
        responsive: true,
        autoWidth: false,
        lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
        pageLength: 10,
        ordering: true,
        pagingType: "simple_numbers",
        dom: '<"row"<"col-md-6"l><"col-md-6"f>>rt<"row"<"col-md-6"i><"col-md-6"p>>',
        language: {
            search: "🔍 Search:",
            lengthMenu: "Show _MENU_ entries",
            info: "Showing _START_ to _END_ of _TOTAL_ applications",
            paginate: {
                previous: "← Prev",
                next: "Next →"
            }
        },
        ajax: {
            url: "/Admin/GetAllInterview",
            type: "GET",
            datatype: "json",
            dataSrc: function (json) {
                console.log("Response from /Admin/GetAllInterview:", json);
                return json.data || [];
            },
            error: function (xhr) {
                console.error("Error loading data:", xhr.responseText);
            }
        },
        columns: [
            { data: "InterviewId" },
            { data: "ApplyId" },
            { data: "Experience" },
            { data: "EducationalDetails" },
            {
                data: "ResumeUpload",
                render: function (data) {
                    return data
                        ? `<a href="${data}" target="_blank" class="btn btn-sm btn-primary">
                            <i class="bi bi-file-earmark-text"></i> View Resume</a>`
                        : `<span class="text-muted">No Resume</span>`;
                }
            },
            { data: "InterviewDateTime" },
            { data: "Location" },
            {
                data: "InterviewStatus",
                render: function (data, type, row) {
                    let isRejected = data === "Rejected" ? "disable" : "";
                    let badgeClass =
                        data === "Pending" ? "badge bg-warning text-dark" :
                            data === "Selected" ? "badge bg-success" :
                                "badge bg-danger";

                    let saveButton = data === "Rejected" ? "" :
                        `<button class="btn btn-sm btn-success save-status mt-2" data-id="${row.InterviewId}" style="display:none;">
                            <i class="bi bi-save"></i> Save
                        </button>`;

                    return `
                        <div class="status-container">
                            <select class="form-select status-dropdown" data-id="${row.InterviewId}" ${isRejected}>
                                <option value="Pending" ${data === "Pending" ? "selected" : ""}>Pending</option>
                                <option value="Selected" ${data === "Selected" ? "selected" : ""}>Selected</option>
                                <option value="Rejected" ${data === "Rejected" ? "selected" : ""}>Rejected</option>
                            </select>
                            ${saveButton}
                        </div>`;
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `<button class="btn btn-sm btn-danger delete-btn" data-id="${row.InterviewId}">
                                <i class="bi bi-trash"></i> Delete
                            </button>`;
                }
            }
        ]
    });

    // 🎯 Show Save Button when Dropdown Changes
    $(document).on("change", ".status-dropdown", function () {
        let interviewId = $(this).data("id");
        $(`button.save-status[data-id='${interviewId}']`).show();
    });

    // 🎯 Save Status to Database
    $(document).on("click", ".save-status", function () {
        console.log("Save button clicked");
        let interviewId = $(this).data("id");
        let newStatus = $(`select.status-dropdown[data-id='${interviewId}']`).val();

        $.ajax({
            url: "/Admin/UpdateInterviewStatus",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ InterviewId: interviewId, InterviewStatus: newStatus }),
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Success!",
                        text: "Interview status updated successfully!",
                        confirmButtonColor: "#3085d6",
                        confirmButtonText: "OK"
                    }).then(() => {
                        $("#jobApplicationsTable").DataTable().ajax.reload();
                    });
                }
            },
            error: function (xhr) {
                console.error("Error updating status:", xhr.responseText);
            }
        });
    });

    // 🎯 Delete Interview Entry
    $(document).on("click", ".delete-btn", function () {
        let InterviewId = $(this).data("id");
        console.log(InterviewId);
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
                alert("DELETED");
                $.ajax({
                    url: "/Admin/DeleteInterview",
                    type: "POST",
                    data: { InterviewId: InterviewId } 
,
                    success: function (response) {
                        if (response.success) {
                            Swal.fire({
                                icon: "success",
                                title: "Deleted!",
                                text: "Interview entry has been deleted.",
                                confirmButtonColor: "#3085d6"
                            }).then(() => {
                                $("#jobApplicationsTable").DataTable().ajax.reload();
                            });
                        }
                    },
                    error: function (xhr) {
                        console.error("Error deleting record:", xhr.responseText);
                    }
                });
            }
        });
    });

});
