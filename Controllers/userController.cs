using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Recruitment_Portal.Models;
using System.Web.Security;


namespace Recruitment_Portal.Controllers
{
    public class userController : Controller
    {
        //connection string

        string connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;


        // GET: User Registration Page


        [HttpPost]
        public JsonResult Save_user(UserRegistration user, HttpPostedFileBase file)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    string filePath = null;
                    string savePath = null;

                    // Save uploaded file to a folder
                    if (file != null && file.ContentLength > 0)
                    {
                        string folderPath = Server.MapPath("~/UploadedFiles/");
                        if (!Directory.Exists(folderPath))
                        {
                            Directory.CreateDirectory(folderPath);
                        }

                        string fileName = Path.GetFileName(file.FileName);
                        filePath = Path.Combine(folderPath, fileName);
                        file.SaveAs(filePath);

                        // Store relative path for database
                        savePath = "/UploadedFiles/" + fileName;
                    }

                    // Save user data to the database using stored procedure
                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        using (SqlCommand cmd = new SqlCommand("SaveUser12", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;

                            cmd.Parameters.AddWithValue("@FirstName", user.FirstName);
                            cmd.Parameters.AddWithValue("@LastName", user.LastName);
                            cmd.Parameters.AddWithValue("@PhoneNumber", user.PhoneNumber);
                            cmd.Parameters.AddWithValue("@Email", user.Email);
                            cmd.Parameters.AddWithValue("@Password", user.Password);
                            cmd.Parameters.AddWithValue("@ProfilePicture", savePath);

                            conn.Open();
                            cmd.ExecuteNonQuery();
                        }
                    }

