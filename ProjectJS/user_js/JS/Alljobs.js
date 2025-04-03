$(document).ready(function () {
    // Fetch jobs from the server
    $.ajax({
        url: '/user/GetAllJobs',
        type: 'GET',
        success: function (response) {
            allJobs = response.data;
            renderJobs(allJobs);
            populateFilters(allJobs);
        },
        error: function (error) {
            console.error('Error fetching jobs:', error);

        }
    });

    // Apply filters
    $('#categoryFilter, #locationFilter, #jobTypeFilter').change(function () {
        filterJobs();
    });
});

function renderJobs(jobs) {     
    let jobsHtml = jobs.map(job => `
        <div class="job-card" data-category="${job.JobCategory}" data-location="${job.Location}" data-jobtype="${job.JobType}">
            <h3>${job.JobTitle}</h3>
            <p><strong>Description:</strong> ${job.Description}</p>
            <p><strong>Category:</strong> ${job.JobCategory}</p>
            <p><strong>Location:</strong> ${job.Location}</p>
            <p><strong>Job Type:</strong> ${job.JobType}</p>
            <p><strong>Salary:</strong> &#8377; ${job.Salary.toFixed(2)}</p> 
            <p><strong>Posted Date:</strong> ${new Date(job.PostedDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> ${new Date(job.EndDate).toLocaleDateString()}</p>
            <form method="POST" action="/user/job_details_view">
                <input type="hidden" name="JobId" value="${job.JobId}">
                <button type="submit" class="apply-btn" value="${job.JobId}">Apply</button>
            </form>
        </div>
    `).join('');
    $('#jobs-container').html(jobsHtml);
}

$(document).on('submit', 'form', function (e) {
    //alert("Do you want to submit");
    const jobId = $(this).find('input[name="JobId"]').val();
    sessionStorage.setItem('selectedJobId', jobId);  // Store JobId
});

function populateFilters(jobs) {
    let categories = [...new Set(jobs.map(job => job.JobCategory))];
    let locations = [...new Set(jobs.map(job => job.Location))];
    let jobTypes = [...new Set(jobs.map(job => job.JobType))];

    // Populate dropdown filters
    $('#categoryFilter').empty().append('<option value="">All Categories</option>')
        .append(categories.map(cat => `<option value="${cat}">${cat}</option>`));

    $('#locationFilter').empty().append('<option value="">All Locations</option>')
        .append(locations.map(loc => `<option value="${loc}">${loc}</option>`));

    $('#jobTypeFilter').empty().append('<option value="">All Job Types</option>')
        .append(jobTypes.map(type => `<option value="${type}">${type}</option>`));
}
