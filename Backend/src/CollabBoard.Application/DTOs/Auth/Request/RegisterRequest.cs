using System;
using System.Collections.Generic;
using System.Text;

namespace CollabBoard.Application.DTOs.Auth.Request
{
    public record RegisterRequest(string Email, string Password, string DisplayName);
}
