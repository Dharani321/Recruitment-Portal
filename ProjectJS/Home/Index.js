console.log("-----------------------------User--------------------------")
let user1 = JSON.parse(sessionStorage.getItem("user"));
console.log(user1);

// Save data to local storage


// Retrieve data from local storage
console.log("Retrieve data from local storage");
let user2 = JSON.parse(localStorage.getItem("userdetails"));

console.log(user2);

console.log("****************************Admin*****************************")

console.log("session:");
let admin22 = JSON.parse(sessionStorage.getItem("admin"));
console.log(admin22);
console.log("localstorage:");
let admin12 = JSON.parse(localStorage.getItem("admindetails"));

console.log(admin12);


document.addEventListener("DOMContentLoaded", function () {

  

    let currentPage = 1;
    const pageSize = 3;
    let totalJobs = 0;

    const jobList = document.getElementById('jobList');
    const jobCharacter = document.getElementById('characterImage');
    const jobContainer = document.querySelector('.job-list');

    const characterImages = [
        '/wwwroot/CustomImages/Job1.png',
        '/wwwroot/CustomImages/Job2.png',
        '/wwwroot/CustomImages/Job3.png',
        '/wwwroot/CustomImages/Job4.png'
    ];

    function fetchJobs(page) {
        fetch(`/Home/GetJobPostingsJson?page=${page}&size=${pageSize}`)
            .then(response => response.json())
            .then(data => {
                totalJobs = data.totalJobs;
                displayJobs(data.jobs);
            })
            .catch(error => console.error('Error fetching jobs:', error));
    }

    function displayJobs(jobs) {
        jobList.innerHTML = '';

        jobs.forEach(job => {
            const jobCard = `
                <div class="col-md-4">
                    <div class="card h-100 pop-in">
                        <div class="card-body">
                            <h5 class="card-title">${job.JobTitle}</h5>
                            <p class="card-text">${job.JobDescription}</p>
                            <p class="text-muted">${job.Location}</p>
                            <p class="text-muted">&#8377; ${job.Salary}</p>
                            <a href="#" class="btn btn-primary apply-btn">Apply Now</a>
                        </div>
                    </div>
                </div>
            `;
            jobList.innerHTML += jobCard;
        });
    }

    function updateCharacterImage() {
        if (jobCharacter) {
            let index = (currentPage - 1) % characterImages.length;
            jobCharacter.src = characterImages[index];
        }
    }

    window.nextJobs = function () {
        const maxPage = Math.ceil(totalJobs / pageSize);
        if (currentPage < maxPage) {
            currentPage++;
            fetchJobs(currentPage);
            updateCharacterImage();
            smoothScroll(1);
        }
    };

    window.prevJobs = function () {
        if (currentPage > 1) {
            currentPage--;
            fetchJobs(currentPage);
            updateCharacterImage();
            smoothScroll(-1);
        }
    };

    function smoothScroll(direction) {
        const card = jobContainer.querySelector('.card');
        if (card) {
            const cardWidth = card.offsetWidth + 15;
            jobContainer.scrollBy({
                left: direction * cardWidth * 3,
                behavior: 'smooth'
            });
        }
    }

    document.addEventListener('scroll', function () {
        if (jobCharacter && window.scrollY >= document.querySelector('.job-section').offsetTop - window.innerHeight) {
            jobCharacter.classList.add('pop-in');
            document.querySelectorAll('.card').forEach((card, index) => {
                setTimeout(() => card.classList.add('pop-in'), index * 200);
            });
        }
    });

    fetchJobs(currentPage);
});



//document.querySelector('.css-u74ql7').addEventListener('click', function () {
//    const searchInput = document.querySelector('.Navbar_search input'); // Assuming there's an input field
//    const query = searchInput ? searchInput.value.trim() : '';

//    if (query === '') {
//        alert('Please enter a search term!');
//        return;
//    }

//    // Simulating a search operation (Replace with actual logic)
//    console.log(`Searching for: ${query}`);

//    // Example: Redirecting to a search results page
//    window.location.href = `/search?query=${encodeURIComponent(query)}`;
//});

//About script rendering 

document.addEventListener("DOMContentLoaded", function () {
    const aboutSection = document.getElementById("about-section");

    function revealSection() {
        const sectionPos = aboutSection.getBoundingClientRect().top;
        const screenPos = window.innerHeight / 1.3;

        if (sectionPos < screenPos) {
            aboutSection.classList.add("visible");
        }
    }

    window.addEventListener("scroll", revealSection);
});








