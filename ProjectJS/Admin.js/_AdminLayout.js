
// Function to hide the full URL but keep the functionality
function hideUrl() {
    if (window.history && window.history.replaceState) {
        // Keep only the base URL (without query params or hashes)
        window.history.replaceState({}, document.title, window.location.origin + "/");
        alert("admin_url_hide");
    }
}

// Call the function on page load
window.onload = hideUrl;

// Ensure it also applies when users navigate through history or hash changes
window.addEventListener('hashchange', hideUrl);
window.addEventListener('popstate', hideUrl);
