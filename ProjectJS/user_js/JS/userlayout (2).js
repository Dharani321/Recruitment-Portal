document.addEventListener("DOMContentLoaded", function () {
    // Sidebar toggle for mobile
    const sidebar = document.querySelector(".sidebar");
    const toggleSidebar = document.getElementById("toggle-sidebar");

    if (toggleSidebar) {
        toggleSidebar.addEventListener("click", function () {
            sidebar.classList.toggle("active");
        });
    }

        // Notification Badge
        function updateNotificationCount(count) {
            let badge = document.getElementById("notification-count");
            if (count > 0) {
                badge.style.display = "inline-block";
                badge.innerText = count;
            } else {
                badge.style.display = "none";
            }
        }

    // Sample Notification Example
    updateNotificationCount(3);
});
