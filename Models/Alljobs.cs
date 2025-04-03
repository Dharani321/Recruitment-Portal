using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Recruitment_Portal.Models
{
    public class AllJob
    {
        public int JobId { get; set; }
        public string JobTitle { get; set; }
        public string CompanyName { get; set; }
        public string Location { get; set; }
        public string JobType { get; set; }
        public string Experience { get; set; }
        public DateTime PostedDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Description { get; set; }
        public string JobCategory { get; set; }
        public string ApplyLink { get; set; }
        public decimal Salary { get; set; }
        public int UserId { get; set; }
        public int AdminId { get; set; }

        //public DateTime CreationDate { get; set; }
        //public DateTime EndDate { get; set; }

    }
}