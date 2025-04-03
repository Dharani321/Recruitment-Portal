function confirmLogout() {
    Swal.fire({
        title: "Want to log out?",
        html: `<i class="fas fa-sign-out-alt" style="font-size: 50px; color: red;"></i>
        <p style="margin-top: 10px;">Choose an option below:</p>`,
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Login with Another Account",
        cancelButtonText: "Logout",
        denyButtonText: "Stay on Page",
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "/Admin/AdminLogin";
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
            // Call logout API to clear session before redirecting
            fetch('/Admin/AdminLogout', { method: 'POST' })
                .then(() => {
                    sessionStorage.removeItem("admin");
                    localStorage.removeItem("admindetails");
                    window.location.href = "/Home/Index";
                })
                .catch(err => console.error('Logout failed:', err));
        }
        else if (result.isDenied) {
            Swal.fire("You chose to stay!", "You are still logged in.", "info");
        }
    });
}
