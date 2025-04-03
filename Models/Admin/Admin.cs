using System;

namespace Recruitment_Portal.Models.Admin
{
    public class Admin
    {
        public int AdminId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string RoleType { get; set; }
        public DateTime CreatedDate { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string ImagePath { get; set; }
        public bool IsActive { get; set; }
    }
}
