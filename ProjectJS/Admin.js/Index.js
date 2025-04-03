function convertDate(jsonDate) {
    // Extract the timestamp from the JSON date format
    let timestamp = parseInt(jsonDate.match(/\d+/)[0]);

    // Convert to a Date object
    let date = new Date(timestamp);

    // Format the date (YYYY-MM-DD HH:MM:SS)
    let formattedDate = date.toISOString().replace('T', ' ').substring(0, 19);

    return formattedDate;
}

document.addEventListener('DOMContentLoaded', function () {
    fetch('/Admin/GetAdminDetails')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error(data.message);
            } else {

                //console.log(data.data);

                //*
                sessionStorage.setItem("admin", JSON.stringify(data.data));
                let admin1 = JSON.parse(sessionStorage.getItem("admin"));
                //console.log(admin1);

                // Save data to local storage
                localStorage.setItem("admindetails", JSON.stringify(data.data));

                // Retrieve data from local storage
                console.log("Retrieve data from local storage");
                let admin2 = JSON.parse(localStorage.getItem("admindetails"));


                console.log(admin2.ImagePath);
                //*
                //FirstName
                //LastName
                //Email
                //Phone
                //DOB
                //role
                document.getElementById('profile-img').src = admin2.ImagePath;
                document.getElementById('FirstName').textContent = admin2.FirstName;
                document.getElementById('FirstName1').textContent = admin2.FirstName;
                document.getElementById('LastName').textContent = data.data.LastName;
                document.getElementById('Email').textContent = data.data.Email;
                document.getElementById('role').textContent = admin2.RoleType;
                document.getElementById('Phone').textContent = admin2.
                    Password
;
                document.getElementById('DOB').textContent = admin2.DateOfBirth
;
                document.getElementById('adminJoinDate').textContent = convertDate(admin2.CreatedDate);

                console.log("Converted Date by javascript function : "+convertDate(admin2.CreatedDate));
            }
        })
        .catch(error => {
            console.error('Error fetching admin details:', error);
        });
});


//console.log("All sessionStorage items:");
for (let i = 0; i < sessionStorage.length; i++) {
    let key = sessionStorage.key(i);
   // console.log(`${key}: ${sessionStorage.getItem(key)}`);
}


document.addEventListener("DOMContentLoaded", function () {
    let adminData = JSON.parse(localStorage.getItem("admindetails"));

    if (adminData) {
        document.getElementById("adminName").textContent = `Hello, ${adminData.FirstName}!`;
       
        let admin2 = JSON.parse(localStorage.getItem("admindetails"));

        console.log(admin2);
        //*
      

        document.getElementById('adminRole').textContent = adminData.RoleType;
        document.getElementById('adminPhone').textContent = adminData.Email;
        document.getElementById('adminJoinDate').textContent = new Date(adminData.CreatedDate);
        // Show the modal after page load
        let welcomeModal = new bootstrap.Modal(document.getElementById("welcomeModal"));
        welcomeModal.show();

        // Auto-close after 5 seconds
        setTimeout(() => {
            welcomeModal.hide();
        }, 5000);
    }

    
});

document.getElementById("edit").addEventListener("click", function () {
    //// Simulated data from database
    //const userData = {
    //    firstName: "Natashia",
    //    lastName: "Khaleira",
    //    email: "info@binary-fusion.com",
    //    phone: "(+62) 821 2554-5846",
    //    dob: "1990-10-12",
    //    role: "Admin"
    //};
    let admin2 = JSON.parse(localStorage.getItem("admindetails"));

    console.log(admin2);


    // Fill form fields with database values
    document.getElementById("firstName").value = admin2.FirstName;
    document.getElementById("lastName").value = admin2.LastName;
    document.getElementById("email").value = admin2.Email;
    document.getElementById("password").value = admin2.Password;
    document.getElementById("dob").value = admin2.DateOfBirth;
    document.getElementById("image").value = admin2.ImagePath;
    document.getElementById("role").value = admin2.RoleType;

    // Show the Bootstrap modal
    let editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    editProfileModal.show();
});


document.getElementById("saveChanges").addEventListener("click", function () {
    const updatedUser = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        dob: document.getElementById("dob").value,
        role: document.getElementById("role").value
    };

    console.log("Updated Data:", updatedUser);
    alert("Profile Updated Successfully!");

    // Close modal
    let editProfileModal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
    editProfileModal.hide();
});

