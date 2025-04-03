﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Recruitment_Portal.Models
{
    public class UpdateUserModel
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ProfilePicture { get; set; } // File path to save in DB
       
    }
}