$(document).ready(function () {
    var table = $(".table").DataTable({
        "processing": true,
        "serverSide": false,
        "ajax": {
            "url": "/Admin/GetUsers",  // ✅ Updated to match UserController
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "UserId" },
            { "data": "FirstName" },
            { "data": "LastName" },
            { "data": "PhoneNumber" },
            { "data": "Email" },
            { "data": "Password" },
            {
                "data": "ProfilePicture",
                "render": function (data) {
                    return data
                        ? `<img src="${data}" class="img-thumbnail" width="50" height="50">`
                        : `<span class="text-muted">No Picture</span>`;
                }

            },
            {
                "data": null,
                "render": function (data, type, row) {
                    return `
                        <button class="btn btn-sm btn-primary edit-btn" 
                            data-id="${row.UserId}" 
                            data-firstname="${row.FirstName}" 
                            data-lastname="${row.LastName}" 
                            data-phonenumber="${row.PhoneNumber}" 
                            data-email="${row.Email}" 
                            data-password="${row.Password}" 
                            data-profilepicture="${row.ProfilePicture}">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${row.UserId}">
                            Delete
                        </button>
                    `;
                }
            }
        ],
        "responsive": true,
        "language": {
            "emptyTable": "No users found",
            "loadingRecords": "Loading..."
        }
    });

    // 🎯 Open Edit Modal & Populate Data
    $(document).on("click", ".edit-btn", function () {
        let userId = $(this).data("id");
        let firstName = $(this).data("firstname");
        let lastName = $(this).data("lastname");
        let phoneNumber = $(this).data("phonenumber");
        let email = $(this).data("email");
        let password = $(this).data("password");
        let profilePicture = $(this).data("profilepicture");

        $("#editUserId").val(userId);
        $("#editFirstName").val(firstName);
        $("#editLastName").val(lastName);
        $("#editPhoneNumber").val(phoneNumber);
        $("#editEmail").val(email);
        $("#editPassword").val(password);
        // ✅ Display profile picture if available
        if (profilePicture) {
            $("#profilePicturePreview").html(`<img src="/ProfilePictures/${profilePicture}" class="img-thumbnail" width="80">`);
            $("#existingProfilePicture").val(profilePicture);
        } else {
            $("#profilePicturePreview").html(`<span class="text-muted">No Picture</span>`);
            $("#existingProfilePicture").val("");
        }

        // Open Modal
        $("#editModal").modal("show");
    });

    // 🎯 Save Changes (AJAX with File Upload)
    $("#editForm").submit(function (e) {
        e.preventDefault();

        let formData = new FormData(this);
        formData.append("UserId", $("#editUserId").val());
        formData.append("FirstName", $("#editFirstName").val());
        formData.append("LastName", $("#editLastName").val());
        formData.append("PhoneNumber", $("#editPhoneNumber").val());
        formData.append("Email", $("#editEmail").val());
        formData.append("Password", $("#editPassword").val());
        formData.append("ExistingProfilePicture", $("#existingProfilePicture").val());  // Pass existing picture

        $.ajax({
            url: `/Admin/UpdateAccount`,  // ✅ Updated to match UserController
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.success) {
                    alert("User updated successfully!");
                    $("#editModal").modal("hide");
                    $(".table").DataTable().ajax.reload(); // ✅ Refresh DataTable
                } else {
                    alert("Error: " + response.message);
                }
            }
        });
    });

    // 🎯 Delete Button Click
    $(document).on("click", ".delete-btn", function () {
        let userId = $(this).data("id");

        if (confirm("Are you sure you want to delete this user?")) {
            $.ajax({
                url: `/Admin/DeleteUser`,  // ✅ Updated to match UserController
                type: "POST",
                data: { userId: userId }, // 🔹 Pass UserId in request body
                success: function (response) {
                    if (response.success) {
                        alert("User deleted successfully!");
                        $(".table").DataTable().ajax.reload(); // ✅ Refresh DataTable
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
