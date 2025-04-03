using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Recruitment_Portal.Models;
using Recruitment_Portal.Models.Admin;
using static System.Net.Mime.MediaTypeNames;
using System.Text.RegularExpressions;

namespace Recruitment_Portal.Controllers
{
   
    public class AdminController : Controller
    {

        //Connection String
        
        private string connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;


        //Adding a session function for admin
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (Session["AdminEmail"] == null &&
                filterContext.ActionDescriptor.ActionName != "AdminLogin" &&
                filterContext.ActionDescriptor.ActionName != "AdminSignup") 
            {
                filterContext.Result = RedirectToAction("AdminLogin", "Admin");
            }
            base.OnActionExecuting(filterContext);
        }



        [HttpPost]
        [Route("AdminSignup")]
        public JsonResult AdminSignup(Admin admin, HttpPostedFileBase ProfileImage)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine("AdminSignup method hit.");

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors)
                                                   .Select(e => e.ErrorMessage)
                                                   .ToList();
                    return Json(new { success = false, errors });
                }

                string imagePath = string.Empty;

                if (ProfileImage != null && ProfileImage.ContentLength > 0)
                {
                    string folderPath = Server.MapPath("~/UploadedImages/Admins/");
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }

                    string fileExtension = Path.GetExtension(ProfileImage.FileName);
                    string uniqueFileName = Guid.NewGuid().ToString() + fileExtension;  // Avoid duplicate names
                    string filePath = Path.Combine(folderPath, uniqueFileName);
                    ProfileImage.SaveAs(filePath);

                    imagePath = "/UploadedImages/Admins/" + uniqueFileName;
                }

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Check if email already exists
                    string checkEmailQuery = "SELECT COUNT(*) FROM Admins WHERE Email = @Email";
                    using (SqlCommand command = new SqlCommand(checkEmailQuery, connection))
                    {
                        command.Parameters.AddWithValue("@Email", admin.Email);
                        if ((int)command.ExecuteScalar() > 0)
                        {
                            return Json(new { success = false, message = "Email is already registered. Please use a different email." });
                        }
                    }

                    // Get the next AdminId
                    string getMaxIdQuery = "SELECT ISNULL(MAX(AdminId), 0) + 1 FROM Admins";
                    int newAdminId;
                    using (SqlCommand command = new SqlCommand(getMaxIdQuery, connection))
                    {
                        newAdminId = (int)command.ExecuteScalar();
                    }

                    // Insert new admin
                    using (SqlCommand command = new SqlCommand("spInsertAdmin", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        command.Parameters.AddWithValue("@AdminId", newAdminId);
                        command.Parameters.AddWithValue("@FirstName", admin.FirstName);
                        command.Parameters.AddWithValue("@LastName", admin.LastName);
                        command.Parameters.AddWithValue("@RoleType", admin.RoleType);
                        command.Parameters.AddWithValue("@Email", admin.Email);
                        command.Parameters.AddWithValue("@Password", admin.Password);
                        command.Parameters.AddWithValue("@DateOfBirth", admin.DateOfBirth);
                        command.Parameters.AddWithValue("@ProfileImage", imagePath);
                        command.Parameters.AddWithValue("@IsActive", admin.IsActive);
                        command.Parameters.AddWithValue("@CreatedDate", DateTime.Now);

                        command.ExecuteNonQuery();
                    }
                }

                return Json(new { success = true, message = "Signup successful!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }






        [HttpPost]
        [Route("AdminLogin")]
        public JsonResult AdminLogin(Admin admin)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors)
                                                   .Select(e => e.ErrorMessage)
                                                   .ToList();
                    return Json(new { success = false, errors });
                }
                int AdminId = 0;
                string storedPasswordHash = null;

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand("spAdminLogin", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@Email", admin.Email);

                        connection.Open();
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                AdminId = Convert.ToInt32(reader["AdminId"]);
                                storedPasswordHash = reader["Password"].ToString();
                            }
                        }
                    }
                }

                if (storedPasswordHash == null)
                {
                    return Json(new { success = false, message = "Admin not found. Please register first." });
                }

                if (storedPasswordHash != admin.Password)
                {
                    return Json(new { success = false, message = "Incorrect password." });
                }

                Session["AdminEmail"] = admin.Email;
                Session["AdminId"] = AdminId;

                // Debugging log
                System.Diagnostics.Debug.WriteLine("Session AdminEmail: " + Session["AdminEmail"]);

                return Json(new { success = true, message = "Login successful!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }





        //To fetch admin details from database

        [HttpGet]
        public JsonResult GetAdminDetails()
        
        
        {
            string email = Session["AdminEmail"] as string; // Corrected for ASP.NET MVC/WebForms

            if (string.IsNullOrEmpty(email))
            {
                return Json(new { success = false, message = "Session expired. Please log in again." }, JsonRequestBehavior.AllowGet);
            }

            Admin admin = null;

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    using (SqlCommand cmd = new SqlCommand("spGetAdminByEmail", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@Email", email);

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                admin = new Admin
                                {
                                    AdminId = reader["AdminId"] as int? ?? 0,
                                    FirstName = reader["FirstName"] as string ?? string.Empty,
                                    LastName = reader["LastName"] as string ?? string.Empty,
                                    RoleType = reader["RoleType"] as string ?? string.Empty,
                                    CreatedDate = reader["CreatedDate"] as DateTime? ?? DateTime.MinValue,
                                    Email = reader["Email"] as string ?? string.Empty,
                                    Password = reader["Password"] as string ?? string.Empty,
                                    DateOfBirth = reader["DateOfBirth"] as DateTime?,
                                    ImagePath = reader["ImagePath"] as string ?? string.Empty,
                                    IsActive = reader["IsActive"] as bool? ?? false
                                };
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }

          

            return admin != null
                ? Json(new { success = true, data = admin }, JsonRequestBehavior.AllowGet)
                : Json(new { success = false, message = "Admin not found." }, JsonRequestBehavior.AllowGet);
        }




        //// For Admin Settings panel 
        //[HttpGet]
        //public ActionResult AdminSettings()
        //{
        //    string email = Session["AdminEmail"] as string;

        //    if (string.IsNullOrEmpty(email))
        //    {
        //        return RedirectToAction("AdminLogin", "Admin");
        //    }

        //    Admin admin = null;

        //    using (SqlConnection connection = new SqlConnection(connectionString))
        //    {
        //        try
        //        {
        //            connection.Open();

        //            using (SqlCommand cmd = new SqlCommand("spGetAdminByEmail", connection))
        //            {
        //                cmd.CommandType = CommandType.StoredProcedure;
        //                cmd.Parameters.AddWithValue("@Email", email);

        //                using (SqlDataReader reader = cmd.ExecuteReader())
        //                {
        //                    if (reader.Read())
        //                    {
        //                        admin = new Admin
        //                        {
        //                            AdminId = reader["AdminId"] != DBNull.Value ? reader.GetInt32(reader.GetOrdinal("AdminId")) : 0,
        //                            FirstName = reader["FirstName"] as string ?? string.Empty,
        //                            LastName = reader["LastName"] as string ?? string.Empty,
        //                            RoleType = reader["RoleType"] as string ?? string.Empty,
        //                            CreatedDate = reader["CreatedDate"] != DBNull.Value ? reader.GetDateTime(reader.GetOrdinal("CreatedDate")) : DateTime.MinValue,
        //                            Email = reader["Email"] as string ?? string.Empty,
        //                            ImagePath = reader["ImagePath"] as string ?? string.Empty,
        //                            IsActive = reader["IsActive"] != DBNull.Value && reader.GetBoolean(reader.GetOrdinal("IsActive"))
        //                        };
        //                    }
        //                }
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
        //        }
        //    }

        //    if (admin != null)
        //    {
        //        return View(admin);
        //    }
        //    else
        //    {
        //        return RedirectToAction("AdminLogin", "Admin");
        //    }
        //}


        // To update admin details


        [HttpPost]
        public JsonResult UpdateAdminDetails(Admin admin, HttpPostedFileBase ProfileImage)
        {
            try
            {
                string imagePath = admin.ImagePath;

                if (ProfileImage != null && ProfileImage.ContentLength > 0)
                {
                    string folderPath = Server.MapPath("~/UploadedImages/Admins/");
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }

                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(ProfileImage.FileName);
                    string filePath = Path.Combine(folderPath, fileName);
                    ProfileImage.SaveAs(filePath);

                    imagePath = "/UploadedImages/Admins/" + fileName;
                }

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand("spUpdateAdminDetails", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        command.Parameters.AddWithValue("@Email", admin.Email); // Using Email as the identifier
                        command.Parameters.AddWithValue("@FirstName", admin.FirstName);
                        command.Parameters.AddWithValue("@LastName", admin.LastName);
                        command.Parameters.AddWithValue("@Password", string.IsNullOrEmpty(admin.Password) ? (object)DBNull.Value : admin.Password);
                        command.Parameters.AddWithValue("@ImagePath", imagePath ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@IsActive", admin.IsActive);
                        command.Parameters.AddWithValue("@DateOfBirth", admin.DateOfBirth ?? (object)DBNull.Value);

                        connection.Open();
                        int rowsAffected = command.ExecuteNonQuery();

                        if (rowsAffected == 0)
                        {
                            return Json(new { success = false, message = "No matching record found to update!" });
                        }
                    }
                }

                return Json(new { success = true, message = "Admin details updated successfully!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }





        // For clearing server side session 


        [HttpPost]
        public ActionResult AdminLogout()
        {
            Session.Clear();
            Session.Abandon();
            return Json(new { success = true });
        }





        // Admin Dashboard
        public ActionResult Index()
        {
            return View();
        }


        //Admin About

        
        public ActionResult About()
        {
            return View();
        }


        // ATS Page
      
        public ActionResult ApplicationTrackingSystem()
        {
            return View();
        }

        public ActionResult usereditordelete()
        {
            return View();
        }
        // Database Manager
       
        public ActionResult DatabaseManager()
        {
            return View();
        }

        //Application review
        public ActionResult ApplicationReview()
        {
            return View();
        }
        // Interview Manager
        public ActionResult InterviewManager()
        {
            return View();
        }

        // Job Postings
        public ActionResult JobPostings()
        {
            return View();
        }
        public ActionResult AllJobseditordelete()
        {
            return View();
        }
        // User Statistics
        public ActionResult Statistics
            ()
        {
            return View();
        }

        // Settings Page
        public ActionResult Settings()
        {
            return View();
        }


        //admin signup

        public ActionResult AdminSignup()
        {
            return View();
        }



        //admin login
        public ActionResult AdminLogin()
        {
            return View();
        }

        // Fetch all Job Applications with User details
        public JsonResult GetAllApplications()
        {
            var applications = new List<JobApplicationUser>();
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
            //        string query = @"
            //SELECT 
            //    ja.ApplyId, 
            //    u.UserId,
            //    u.FirstName, 
            //    u.LastName, 
            //    ja.Experience, 
            //    ja.EducationalDetails, 
            //    ja.ResumeUpload,
            //    jp.JobTitle,
            //    u.UserId,   
            //    u.Email,    
            //    u.PhoneNumber
            //FROM JobApply ja
            //INNER JOIN Users u ON ja.UserId = u.UserId
            //INNER JOIN JobPostings jp ON ja.JobId = jp.JobId;";

                   
                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("spAllApplications", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                applications.Add(new JobApplicationUser
                                {
                                    ApplyId = Convert.ToInt32(reader["ApplyId"]),
                                    UserId = Convert.ToInt32(reader["UserId"]),
                                    FirstName = reader["FirstName"].ToString(),
                                    LastName = reader["LastName"].ToString(),
                                    Experience = reader["Experience"].ToString(),
                                    EducationalDetails = reader["EducationalDetails"].ToString(),
                                    JobTitle = reader["JobTitle"].ToString(),
                                    ResumeUpload = reader["ResumeUpload"].ToString(),
                                    
                                    //UserId = Convert.ToInt32(reader["UserId"]),
                                    //Email = reader["Email"].ToString(),
                                    //PhoneNumber = reader["PhoneNumber"].ToString()
                                });
                            }
                        }
                    }
                }

                // ✅ Ensure `data` is in response
                return Json(new { success = true, message = "Fetched Successfully", data = applications }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}", data = new List<JobApplicationUser>() }, JsonRequestBehavior.AllowGet);
            }
        }




        //model update 

        // ✅ POST: Update Job Application & User
        [HttpPost]
        public JsonResult UpdateApplication(UpdateApplicationModel model, HttpPostedFileBase ResumeUpload)
        {
            
            try
            {
               

              

                // ✅ Update Application in Database
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("UpdateJobApplicationAndUser", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        // ✅ Pass All Required Parameters
                        cmd.Parameters.AddWithValue("@ApplyId", model.ApplyId);
                        cmd.Parameters.AddWithValue("@UserId", model.UserId);
                     
                        cmd.Parameters.AddWithValue("@FirstName", model.FirstName);
                        cmd.Parameters.AddWithValue("@LastName", model.LastName);
                       
                       
                        cmd.Parameters.AddWithValue("@EducationalDetails", model.EducationalDetails);
                       

                        conn.Open();
                        cmd.ExecuteNonQuery();
                    }
                }

                return Json(new { success = true, message = "Application updated successfully!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }


        //delete all details

        [HttpPost]
public JsonResult DeleteApplication(int applyId)
{
    try
    {
        using (SqlConnection conn = new SqlConnection(connectionString))
        {
            conn.Open();

            // 1️⃣ Update Interviews Table to Set a Default Value Before Deleting JobApply
            using (SqlCommand updateCmd = new SqlCommand("spUpdateInterviewApplyId", conn))
            {
                updateCmd.CommandType = CommandType.StoredProcedure;
                updateCmd.Parameters.AddWithValue("@ApplyId", applyId);
                updateCmd.ExecuteNonQuery();
            }

            // 2️⃣ Delete Application From JobApply Table
            using (SqlCommand deleteCmd = new SqlCommand("spDeleteApplication1", conn))
            {
                deleteCmd.CommandType = CommandType.StoredProcedure;
                deleteCmd.Parameters.AddWithValue("@ApplyId", applyId);
                deleteCmd.ExecuteNonQuery();
            }
        }

        return Json(new { success = true, message = "Application deleted successfully!" });
    }
    catch (Exception ex)
    {
        return Json(new { success = false, message = "Error: " + ex.Message });
    }
}


        //Get All user

        public JsonResult GetUsers()
        {
            try
            {
                List<user_login> users = new List<user_login>();

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                //    string query = @"
                //SELECT UserId, FirstName, LastName, PhoneNumber, Email, Password, ProfilePicture 
                //FROM Users";

                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("spGetUser", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                users.Add(new user_login
                                {
                                    UserId = reader["UserId"].ToString(),
                                    FirstName = reader["FirstName"].ToString(),
                                    LastName = reader["LastName"].ToString(),
                                    PhoneNumber = reader["PhoneNumber"].ToString(),
                                    Email = reader["Email"].ToString(),
                                    Password = reader["Password"].ToString(), // ⚠️ Be careful returning passwords
                                    //ProfilePicture = reader["ProfilePicture"].ToString()
                                    ProfilePicture = !string.IsNullOrEmpty(reader["ProfilePicture"].ToString())
                                    ? "/UploadedFiles/" + reader["ProfilePicture"].ToString()
                                    : null
                                });
                            }
                        }
                    }
                }

                return Json(new { success = true, message = "Users fetched successfully", data = users }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}", data = new List<user_login>() }, JsonRequestBehavior.AllowGet);
            }
        }


        //Get All user
        [HttpGet]
        public JsonResult GetUsers2(int offset = 0, int limit = 5) // Default: fetch first 5 users
        {
            try
            {
                List<user_login> users = new List<user_login>();
                int totalCount = 0;

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("spGetUser2", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@Offset", offset);
                        cmd.Parameters.AddWithValue("@Limit", limit);

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            // Fetch User Data
                            while (reader.Read())
                            {
                                users.Add(new user_login
                                {
                                    UserId = reader["UserId"].ToString(),
                                    FirstName = reader["FirstName"].ToString(),
                                    LastName = reader["LastName"].ToString(),
                                    PhoneNumber = reader["PhoneNumber"].ToString(),
                                    Email = reader["Email"].ToString()
                                });
                            }

                            // Fetch Total Count from the second result set
                            if (reader.NextResult() && reader.Read())
                            {
                                totalCount = Convert.ToInt32(reader[0]);
                            }
                        }
                    }
                }

                return Json(new
                {
                    success = true,
                    message = "Users fetched successfully",
                    data = users,
                    total = totalCount
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = $"Error: {ex.Message}",
                    data = new List<user_login>(),
                    total = 0
                }, JsonRequestBehavior.AllowGet);
            }
        }


        //update all user details

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


        //Delete user details

        [HttpPost]
        public JsonResult DeleteUser(int userId)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("DeleteUserDetails", conn)) // Assuming stored procedure exists
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@UserId", userId);

                        conn.Open();
                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return Json(new { success = true, message = "User deleted successfully!" });
                        }
                        else
                        {
                            return Json(new { success = false, message = "User not found or already deleted." });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error: " + ex.Message);
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        // For Jobs Posting


        [HttpPost]
        public JsonResult SaveJobData(Create CJ)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    //string query = "INSERT INTO JobPostings1 (JobTitle, CompanyName, Location, JobType, Salary, Experience, EndDate, Description, JobCategory, PostedDate) " +
                    //               "VALUES (@JobTitle, @CompanyName, @Location, @JobType, @Salary, @Experience, @EndDate, @Description, @JobCategory, GETDATE())";

                    using (SqlCommand cmd = new SqlCommand("spsaveJobPostings", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@JobTitle", CJ.JobTitle ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@CompanyName", CJ.CompanyName ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@Location", CJ.Location ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@JobType", CJ.JobType ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@Salary2", CJ.Salary);
                        cmd.Parameters.AddWithValue("@Experience", CJ.Experience);
                        cmd.Parameters.AddWithValue("@EndDate", CJ.EndDate);
                        cmd.Parameters.AddWithValue("@Description", CJ.Description ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@JobCategory", CJ.JobCategory ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@Description2", CJ.Description2 ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@SkillRequired", CJ.SkillRequired ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@AdminId", CJ.AdminId);
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

        //All Job Posting

        public JsonResult GetAllJobPostings()
        {
            var applications = new List<Create>();
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
            //        string query = @"
            //SELECT 
            //    *
            //FROM JobPostings1";


                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("spgetalljobpostings", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                applications.Add(new Create
                                {
                                    JobId= Convert.ToInt32(reader["JobId"]),
                                    JobTitle = reader["JobTitle"].ToString(),
                                    Location = reader["Location"].ToString(),
                                    CompanyName = reader["CompanyName"].ToString(),
                                    JobType = reader["JobType"].ToString(),
                                    Experience = reader["Experience"].ToString(),
                                    Salary = reader["Salary"].ToString(),
                                    EndDate = Convert.ToDateTime(reader["EndDate"]),

                                    Description = reader["Description"].ToString(),
                                    JobCategory= reader["JobCategory"].ToString()

                                    //UserId = Convert.ToInt32(reader["UserId"]),
                                    //Email = reader["Email"].ToString(),
                                    //PhoneNumber = reader["PhoneNumber"].ToString()
                                });
                            }
                        }
                    }
                }

                // ✅ Ensure `data` is in response
                return Json(new { success = true, message = "Fetched Successfully", data = applications }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}", data = new List<JobApplicationUser>() }, JsonRequestBehavior.AllowGet);
            }
        }

        //update job posting

        // 🎯 Update Job Posting
        [HttpPost]
        public JsonResult UpdateJobPosting(Create model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        using (SqlCommand cmd = new SqlCommand("spUpdatejobpostings", conn))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.AddWithValue("@JobId", model.JobId);
                            cmd.Parameters.AddWithValue("@JobTitle", model.JobTitle);
                            cmd.Parameters.AddWithValue("@CompanyName", model.CompanyName);
                            cmd.Parameters.AddWithValue("@Location", model.Location);
                            cmd.Parameters.AddWithValue("@JobType", model.JobType);
                            cmd.Parameters.AddWithValue("@Salary", model.Salary);
                            cmd.Parameters.AddWithValue("@Experience", model.Experience);
                            cmd.Parameters.AddWithValue("@EndDate", model.EndDate);
                            cmd.Parameters.AddWithValue("@Description", model.Description);
                            cmd.Parameters.AddWithValue("@JobCategory", model.JobCategory);

                            conn.Open();
                            cmd.ExecuteNonQuery();
                        }
                    }

                    return Json(new { success = true, message = "Job posting updated successfully!" });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = ex.Message });
                }
            }
            return Json(new { success = false, message = "Invalid model data!" });
        }


        [HttpPost]
        public JsonResult DeleteJobPosting(int JobId)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("DeleteJobPosting", conn)) // Assuming stored procedure exists
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@JobId", JobId);

                        conn.Open();
                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return Json(new { success = true, message = "Job posting deleted successfully!" });
                        }
                        else
                        {
                            return Json(new { success = false, message = "Job posting not found or already deleted." });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error: " + ex.Message);
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        // All Apply job 

        // 🎯 Fetch All Job Applications
        [HttpGet]
        public JsonResult GetAllJobApplications()
        {
            List<JobApply> applications = new List<JobApply>();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    using (SqlCommand cmd = new SqlCommand("spGetAllJobApplications", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                JobApply application = new JobApply
                                {
                                    ApplyId = reader["ApplyId"] as int? ?? 0,
                                    //UserId = reader["UserId"] as int? ?? 0,
                                    FirstName = reader["FirstName"] as string ?? string.Empty,
                                    LastName = reader["LastName"] as string ?? string.Empty,
                                    //JobId = reader["JobId"] as int? ?? 0,
                                    JobName = reader["JobName"] as string ?? string.Empty,
                                    //Experience = reader["Experience"] as string ?? string.Empty,
                                    //EducationalDetails = reader["EducationalDetails"] as string ?? string.Empty,
                                    ResumeUpload = reader["ResumeUpload"] as string ?? string.Empty,
                                    ApplicationStatus = reader["ApplicationStatus"] as string ?? "In Review"
                                };

                                applications.Add(application);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }

            return applications.Any()
                ? Json(new { success = true, data = applications }, JsonRequestBehavior.AllowGet)
                : Json(new { success = false, message = "No job applications found." }, JsonRequestBehavior.AllowGet);
        }


        // change application status (Rejected, under process, Interview, Selected)

        [HttpPost]
        public JsonResult UpdateApplicationStatus(JobApply model)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    using (SqlCommand cmd = new SqlCommand("spUpdateApplicationStatus", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@ApplyId", model.ApplyId);
                        cmd.Parameters.AddWithValue("@ApplicationStatus", model.ApplicationStatus);

                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return Json(new { success = true, message = "Application status updated successfully!" });
                        }
                        else
                        {
                            return Json(new { success = false, message = "Failed to update status." });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        //  delete Application from JobApply


        [HttpPost]
        public JsonResult DeleteJobApplication(int ApplyId)
        {
            try
            {
                int rowsAffected = 0;

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    using (SqlCommand cmd = new SqlCommand("spDeleteApplication", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@ApplyId", ApplyId);

                        rowsAffected = cmd.ExecuteNonQuery();
                    }
                }

                if (rowsAffected > 0)
                {
                    return Json(new { success = true, message = "Application deleted successfully!" });
                }
                else
                {
                    return Json(new { success = false, message = "Application not found or already deleted!" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }


        //send data to interview table

        [HttpPost]
        public JsonResult Scheduleinterview(InterviewModel IM)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    //string query = @"INSERT INTO Interviews (ApplyId, UserId, JobId, Experience, EducationalDetails, ResumeUpload, 
                    //             InterviewDateTime, Location, CreatedAt) 
                    //             VALUES (@ApplyId, @UserId, @JobId, @Experience, @EducationalDetails, @ResumeUpload, 
                    //             @InterviewDateTime, @Location, GETDATE())";

                    using (SqlCommand cmd = new SqlCommand("spscheduleinterview", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@ApplyId", IM.ApplyId);
                        cmd.Parameters.AddWithValue("@UserId",IM.UserId);
                        cmd.Parameters.AddWithValue("@JobId", IM.JobId);
                        cmd.Parameters.AddWithValue("@Experience", IM.Experience ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@EducationalDetails", IM.EducationalDetails ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@ResumeUpload", IM.ResumeUpload ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@InterviewDateTime", IM.InterviewDateTime);
                        cmd.Parameters.AddWithValue("@Location", IM.Location ?? (object)DBNull.Value);
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

        //Get All interview

        [HttpGet]
        public JsonResult GetAllInterview()
        {
            List<JobApply> applications = new List<JobApply>();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    using (SqlCommand cmd = new SqlCommand("spGetAllInterviews", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                JobApply application = new JobApply
                                {
                                    InterviewId= reader["InterviewId"] as int? ?? 0,
                                    ApplyId = reader["ApplyId"] as int? ?? 0,
                                    UserId = reader["UserId"] as int? ?? 0,
                                    JobId = reader["JobId"] as int? ?? 0,
                                    Experience = reader["Experience"] as string ?? string.Empty,
                                    EducationalDetails = reader["EducationalDetails"] as string ?? string.Empty,
                                    ResumeUpload = reader["ResumeUpload"] as string ?? string.Empty,
                                    InterviewDateTime = reader["InterviewDateTime"] as DateTime? ?? null,
                                    Location = reader["Location"] as string ?? string.Empty,
                                    InterviewStatus= reader["InterviewStatus"] as string ?? string.Empty

                                };

                                applications.Add(application);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }

            return applications.Any()
                ? Json(new { success = true, data = applications }, JsonRequestBehavior.AllowGet)
                : Json(new { success = false, message = "No job applications found." }, JsonRequestBehavior.AllowGet);
        }

        //Update interview status

        [HttpPost]
        public JsonResult UpdateInterviewStatus(JobApply model)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    using (SqlCommand cmd = new SqlCommand("spUpdateInterviewStatus", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@InterviewId", model.InterviewId); // ✅ Use InterviewId
                        cmd.Parameters.AddWithValue("@InterviewStatus", model.InterviewStatus); // ✅ Use InterviewStatus

                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return Json(new { success = true, message = "Interview status updated successfully!" });
                        }
                        else
                        {
                            return Json(new { success = false, message = "Failed to update interview status." });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }


        // get all statics data

        //[HttpGet]
        //public JsonResult GetRecruitmentStats()
        //{
        //    var stats = new Dictionary<string, int>();

        //    try
        //    {
        //        using (SqlConnection connection = new SqlConnection(connectionString))
        //        {
        //            connection.Open();
        //            using (SqlCommand cmd = new SqlCommand("spGetRecruitmentStats", connection))
        //            {
        //                cmd.CommandType = CommandType.StoredProcedure;
        //                using (SqlDataReader reader = cmd.ExecuteReader())
        //                {
        //                    if (reader.Read())
        //                    {
        //                        // Logging each column to ensure they exist
        //                        Console.WriteLine($"TotalCandidates: {reader["TotalCandidates"]}");
        //                        Console.WriteLine($"ActiveJobs: {reader["ActiveJobs"]}");
        //                        Console.WriteLine($"InterviewsScheduled: {reader["InterviewsScheduled"]}");
        //                        Console.WriteLine($"HiredCandidates: {reader["HiredCandidates"]}");

        //                        stats["TotalCandidates"] = reader["TotalCandidates"] as int? ?? 0;
        //                        //stats["ActiveJobs"] = reader["ActiveJobs"] as int? ?? 0;
        //                        stats["InterviewsScheduled"] = reader["InterviewsScheduled"] as int? ?? 0;
        //                        stats["HiredCandidates"] = reader["HiredCandidates"] as int? ?? 0;
        //                    }
        //                }
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
        //    }

        //    return Json(new { success = true, data = stats }, JsonRequestBehavior.AllowGet);
        //}


        [HttpGet]
        public JsonResult GetRecruitmentStats()
        {
            var stats = new Dictionary<string, int>();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    using (SqlCommand cmd = new SqlCommand("spGetRecruitmentStats", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Logging each column to ensure they exist
                                Console.WriteLine($"TotalCandidates: {reader["TotalCandidates"]}");
                               

                                stats["TotalCandidates"] = reader["TotalCandidates"] as int? ?? 0;
                                //stats["ActiveJobs"] = reader["ActiveJobs"] as int? ?? 0;
                               
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { success = true, data = stats }, JsonRequestBehavior.AllowGet);
        }


        //

        [HttpGet]
        public JsonResult GetActiveStats()
        {
            var stats = new Dictionary<string, int>();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    using (SqlCommand cmd = new SqlCommand("spGetActiveStats", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Logging each column to ensure they exist
                                Console.WriteLine($"TotalCandidates: {reader["ActiveJobs"]}");

                                stats["ActiveJobs"] = reader["ActiveJobs"] as int? ?? 0;
                                //stats["TotalCandidates"] = reader["TotalCandidates"] as int? ?? 0;
                                //stats["ActiveJobs"] = reader["ActiveJobs"] as int? ?? 0;

                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { success = true, data = stats }, JsonRequestBehavior.AllowGet);
        }

        //get interview

        [HttpGet]
        public JsonResult GetInterviewStats()
        {
            var stats = new Dictionary<string, int>();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    using (SqlCommand cmd = new SqlCommand("spGetInterviewsStats", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Logging each column to ensure they exist
                               

                                stats["InterviewsScheduled"] = reader["InterviewsScheduled"] as int? ?? 0;
                                //stats["TotalCandidates"] = reader["TotalCandidates"] as int? ?? 0;
                                //stats["ActiveJobs"] = reader["ActiveJobs"] as int? ?? 0;

                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { success = true, data = stats }, JsonRequestBehavior.AllowGet);
        }


        //hired

        [HttpGet]
        public JsonResult GetHiredStats()
        {
            var stats = new Dictionary<string, int>();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    using (SqlCommand cmd = new SqlCommand("spGetHiredStats", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Logging each column to ensure they exist
                                

                                stats["HiredCandidates"] = reader["HiredCandidates"] as int? ?? 0;
                                //stats["TotalCandidates"] = reader["TotalCandidates"] as int? ?? 0;
                                //stats["ActiveJobs"] = reader["ActiveJobs"] as int? ?? 0;

                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { success = true, data = stats }, JsonRequestBehavior.AllowGet);
        }


        //

        [HttpGet]
        public JsonResult GetMonthlyRegistrations()
        {
            List<object> monthlyRegistrations = new List<object>();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    using (SqlCommand cmd = new SqlCommand("spGetMonthlyRegistrations", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var monthData = new
                                {
                                    Year = reader["Year"] as int? ?? 0,
                                    Month = reader["Month"] as int? ?? 0,
                                    Count = reader["Count"] as int? ?? 0
                                };

                                monthlyRegistrations.Add(monthData);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }

            return monthlyRegistrations.Any()
                ? Json(new { success = true, data = monthlyRegistrations.ToArray() }, JsonRequestBehavior.AllowGet)
                : Json(new { success = false, message = "No registration data found." }, JsonRequestBehavior.AllowGet);
        }





        //interview details delete

        [HttpPost]
        public JsonResult DeleteInterview(int InterviewId)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Delete the interview entry in one step, handling existence automatically
                    //string deleteQuery = "DELETE FROM Interviews WHERE InterviewId = @InterviewId";
                    using (SqlCommand deleteCmd = new SqlCommand("spdeleteinterviewdetails", connection))
                    {
                        deleteCmd.CommandType = CommandType.StoredProcedure;
                        deleteCmd.Parameters.AddWithValue("@InterviewId", InterviewId);
                        int rowsAffected = deleteCmd.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            return Json(new { success = true, message = "Interview entry deleted successfully!" });
                        }
                        else
                        {
                            return Json(new { success = false, message = "Interview entry not found or already deleted!" });
                        }
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                return Json(new { success = false, message = "SQL Error: " + sqlEx.Message });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        [HttpGet]
        public JsonResult GetRecruitmentStats1()
        {
            var stats = new Dictionary<string, int>();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    using (SqlCommand cmd = new SqlCommand("spGetRecruitmentStats1", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                stats["TotalCandidates"] = reader["TotalCandidates"] as int? ?? 0;
                            }

                            if (reader.NextResult() && reader.Read())
                            {
                                stats["ActiveJobs"] = reader["ActiveJobs"] as int? ?? 0;
                            }

                            if (reader.NextResult() && reader.Read())
                            {
                                stats["InterviewsScheduled"] = reader["InterviewsScheduled"] as int? ?? 0;
                            }

                            if (reader.NextResult() && reader.Read())
                            {
                                stats["HiredCandidates"] = reader["HiredCandidates"] as int? ?? 0;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { success = true, data = stats }, JsonRequestBehavior.AllowGet);
        }


        //For calender chart


        [HttpGet]
        public JsonResult GetMonthlyRecruitmentStats()
        {
            List<object> monthlyStats = new List<object>();

            try
            {
               

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    using (SqlCommand cmd = new SqlCommand("spGetMonthlyRecruitmentStats1", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var monthData = new
                                {
                                    Month = reader["Month"]?.ToString() ?? "",
                                    UserRegistrations = reader["UserRegistrations"] as int? ?? 0,
                                    JobPostings = reader["JobPostings"] as int? ?? 0,
                                    JobApplications = reader["JobApplications"] as int? ?? 0,
                                    InterviewsScheduled = reader["InterviewsScheduled"] as int? ?? 0,
                                    CandidatesHired = reader["CandidatesHired"] as int? ?? 0
                                };

                                monthlyStats.Add(monthData);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message }, JsonRequestBehavior.AllowGet);
            }

            return monthlyStats.Any()
                ? Json(new { success = true, data = monthlyStats.ToArray() }, JsonRequestBehavior.AllowGet)
                : Json(new { success = false, message = "No recruitment data found." }, JsonRequestBehavior.AllowGet);
        }


        //in user statics

        public JsonResult GetActiveJobs()
        {
            try
            {
                List<Job> jobs = new List<Job>();

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    //string query = "SELECT * FROM JobPostings";
                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("spgetActivejobs", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                jobs.Add(new Job
                                {
                                    JobTitle = reader["JobTitle"].ToString(),
                                    
                                    Location = reader["Location"].ToString(),
                                    
                                });
                            }
                        }
                    }
                }

                return Json(new { success = true, message = "Jobs fetched successfully", data = jobs }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}", data = new List<Job>() }, JsonRequestBehavior.AllowGet);
            }
        }

        //user statistics part

        [HttpGet]
        public JsonResult GetInterviewSchedules()
        {
            try
            {
                List<InterviewModel> interviews = new List<InterviewModel>();

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                //    string query = @"
                //SELECT 
                //    u.FirstName AS CandidateName, 
                //    jp.JobTitle, 
                //    i.InterviewDateTime AS InterviewTime
                //FROM Interviews i
                //JOIN Users u ON i.UserId = u.UserId
                //JOIN JobPostings jp ON i.JobId = jp.JobId"; 

                    conn.Open();

                    using (SqlCommand cmd = new SqlCommand("spgetInterviewScheduled", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                interviews.Add(new InterviewModel
                                {
                                    CandidateName = reader["CandidateName"].ToString(),
                                    JobTitle = reader["JobTitle"].ToString(),
                                    InterviewTime = reader["InterviewTime"].ToString()

                                });
                            }
                        }
                    }
                }

                return Json(new { success = true, message = "Interview schedules fetched successfully", data = interviews }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" }, JsonRequestBehavior.AllowGet);

            }
        }

        //Get hired candidate

        [HttpGet]
        public JsonResult GetHiredCandidates()
        {
            try
            {
                List<InterviewModel> hiredCandidates = new List<InterviewModel>();

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
            //        string query = @"
            //SELECT 
            //    u.FirstName  AS CandidateName, 
            //    jp.JobTitle
                
            //FROM Interviews i
            //JOIN Users u ON i.UserId = u.UserId
            //JOIN JobPostings jp ON i.JobId = jp.JobId
            
            //WHERE i.InterviewStatus = 'Selected'"; 
        
            conn.Open();

                    using (SqlCommand cmd = new SqlCommand("spgethiredcandidates", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                hiredCandidates.Add(new InterviewModel
                                {
                                    CandidateName = reader["CandidateName"].ToString(),
                                    JobTitle = reader["JobTitle"].ToString(),
                                 
                                });
                            }
                        }
                    }
                }

                return Json(new { success = true, message = "Hired candidates fetched successfully", data = hiredCandidates }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" }, JsonRequestBehavior.AllowGet);
            }
        }

        //update user from statistics card

        [HttpPost]
        public JsonResult UpdateUser(int userId, string firstName, string lastName, string location)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("UpdateUser", conn)) // Stored Procedure for Update
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@UserId", userId);
                        cmd.Parameters.AddWithValue("@FirstName", firstName);
                        cmd.Parameters.AddWithValue("@LastName", lastName);
                        cmd.Parameters.AddWithValue("@Location", location);

                        conn.Open();
                        cmd.ExecuteNonQuery();
                    }
                }

                return Json(new { success = true, message = "User updated successfully!" });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error updating user: " + ex.Message);
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        //Delete user

        [HttpPost]
        public JsonResult DeleteUser2(int userId)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("DeleteUser", conn)) // Stored Procedure for Delete
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@UserId", userId);

                        conn.Open();
                        cmd.ExecuteNonQuery();
                    }
                }

                return Json(new { success = true, message = "User deleted successfully!" });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error deleting user: " + ex.Message);
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }


    }
}