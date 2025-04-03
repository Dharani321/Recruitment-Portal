using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Recruitment_Portal.Models
{
    public class JobApply
    {
        public int InterviewId { get; set; }
        public int ApplyId { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int JobId { get; set; }
        public string JobName { get; set; }
        public string Experience { get; set; }
        public string EducationalDetails { get; set; }
        public string ResumeUpload { get; set; }
        public string ApplicationStatus { get; set; } // "In Review", "Interview", "Selected", "Rejected"

        public DateTime? InterviewDateTime { get; set; } // Nullable in case not scheduled yet
        public string Location { get; set; }
        public string InterviewStatus { get; set; }
    }
}