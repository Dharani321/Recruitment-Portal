using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Recruitment_Portal.Models
{
    public class InterviewModel
    {
        public int ApplyId { get; set; }
        public int UserId { get; set; }
        public int JobId { get; set; }
        public string Experience { get; set; }
        public string EducationalDetails { get; set; }
        public string ResumeUpload { get; set; }
        public DateTime InterviewDateTime { get; set; }
        public string Location { get; set; }
        public string CandidateName { get; set; }
        public string JobTitle { get; set; }
        public DateTime InterviewDate { get; set; }
        public string InterviewTime { get; set; } // Storing time as string (e.g., "10:00 AM")
    }
}