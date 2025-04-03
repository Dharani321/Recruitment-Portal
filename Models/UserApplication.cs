using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Recruitment_Portal.Models
{
    public class UserApplication
    {
        public int ApplyId { get; set; } // Auto-increment in DB
        public int UserId { get; set; }
        public int JobId { get; set; }
        public string Experience { get; set; }
        public string EducationalDetails { get; set; }
        public string ResumeUpload { get; set; } // Path to resume file
    }

}