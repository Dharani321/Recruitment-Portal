using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Recruitment_Portal.Models.Admin
{
    public class JobApplicationUser
    {
        public int ApplyId { get; set; }
        public int UserId { get; set; }
        public  string JobTitle { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Experience { get; set; }
        public string EducationalDetails { get; set; }
        public string ResumeUpload { get; set; }

      
    }

}