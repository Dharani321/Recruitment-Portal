$(document).ready(function () {
    fetchRecruitmentStats();
    fetchRecruitmentStats1();
    fetchRecruitmentJobStats();
    fetchRecruitmentInterviewStats();
    fetchRecruitmentHiredStats();
    fetchMonthlyRegistrations();
    fetchMonthlyRecruitmentStats(); 
    setInterval(fetchRecruitmentStats, 60000); // Auto-refresh every 60s

    //Total candidate card
    var candidateTable;

    $("#total_candidate").click(function () {
        console.log("Button Clicked! Initializing DataTable...");

        if (!$.fn.DataTable.isDataTable("#userTable")) {
            let index = 0;  // Track the current index
            let batchSize = 5;  // Number of users per batch
            let isFetching = false; // Prevent multiple requests

            let table = $("#userTable").DataTable({
                processing: true,
                serverSide: false,
                destroy: true, // Destroy old instance before reinitializing
                ajax: {
                    url: "/Admin/GetUsers2",
                    type: "GET",
                    dataType: "json",
                    dataSrc: function (response) {
                        console.log("API Response:", response);
                        return response.success ? response.data : [];
                    },
                    error: function (xhr, status, error) {
                        console.error("AJAX Error:", xhr, status, error);
                        alert("Failed to load data. Check console for details.");
                    }
                },
                columns: [
                    { data: "FirstName", title: "First Name" },
                    { data: "LastName", title: "Last Name" },
                    {
                        data: "Location",
                        title: "Location",
                        defaultContent: "N/A",
                        render: function (data) {
                            return data ? data : "N/A";
                        }
                    },
                    {
                        data: null,
                        title: "Actions",
                        orderable: false,
                        render: function (data, type, row) {
                            return `
                                <button class="btn btn-sm btn-primary edit-btn" 
                                    data-id="${row.UserId}" 
                                    data-firstname="${row.FirstName}" 
                                    data-lastname="${row.LastName}" 
                                    data-location="${row.Location}">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger delete-btn" data-id="${row.UserId}">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            `;
                        }
                    }
                ],
                pageLength: batchSize,
                lengthChange: false,
                searching: true,
                scrollY: "300px",
                scrollCollapse: true,
                responsive: true,
                language: {
                    emptyTable: "No candidates found",
                    loadingRecords: "Loading..."
                },
                createdRow: function (row, data, dataIndex) {
                    $(row).addClass("table-light");
                },
                initComplete: function () {
                    let data = table.rows().data().toArray();
                    table.clear().rows.add(data.slice(0, batchSize)).draw();
                    index = batchSize;
                }
            });

            // Move search bar to the right
            $(".dataTables_filter").addClass("text-end").css({
                "margin-bottom": "10px"
            });

            // Scroll Loader
            let tableContainer = $(".dataTables_scrollBody");
            let loadingSpinner = $("<div id='loadingSpinner' class='text-center mt-2' style='display: none;'><i class='fas fa-spinner fa-spin fa-2x text-primary'></i></div>");
            $("#userTable_wrapper").append(loadingSpinner);

            // Infinite Scroll Pagination
            tableContainer.on("scroll", function () {
                if (isFetching) return;
                if (tableContainer.scrollTop() + tableContainer.innerHeight() >= tableContainer[0].scrollHeight - 10) {
                    let totalRows = table.rows().data().length;
                    if (index >= totalRows) return;

                    isFetching = true;
                    loadingSpinner.show();

                    setTimeout(() => {
                        let nextBatch = table.rows().data().toArray().slice(index, index + batchSize);
                        table.rows.add(nextBatch).draw(false);
                        index += batchSize;

                        loadingSpinner.hide();
                        isFetching = false;
                    }, 1500);
                }
            });

            // Handle Edit & Delete Button Clicks
           

        } else {
            console.log("Reloading DataTable...");
            $("#userTable").DataTable().ajax.reload();
        }

        $("#userDetailsModal").modal("show");
    });


    // 🎯 Handle Edit Button Click
    $(document).on("click", ".edit-btn", function () {
        let userId = $(this).data("id");
        let firstName = $(this).data("firstname");
        let lastName = $(this).data("lastname");
        let location = $(this).data("location");

        // Populate Modal Fields
        $("#editUserId").val(userId);
        $("#editFirstName").val(firstName);
        $("#editLastName").val(lastName);
        $("#editLocation").val(location);

        $("#editUserModal").modal("show");
    });

    // 🎯 Save Edited Candidate
    $("#editUserForm").submit(function (e) {
        e.preventDefault();

        let formData = {
            UserId: $("#editUserId").val(),
            FirstName: $("#editFirstName").val(),
            LastName: $("#editLastName").val(),
            Location: $("#editLocation").val()
        };

        $.ajax({
            url: "/Admin/UpdateUser",
            type: "POST",
            data: formData,
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Success!",
                        text: "Candidate updated successfully!",
                        timer: 2000
                    }).then(() => {
                        $("#editUserModal").modal("hide");
                        $("#userTable").DataTable().ajax.reload();
                    });
                } else {
                    Swal.fire("Error", response.message, "error");
                }
            },
            error: function () {
                Swal.fire("Error", "Something went wrong. Please try again!", "error");
            }
        });
    });

    // 🎯 Handle Delete Button Click
    $(document).on("click", ".delete-btn", function () {
        let userId = $(this).data("id");

        Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this candidate!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "/Admin/DeleteUser",
                    type: "POST",
                    data: { UserId: userId },
                    success: function (response) {
                        if (response.success) {
                            Swal.fire("Deleted!", "Candidate has been deleted.", "success");
                            $("#userTable").DataTable().ajax.reload();
                        } else {
                            Swal.fire("Error", response.message, "error");
                        }
                    },
                    error: function () {
                        Swal.fire("Error", "Something went wrong. Please try again!", "error");
                    }
                });
            }
        });
    });
    });
    //Total candidate card