                    // Redirect to Home/Index page with query parameter to show the modal
                    return Json(new { success = true, redirectUrl = "/Home/Index?showModal=true" });
                }
                catch (Exception ex)
                {
                    // Log error
                    System.Diagnostics.Debug.WriteLine("Error: " + ex.Message);
                    return Json(new { success = false, message = "Error: " + ex.Message });
                }
            }

            return Json(new { success = false, message = "Invalid model state!" });
        }














        // for user Login
        //made auth cookies for storing the userid and also made session storage for the same using anyway . 

        public JsonResult Find_User(user_login login)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

                using (SqlConnection con = new SqlConnection(connectionString))
                {
                    con.Open();

                    using (SqlCommand cmd = new SqlCommand("sp_AuthenticateUser", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@Email", login.Email);
                        cmd.Parameters.AddWithValue("@Password", login.Password);

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read()) // If user exists
                            {
                                var userDetails = new
                                {
                                    UserId = reader["UserId"].ToString(),
                                    FirstName = reader["FirstName"].ToString(),
                                    LastName = reader["LastName"].ToString(),
                                    PhoneNumber = reader["PhoneNumber"].ToString(),
                                    Email = reader["Email"].ToString(),
                                    ProfilePicture = reader["ProfilePicture"].ToString()
                                };

                                //session for storing the id
                                Session["UserId"] = userDetails.UserId;

                               //setting up auth cookie 
                                FormsAuthentication.SetAuthCookie(login.Email, true);

                                //  Storing UserId in Cookie 
                                HttpCookie userIdCookie = new HttpCookie("UserId", userDetails.UserId)
                                {
                                    Expires = DateTime.Now.AddDays(2), // Cookie expires in 2 days
                                    Path = "/",
                                    HttpOnly = true
                                };
                                Response.Cookies.Add(userIdCookie);

                                // Authentication flag Cookie
                                HttpCookie authCookie = new HttpCookie("UserAuth", "true")
                                {
                                    Expires = DateTime.Now.AddDays(2),
                                    Path = "/",
                                    HttpOnly = false,
                                    SameSite = SameSiteMode.None
                                };
                                Response.Cookies.Add(authCookie);

                                return Json(new { success = true, message = "Login Successful", data = userDetails }, JsonRequestBehavior.AllowGet);
                            }
                            else
                            {
                                return Json(new { success = false, message = "Invalid Email or Password" }, JsonRequestBehavior.AllowGet);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" }, JsonRequestBehavior.AllowGet);
            }
        }



        //For getting the UserId 
        private int GetCurrentUserId()
        {
            // Check for user ID in session
            if (Session["UserId"] != null && int.TryParse(Session["UserId"].ToString(), out int SessionuserId))
            {
                return SessionuserId;
            }


            // Alternatively, check for user ID in cookies
            HttpCookie userIdCookie = Request.Cookies["UserId"];
            if (userIdCookie != null && int.TryParse(userIdCookie.Value, out int userId))
            {
                return userId;
            }

            return 0; // User not logged in
        }




        // -----------------------------------------------------------to be managed -------------------------------------------------------//


        //UPDATING RESUME INSIDE THE JOBAPPLY TABLE 

        [HttpPost]
        public ActionResult UploadResume(HttpPostedFileBase resume)
        {
            try
            {
                string savePath = string.Empty; // Variable to store the relative path
                if (resume != null && resume.ContentLength > 0)
                {
                    string folderPath = Server.MapPath("~/UploadedFiles/Resumes/");
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }

                    string fileName = Path.GetFileName(resume.FileName);
                    string filePath = Path.Combine(folderPath, fileName);
                    resume.SaveAs(filePath); // Save the file to the server

                    // Store relative path for the database
                    savePath = "/UploadedFiles/Resumes/" + fileName;
                }
                else
                {
                    return Json(new { success = false, message = "No file uploaded" });
                }

                // Get the userId 
                int userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return Json(new { success = false, message = "User not logged in" });
                }

                string connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // First, insert the user Id if they don't exist
                    using (SqlCommand insertCommand = new SqlCommand("InsertUserDetails", connection))
                    {
                        insertCommand.CommandType = CommandType.StoredProcedure;
                        insertCommand.Parameters.AddWithValue("@UserId", userId);
                        insertCommand.ExecuteNonQuery();
                    }
                     
                    // Then, update the resume upload for the user
                    using (SqlCommand updateCommand = new SqlCommand("UploadResume", connection))
                    {
                        updateCommand.CommandType = CommandType.StoredProcedure;
                        updateCommand.Parameters.AddWithValue("@UserId", userId);
                        updateCommand.Parameters.AddWithValue("@Resume_Upload", savePath); // Use the relative path for the database
                        updateCommand.ExecuteNonQuery();
                    }
                }

                return Json(new { success = true, message = "Resume uploaded successfully", fileName = Path.GetFileName(resume.FileName) });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }


        //SAVE QUALIFICATION using a new table -- UserDetails 

        [HttpPost]
        public JsonResult SaveQualification(string qualification, HttpPostedFileBase certFile)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    string filePath = null;

                    if (certFile != null && certFile.ContentLength > 0)
                    {
                        string folderPath = Server.MapPath("~/UploadedFiles/Certificates/");
                        if (!System.IO.Directory.Exists(folderPath))
                        {
                            System.IO.Directory.CreateDirectory(folderPath);
                        }

                        string fileName = System.IO.Path.GetFileName(certFile.FileName);
                        filePath = System.IO.Path.Combine(folderPath, fileName);
                        certFile.SaveAs(filePath);
                    }

                    // Get the userId 
                    int userId = GetCurrentUserId();
                    if (userId == 0)
                    {
                        return Json(new { success = false, message = "User not logged in" });
                    }

                    string connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        conn.Open();

                        // First, insert user details if they don't exist
                        using (SqlCommand insertCommand = new SqlCommand("InsertUserDetails", conn))
                        {
                            insertCommand.CommandType = CommandType.StoredProcedure;
                            insertCommand.Parameters.AddWithValue("@UserId", userId);
                            insertCommand.ExecuteNonQuery();
                        }

                        // Then, execute the stored procedure to save the qualification
                        using (SqlCommand cmd = new SqlCommand("SaveQualification", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.AddWithValue("@Qualification", qualification);
                            cmd.Parameters.AddWithValue("@CertFilePath", filePath); // Store the file path
                            cmd.Parameters.AddWithValue("@UserId", userId); // Use the session userId

                            cmd.ExecuteNonQuery();
                        }
                    }

                    return Json(new { success = true, message = "Qualification saved successfully." });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = "Error: " + ex.Message });
                }
            }

            return Json(new { success = false, message = "Invalid input data!" });
        }



        // job preferences save

        [HttpPost]
        public JsonResult SaveJobPreferences(string industry, string role)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    int userId = Session["UserId"] != null ? (int)Session["UserId"] : 0;
                    if (userId == 0)
                    {
                        return Json(new { success = false, message = "User not logged in" });
                    }

                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        conn.Open();

                        using (SqlCommand insertCommand = new SqlCommand("InsertUserDetails", conn))
                        {
                            insertCommand.CommandType = CommandType.StoredProcedure;
                            insertCommand.Parameters.AddWithValue("@UserId", userId);
                            insertCommand.ExecuteNonQuery();
                        }

                        using (SqlCommand cmd = new SqlCommand("SaveJobPreferences", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.AddWithValue("@Industry", industry);
                            cmd.Parameters.AddWithValue("@Role", role);
                            cmd.Parameters.AddWithValue("@UserId", userId);

                            cmd.ExecuteNonQuery();
                        }
                    }

                    return Json(new { success = true, message = "Job preferences saved successfully." });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = "Error: " + ex.Message });
                }
            }

            return Json(new { success = false, message = "Invalid input data!" });
        }



        // Method to get the bookmarks and remove them 

        [HttpPost]
        public JsonResult RemoveBookmark(string job)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    int userId = Session["UserId"] != null ? (int)Session["UserId"] : 0;
                    if (userId == 0)
                    {
                        return Json(new { success = false, message = "User not logged in" });
                    }

                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        conn.Open();

                        using (SqlCommand insertCommand = new SqlCommand("InsertUserDetails", conn))
                        {
                            insertCommand.CommandType = CommandType.StoredProcedure;
                            insertCommand.Parameters.AddWithValue("@UserId", userId);
                            insertCommand.ExecuteNonQuery();
                        }

                        using (SqlCommand cmd = new SqlCommand("RemoveBookmark", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.AddWithValue("@Job", job);
                            cmd.Parameters.AddWithValue("@UserId", userId);

                            cmd.ExecuteNonQuery();
                        }
                    }

                    return Json(new { success = true, message = "Bookmark removed successfully." });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = "Error: " + ex.Message });
                }
            }

            return Json(new { success = false, message = "Invalid input data!" });
        }


        // ----------------------------------------------------------- to be managed -------------------------------------------------------- //


























        public JsonResult GetAllJobs()
        {
            var jobs = new List<AllJob>();

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = "SELECT *  FROM JobPostings"; // Ensure correct columns
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        conn.Open();
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                jobs.Add(new AllJob
                                {
                                    JobId = Convert.ToInt32(reader["JobId"]),
                                    JobTitle = reader["JobTitle"].ToString(),
                                    Location = reader["Location"].ToString(),
                                    JobType = reader["JobType"].ToString(),
                                    Experience = reader["Experience"].ToString(),
                                    PostedDate = Convert.ToDateTime(reader["PostedDate"]),
                                    EndDate = Convert.ToDateTime(reader["EndDate"]),

                                    Description = reader["Description"].ToString(),
                                    JobCategory = reader["JobCategory"].ToString(),
                                    Salary = Convert.ToDecimal(reader["Salary"]),


                                });
                            }
                        }
                    }
                }

                return Json(new { success = true, message = "Fetched Successfully", data = jobs }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" }, JsonRequestBehavior.AllowGet);
            }
        }



        public JsonResult SearchJobs(string keywords, string location)
        {
            var jobs = new List<AllJob>();

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                // Updated query to use matching column names based on the properties of AllJob
                string query = "SELECT * FROM JobPostings WHERE JobTitle LIKE @Keywords OR Location LIKE @Location";
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Keywords", keywords);
                    cmd.Parameters.AddWithValue("@Location", location);

                    conn.Open();
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            jobs.Add(new AllJob
                            {
                                JobId = Convert.ToInt32(reader["JobId"]),
                                JobTitle = reader["JobTitle"].ToString(),
                                CompanyName = reader["CompanyName"].ToString(),
                                // Removed extra space before "Location"
                                Location = reader["Location"].ToString(),
                                JobType = reader["JobType"].ToString(),
                                Experience = reader["Experience"].ToString(),
                                PostedDate = Convert.ToDateTime(reader["PostedDate"]),
                                EndDate = Convert.ToDateTime(reader["EndDate"]),
                                Description = reader["Description"].ToString(),
                                JobCategory = reader["JobCategory"].ToString(),
                                Salary = Convert.ToDecimal(reader["Salary"]),
                                ApplyLink = reader["ApplyLink"].ToString(),
                            });
                        }
                    }
                }
            }

            return Json(new { data = jobs }, JsonRequestBehavior.AllowGet);
        }


        // GET: Job/Details/5
        [HttpPost]
        public JsonResult JobDetails(int JobId)
        {
            try
            {
                AllJob job = null;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    string query = "SELECT * FROM JobPostings WHERE JobId = @JobId";
                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@JobId", JobId);
                        conn.Open();
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                job = new AllJob
                                {
                                    JobId = reader["JobId"] != DBNull.Value ? Convert.ToInt32(reader["JobId"]) : 0,
                                    JobTitle = reader["JobTitle"]?.ToString() ?? "N/A",
                                    CompanyName = reader["CompanyName"]?.ToString() ?? "N/A",
                                    Location = reader["Location"]?.ToString() ?? "N/A",
                                    JobType = reader["JobType"]?.ToString() ?? "N/A",
                                    Experience = reader["Experience"]?.ToString() ?? "N/A",
                                    PostedDate = reader["PostedDate"] != DBNull.Value ? Convert.ToDateTime(reader["PostedDate"]) : DateTime.MinValue,
                                    EndDate = reader["EndDate"] != DBNull.Value ? Convert.ToDateTime(reader["EndDate"]) : DateTime.MinValue,
                                    Description = reader["Description"]?.ToString() ?? "N/A",
                                    JobCategory = reader["JobCategory"]?.ToString() ?? "N/A",
                                    ApplyLink = reader["ApplyLink"]?.ToString() ?? "#",
                                    Salary = reader["Salary"] != DBNull.Value ? Convert.ToDecimal(reader["Salary"]) : 0,
                                    UserId = reader["UserId"] != DBNull.Value ? Convert.ToInt32(reader["UserId"]) : 0,
                                    AdminId = reader["AdminId"] != DBNull.Value ? Convert.ToInt32(reader["AdminId"]) : 0
                                };
                            }
                        }
                    }
                }

                return Json(new { success = true, data = job }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }






       

        


        [HttpPost]
        public JsonResult SaveJobData(Create CJ)
        {
            try
            {
                // Insert data into the database
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string query = "INSERT INTO JobPostings (JobTitle, Location, JobType, Salary, Experience, EndDate, Description, JobCategory, Adminid, PostedDate) " +
                "VALUES (@JobTitle, @Location, @JobType, @Salary, @Experience, @EndDate, @Description, @JobCategory, @Adminid, GETDATE())";

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        // Add parameters to the SQL command
                        cmd.Parameters.AddWithValue("@JobTitle", CJ.JobTitle);
                        cmd.Parameters.AddWithValue("@Location", CJ.Location);
                        cmd.Parameters.AddWithValue("@JobType", CJ.JobType);
                        cmd.Parameters.AddWithValue("@Salary", CJ.Salary);
                        cmd.Parameters.AddWithValue("@Experience", CJ.Experience);
                        cmd.Parameters.AddWithValue("@EndDate", CJ.EndDate);
                        cmd.Parameters.AddWithValue("@Description", CJ.Description);
                        cmd.Parameters.AddWithValue("@JobCategory", CJ.JobCategory);
                        cmd.Parameters.AddWithValue("@Adminid", CJ.AdminId);

                        // Execute the command
                        cmd.ExecuteNonQuery();
                    }
                }

                return Json(new { success = true, message = "Job data saved successfully!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }










        //For submitting Job application


        [HttpPost]
        public JsonResult SubmitApplication(UserApplication model, HttpPostedFileBase ResumeUpload)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    string filePath = null;
                    string savePath = null;

                    // Handle file upload
                    if (ResumeUpload != null && ResumeUpload.ContentLength > 0)
                    {
                        string folderPath = Server.MapPath("~/UploadedFiles/Resumes/");
                        if (!Directory.Exists(folderPath))
                        {
                            Directory.CreateDirectory(folderPath);
                        }

                        string fileName = Path.GetFileName(ResumeUpload.FileName);
                        filePath = Path.Combine(folderPath, fileName);
                        ResumeUpload.SaveAs(filePath);

                        // Store relative path for database
                        savePath = "/UploadedFiles/Resumes/" + fileName;
                    }

                    // Save application data to the database
                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        using (SqlCommand cmd = new SqlCommand("SaveUserApplication", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.AddWithValue("@JobId", model.JobId);
                            cmd.Parameters.AddWithValue("@UserId", model.UserId);
                            cmd.Parameters.AddWithValue("@Experience", model.Experience);
                            cmd.Parameters.AddWithValue("@EducationalDetails", model.EducationalDetails);
                            cmd.Parameters.AddWithValue("@ResumePath", savePath);

                            conn.Open();
                            cmd.ExecuteNonQuery();
                        }
                    }

                    return Json(new { success = true, message = "Application submitted successfully!" });
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Error: " + ex.Message);
                    return Json(new { success = false, message = "Error: " + ex.Message });
                }
            }

            return Json(new { success = false, message = "Invalid model state!" });
        }


        //For updating user details

        [HttpPost]
        public JsonResult UpdateAccount(UpdateUserModel model, HttpPostedFileBase ProfilePicture)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    string filePath = null;
                    string savePath = null;

                    // Handle profile picture upload
                    if (ProfilePicture != null && ProfilePicture.ContentLength > 0)
                    {
                        string folderPath = Server.MapPath("~/UploadedFiles/");
                        if (!Directory.Exists(folderPath))
                        {
                            Directory.CreateDirectory(folderPath);
                        }

                        string fileName = Path.GetFileName(ProfilePicture.FileName);
                        filePath = Path.Combine(folderPath, fileName);
                        ProfilePicture.SaveAs(filePath);

                        // Store relative path for database
                        savePath = "/UploadedFiles/" + fileName;
                    }

                    // Save user details to the database
                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        using (SqlCommand cmd = new SqlCommand("UpdateUserDetails", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.AddWithValue("@UserId", model.UserId);
                            cmd.Parameters.AddWithValue("@FirstName", model.FirstName);
                            cmd.Parameters.AddWithValue("@LastName", model.LastName);
                            cmd.Parameters.AddWithValue("@PhoneNumber", model.PhoneNumber);
                            cmd.Parameters.AddWithValue("@Email", model.Email);
                            cmd.Parameters.AddWithValue("@Password", model.Password); // Consider encrypting before saving
                            cmd.Parameters.AddWithValue("@ProfilePicture", savePath ?? (object)DBNull.Value);

                            conn.Open();
                            cmd.ExecuteNonQuery();
                        }
                    }

                    // Create updated user data object
                    var updatedUser1 = new
                    {
                        UserId = model.UserId,
                        FirstName = model.FirstName,
                        LastName = model.LastName,
                        PhoneNumber = model.PhoneNumber,
                        Email = model.Email,
                        ProfilePicture = savePath
                    };

                    return Json(new { success = true, data = updatedUser1, message = "Account updated successfully!" });
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Error: " + ex.Message);
                    return Json(new { success = false, message = "Error: " + ex.Message });
                }
            }

            return Json(new { success = false, message = "Invalid model state!" });
        }

        [HttpGet]
        public JsonResult GetUserDetails(int userId)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("SELECT * FROM Users WHERE UserId=@UserId", conn))
                    {
                        cmd.CommandType = CommandType.Text; 
                       cmd.Parameters.AddWithValue("@UserId", userId);

                        conn.Open();
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                var user = new
                                {
                                    UserId = reader["UserId"],
                                    FirstName = reader["FirstName"].ToString(),
                                    LastName = reader["LastName"].ToString(),
                                    PhoneNumber = reader["PhoneNumber"].ToString(),
                                    Email = reader["Email"].ToString(),
                                    Password = reader["Password"].ToString(),
                                    ProfilePicture = reader["ProfilePicture"].ToString()
                                };

                                return Json(new { success = true, data = user }, JsonRequestBehavior.AllowGet);
                            }
                        }
                    }
                }

                return Json(new { success = false, message = "User not found" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error: " + ex.Message);
                return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        // For last login store

        [HttpPost]
        public JsonResult UpdateLastLogin(int userId,DateTime lastlogin)
        {
            try
            {
                //DateTime lastLoginTime = DateTime.UtcNow; // Use UtcNow to store consistent timestamps

                // Save last login timestamp in database
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("UpdateLastLogin", conn)) // Name of the stored procedure
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@UserId", userId);
                        cmd.Parameters.AddWithValue("@LastLogin", lastlogin);

                        conn.Open();
                        cmd.ExecuteNonQuery();
                    }
                }

                // Return success response
                return Json(new { success = true, message = "Last login updated successfully!", lastLogin = lastlogin });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error updating last login: " + ex.Message);
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }


        // common login

        [HttpPost]
        public JsonResult Common_Login(commonlogin login)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

                using (SqlConnection con = new SqlConnection(connectionString))
                {
                    con.Open();

                    // Select from Admins or Users based on login type
                    string query = "";
                    if (login.LoginType.ToLower() == "admin")
                    {
                        query = "SELECT * FROM Admins WHERE Email = @Email AND Password = @Password ";
                    }
                    else
                    {
                        query = "SELECT * FROM Users WHERE Email = @Email AND Password = @Password";
                    }

                    using (SqlCommand cmd = new SqlCommand(query, con))
                    {
                        cmd.Parameters.AddWithValue("@Email", login.Email);
                        cmd.Parameters.AddWithValue("@Password", login.Password);

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read()) // If user/admin exists
                            {
                                object userDetails = null;

                                if (login.LoginType.ToLower() == "admin")
                                {
                                    userDetails = new
                                    {
                                        AdminId = reader["AdminId"].ToString(),
                                        FirstName = reader["FirstName"].ToString(),
                                        LastName = reader["LastName"].ToString(),
                                        RoleType = reader["RoleType"].ToString(),
                                        CreatedDate = Convert.ToDateTime(reader["CreatedDate"]).ToString("yyyy-MM-dd HH:mm:ss"),
                                        Email = reader["Email"].ToString(),
                                        DateOfBirth = Convert.ToDateTime(reader["DateOfBirth"]).ToString("yyyy-MM-dd"),
                                        ImagePath = reader["ImagePath"].ToString(),
                                        IsActive = Convert.ToBoolean(reader["IsActive"]),
                                        LoginType = login.LoginType
                                    };
                                }
                                else
                                {
                                    userDetails = new
                                    {
                                        UserId = reader["UserId"].ToString(),
                                        FirstName = reader["FirstName"].ToString(),
                                        LastName = reader["LastName"].ToString(),
                                        PhoneNumber = reader["PhoneNumber"].ToString(),
                                        Email = reader["Email"].ToString(),
                                        ProfilePicture = reader["ProfilePicture"].ToString(),
                                        DateUpdated = Convert.ToDateTime(reader["DateUpdated"]).ToString("yyyy-MM-dd HH:mm:ss"),
                                        DateCreated = Convert.ToDateTime(reader["DateCreated"]).ToString("yyyy-MM-dd HH:mm:ss"),
                                        LastLogin = reader["LastLogin"] != DBNull.Value ? Convert.ToDateTime(reader["LastLogin"]).ToString("yyyy-MM-dd HH:mm:ss") : null,
                                        LoginType = login.LoginType
                                    };

                                    // Update Last Login Time for User
                                    UpdateLastLogin(Convert.ToInt32(reader["UserId"]));
                                }

                                return Json(new { success = true, message = "Login Successful", data = userDetails }, JsonRequestBehavior.AllowGet);
                            }
                            else
                            {
                                return Json(new { success = false, message = "Invalid Email or Password" }, JsonRequestBehavior.AllowGet);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" }, JsonRequestBehavior.AllowGet);
            }
        }

        // Method to update the last login timestamp for users
        private void UpdateLastLogin(int userId)
        {
            try
            {
                string connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

                using (SqlConnection con = new SqlConnection(connectionString))
                {
                    con.Open();
                    string query = "UPDATE Users SET LastLogin = @LastLogin WHERE UserId = @UserId";

                    using (SqlCommand cmd = new SqlCommand(query, con))
                    {
                        cmd.Parameters.AddWithValue("@UserId", userId);
                        cmd.Parameters.AddWithValue("@LastLogin", DateTime.Now);

                        cmd.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error updating last login: " + ex.Message);
            }
        }


        //submit feedback


        [HttpPost]
        public JsonResult SubmitFeedback(Feedback model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        using (SqlCommand cmd = new SqlCommand("SaveUserFeedback", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                           
                            cmd.Parameters.AddWithValue("@UserId", model.UserId);
                            cmd.Parameters.AddWithValue("@Rating", model.Rating);
                            cmd.Parameters.AddWithValue("@Comment", model.Comment);

                            conn.Open();
                            cmd.ExecuteNonQuery();
                        }
                    }

                    return Json(new { success = true, message = "Feedback submitted successfully!" });
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Error: " + ex.Message);
                    return Json(new { success = false, message = "Error: " + ex.Message });
                }
            }

            return Json(new { success = false, message = "Invalid model state!" });
        }

        







        // All Views 


        public new ActionResult Profile()
        {
            return View();
        }

        public ActionResult Alljobs()
        {
            return View();
        }

        public ActionResult job_details_view()
        {
            return View();
        }

        public ActionResult common_login()
        {
            return View();
        }

        public ActionResult ManageAccount()
        {
            return View();
        }

        //From Recruitment controller

        public ActionResult Create()
        {
            return View();
        }

        public ActionResult login()
        {
            return View();
        }

        public ActionResult Signup()
        {
            return View();
        }



        public ActionResult ApplicationForm()
        {
            return View();
        }


        [Authorize]
        public ActionResult user_dashboard()
        {
            return View();
        }



    }
}

