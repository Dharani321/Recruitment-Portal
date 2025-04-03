document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btnLogin').addEventListener('click', function (e) {
        e.preventDefault();

        var email = document.getElementById('email1').value.trim();
        var password = document.getElementById('password1').value.trim();

        console.log(email + password)
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }
        else {
            alert("correct data");
        }

        var formData = new FormData();
        formData.append('Email', email);
        formData.append('Password', password);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/Admin/AdminLogin', true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); // Helps server recognize AJAX requests

        xhr.onload = function () {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    alert(response.message);
                    if (response.success) {
                        localStorage.setItem('AdminId', response.AdminId);
                        var adminId = localStorage.getItem('AdminId');
                        console.log("Logged-in Admin ID:", adminId);

                        window.location.href = '/Admin/Index';
                    } else {
                        document.getElementById('email').value = '';
                        document.getElementById('password').value = '';
                    }
                } catch (error) {
                    alert("Invalid server response.");
                }
            } else {
                alert("Error: " + xhr.status + " " + xhr.statusText);
            }
        };

        xhr.onerror = function () {
            alert("Request failed. Please check your connection.");
        };

        xhr.send(formData);
    });
});