$("#active_jobs").click(function () {
    $.ajax({
        url: "/Admin/GetActiveJobs", // Ensure this matches the actual API route
        type: "GET",
        dataType: "json",
        success: function (response) {
            let tableBody = $("#job-details-body");
            tableBody.empty();

            if (response.success && response.data.length > 0) {
                response.data.forEach(function (job) {
                    let row = `
                        <tr>
                            <td>${job.JobTitle}</td>
                            <td>${job.CompanyName}</td>
                            <td>${job.Location || "N/A"}</td>
                            
                        </tr>
                    `;
                    tableBody.append(row);
                });
            } else {
                tableBody.append('<tr><td colspan="4" class="text-center">No active jobs found</td></tr>');
            }

            $("#jobDetailsModal").modal("show");
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", status, error);
            alert("Error fetching job postings. Please try again.");
        }
    });
});

    //Total candidate card
$("#Interview_schedule").click(function () {
    $.ajax({
        url: "/Admin/GetInterviewSchedules", // Ensure this matches the actual API route
        type: "GET",
        dataType: "json",
        success: function (response) {
            let tableBody = $("#interview-details-body");
            tableBody.empty();
            console.log(response);
            if (response.success && response.data.length > 0) {
                response.data.forEach(function (interview) {
                    let row = `
                        <tr>
                            <td>${interview.CandidateName}</td>
                            <td>${interview.JobTitle}</td>
                          
                            <td>${interview.InterviewTime}</td>
                           
                        </tr>
                    `;
                    tableBody.append(row);
                });
            } else {
                tableBody.append('<tr><td colspan="5" class="text-center">No scheduled interviews found</td></tr>');
            }

            $("#interviewDetailsModal").modal("show");
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", status, error);
            alert("Error fetching interview schedule. Please try again.");
        }
    });
});

    //Total candidate card
$("#hired_candidate").click(function () {
    $.ajax({
        url: "/Admin/GetHiredCandidates", // Make sure this matches your API endpoint
        type: "GET",
        dataType: "json",
        success: function (response) {
            let tableBody = $("#hired-candidates-body");
            tableBody.empty();

            if (response.success && response.data.length > 0) {
                response.data.forEach(function (candidate) {
                    let row = `
                        <tr>
                            <td>${candidate.CandidateName}</td>
                            <td>${candidate.JobTitle}</td>
                           
                        </tr>
                    `;
                    tableBody.append(row);
                });
            } else {
                tableBody.append('<tr><td colspan="4" class="text-center">No hired candidates found</td></tr>');
            }

            $("#hiredCandidatesModal").modal("show");
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", status, error);
            alert("Error fetching hired candidates. Please try again.");
        }
    });
});












google.charts.load('current', { packages: ['corechart', 'line'] });

google.charts.setOnLoadCallback(fetchMonthlyRecruitmentStats); // Call API first

function drawCalendarChart(monthlyData) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Month');
    data.addColumn('number', 'User Registrations 🧑‍💼');
    data.addColumn('number', 'Job Postings 📌');
    data.addColumn('number', 'Job Applications 📥');
    data.addColumn('number', 'Interviews Scheduled 🗓');
    data.addColumn('number', 'Candidates Hired ✅');

    let rows = monthlyData.map(item => [
        item.Month,
        item.UserRegistrations,
        item.JobPostings,
        item.JobApplications,
        item.InterviewsScheduled,
        item.CandidatesHired
    ]);

    data.addRows(rows); // Dynamically add data

    var options = {
        title: '📊 Monthly Recruitment Analytics',
        chartArea: { width: '85%', height: '70%' },
        hAxis: {
            title: 'Months',
            textStyle: { fontSize: 12, bold: true }
        },
        vAxis: {
            title: 'Count',
            minValue: 0,
            textStyle: { fontSize: 12, bold: true }
        },
        colors: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'],
        pointSize: 7,
        lineWidth: 3,
        legend: { position: 'bottom' },
        animation: {
            startup: true,
            duration: 800,
            easing: 'out'
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('calendar_chart'));
    chart.draw(data, options);
}

