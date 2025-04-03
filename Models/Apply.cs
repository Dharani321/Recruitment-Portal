using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Recruitment_Portal.Models
{
    public class Application
    {
        public int JobID { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime DOB { get; set; }
        public string Qualification { get; set; }
        public string ProfilePicturePath { get; set; }
        public string ResumePath { get; set; }
        public string Message { get; set; }
    }
}