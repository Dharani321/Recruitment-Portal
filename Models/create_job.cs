using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Recruitment_Portal.Models
{
    public class Create
    {
        public int JobId { get; set; }
        public string JobTitle { get; set; }
        public string Location { get; set; }  // Ensure this is included
        public string CompanyName { get; set; }  
        public string JobType { get; set; }
        public string Salary { get; set; }
        public string Experience { get; set; }
        

        public DateTime EndDate { get; set; }
        public string Description { get; set; }
        public string JobCategory { get; set; }

        public string SkillRequired { get; set; }
        public string Description2 { get; set; }
        public int AdminId { get; set; }
    }
}