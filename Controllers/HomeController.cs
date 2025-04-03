using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Web.Mvc;
using System.Configuration;
using Recruitment_Portal.Models;
using System.Security.Principal;
using System.Linq;
using System.Web;

namespace Recruitment_Portal.Controllers
{
    public class HomeController : Controller
    {
        private readonly string _connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

        //made for checking which kind of cookie is being stored 

        public ActionResult CheckCookies()
        {
            var cookies = Request.Cookies;
            string output = "Cookies Found: ";

            foreach (string key in cookies.AllKeys)
            {
                output += $"{key} = {cookies[key].Value}, ";
            }

            return Content(output);
        }



        // Index Page
        public ActionResult Index(int page = 1, int size = 5)
        {
            var authCookie = Request.Cookies[".ASPXAUTH"]; // remember check the CheckCookie method for the cookie name (It is stored as ".ASPXAUTH")

            if (authCookie != null)
            {
                return RedirectToAction("User_Dashboard", "User");
            }

            var jobs = GetJobPostings(page, size);
            var totalJobs = GetTotalJobs();
            ViewBag.TotalJobs = totalJobs;
            ViewBag.CurrentPage = page;
            ViewBag.PageSize = size;
            return View(jobs);
        }

        //For Location Search Bar 
        private static List<string> locations = new List<string>
        {
            "Bengaluru, Karnataka",
            "Hyderabad, Telangana",
            "Delhi, NCR",
            "Mumbai, Maharashtra",
            "Chennai, Tamil Nadu"
        };

        [HttpGet]
        public JsonResult Search(string term)
        {
            var results = locations
                .Where(l => l.ToLower().Contains(term.ToLower()))
                .ToList();

            return Json(results, JsonRequestBehavior.AllowGet);
        }


        // API Endpoint for Job Listings in JSON format
        [HttpGet]
        public JsonResult GetJobPostingsJson(int page = 1, int size = 3)
        {
            var jobs = GetJobPostings(page, size);
            var totalJobs = GetTotalJobs();

            return Json(new { jobs, totalJobs }, JsonRequestBehavior.AllowGet);
        }

        // Get Job Postings from Database
        private List<Job> GetJobPostings(int page, int size)
        {
            var jobs = new List<Job>();
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    connection.Open();
                    using (var command = new SqlCommand("GetJobPostings", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@PageNumber", page);
                        command.Parameters.AddWithValue("@PageSize", size);
                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                jobs.Add(new Job
                                {
                                    JobId = reader.GetInt32(0),
                                    JobTitle = reader.GetString(1),
                                    JobDescription = reader.GetString(2),
                                    Location = reader.GetString(3),
                                    Salary = reader.GetDecimal(4)
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
               Response.Write("Error: " + ex.Message);
            }
            return jobs;
        }

        // Get Total Job Count from Database
        private int GetTotalJobs()
        {
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    connection.Open();
                    using (var command = new SqlCommand("GetTotalJobCount", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        return (int)command.ExecuteScalar();
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Write("Error: " + ex.Message);
                return 0;  
            }
        }
    





        
      
       

        //Employers Section
        public ActionResult Employers()
        {
            return View();
        }

    }
}
    
