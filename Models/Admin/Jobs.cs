using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Recruitment_Portal.Models
{

        public class Job
        {
            public int JobId { get; set; }
            public string JobTitle { get; set; }
            public string JobDescription { get; set; }
            public string Location { get; set; }
            public decimal Salary { get; set; }
    }
   }

