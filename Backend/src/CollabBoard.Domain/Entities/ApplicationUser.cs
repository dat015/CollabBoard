using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Identity;
namespace CollabBoard.Domain.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string? DisplayName { get; set; }
        public string? AvatarUrl {  get; set; }
    }
}