function fetchRecruitmentStats1() {
    $.ajax({
        url: '/Admin/GetRecruitmentStats1',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            console.log("Recruitment Stats API Response:", response.data); // Debugging

            if (response.success && response.data) {
                let total = response.data.TotalCandidates || 0;
                let interviews = response.data.InterviewsScheduled || 0;
                let hired = response.data.HiredCandidates || 0;

                $("#totalCandidates").text(total);
                $("#interviewsScheduled").text(interviews);
                $("#hiredCandidates").text(hired);

                renderRecruitmentOverviewChart1(total, interviews, hired);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching recruitment stats:", error);
        }
    });
}

function renderRecruitmentOverviewChart1(totalCandidates, interviewsScheduled, hiredCandidates) {
    const ctx = document.getElementById('recruitmentOverviewChart').getContext('2d');

    // Destroy old chart instance if exists
    if (window.recruitmentOverviewChartInstance) {
        window.recruitmentOverviewChartInstance.destroy();
    }

    const dataValues = [totalCandidates, interviewsScheduled, hiredCandidates];
    const dataLabels = ['Total Candidates', 'Interviews Scheduled', 'Hired Candidates'];
    const colors = ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)'];

    // Remove zero values to avoid empty sections
    const filteredData = dataValues.filter(value => value > 0);
    const filteredLabels = dataLabels.filter((_, index) => dataValues[index] > 0);
    const filteredColors = colors.filter((_, index) => dataValues[index] > 0);

    window.recruitmentOverviewChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: filteredLabels,
            datasets: [{
                data: filteredData,
                backgroundColor: filteredColors,
                borderColor: filteredColors.map(color => color.replace("0.7", "1")),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 14 } } },
                tooltip: { callbacks: { label: (tooltipItem) => tooltipItem.label + ': ' + tooltipItem.raw } }
            },
            animation: { animateScale: true, animateRotate: true }
        }
    });
}

function fetchRecruitmentStats() {
    $.ajax({
        url: '/Admin/GetRecruitmentStats',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success && response.data) {
                $("#totalCandidates").text(response.data.TotalCandidates || 0);
                $("#interviewsScheduled").text(response.data.InterviewsScheduled || 0);
                $("#hiredCandidates").text(response.data.HiredCandidates || 0);
                renderRecruitmentOverviewChart(response.data.TotalCandidates, response.data.InterviewsScheduled, response.data.HiredCandidates);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching recruitment stats:", error);
        }
    });
}

function fetchRecruitmentJobStats() {
    $.ajax({
        url: '/Admin/GetActiveStats',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success && response.data) {
                $("#activeJobs").text(response.data.ActiveJobs || 0);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching active jobs stats:", error);
        }
    });
}

function fetchRecruitmentInterviewStats() {
    $.ajax({
        url: '/Admin/GetInterviewStats',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success && response.data) {
                $("#interviewsScheduled").text(response.data.InterviewsScheduled || 0);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching interview stats:", error);
        }
    });
}

function fetchRecruitmentHiredStats() {
    $.ajax({
        url: '/Admin/GetHiredStats',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success && response.data) {
                $("#hiredCandidates").text(response.data.HiredCandidates || 0);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching hired candidates stats:", error);
        }
    });
}

function fetchMonthlyRegistrations() {
    $.ajax({
        url: '/Admin/GetMonthlyRegistrations',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            renderRegistrationsChart(data.data);
        },
        error: function (xhr, status, error) {
            console.error("Error fetching monthly registrations:", error);
        }
    });
}

function renderRegistrationsChart(monthlyData) {
    const ctx = document.getElementById('registrationsChart').getContext('2d');
    if (window.registrationsChartInstance) {
        window.registrationsChartInstance.destroy();
    }
    const labels = monthlyData.map(item => `${item.Year}-${item.Month}`);
    const counts = monthlyData.map(item => item.Count);
    window.registrationsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Registrations',
                data: counts,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function renderRecruitmentOverviewChart(totalCandidates, interviewsScheduled, hiredCandidates) {
    const ctx = document.getElementById('recruitmentOverviewChart').getContext('2d');
    if (window.recruitmentOverviewChartInstance) {
        window.recruitmentOverviewChartInstance.destroy();
    }
    window.recruitmentOverviewChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Total Candidates', 'Interviews Scheduled', 'Hired Candidates'],
            datasets: [{
                data: [totalCandidates, interviewsScheduled, hiredCandidates],
                backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 14 } } },
                tooltip: { callbacks: { label: (tooltipItem) => tooltipItem.label + ': ' + tooltipItem.raw } }
            },
            animation: { animateScale: true, animateRotate: true }
        }
    });




}

//calender chart for fetch monthly data dynamically


function fetchMonthlyRecruitmentStats() {
    $.ajax({
        url: '/Admin/GetMonthlyRecruitmentStats', // API endpoint that executes the stored procedure
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            
            if (response.success && response.data) {
                drawCalendarChart(response.data); // Pass dynamic data to the function
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching recruitment stats:", error);
        }
    });
}

