using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Recruitment_Portal.Models
{
    public class Feedback
    {
       
       

        public int UserId { get; set; }


        public int Rating { get; set; }

     
        public string Comment { get; set; }

       
    }
}