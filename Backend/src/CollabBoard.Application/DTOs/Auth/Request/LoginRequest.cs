using System;
using System.Collections.Generic;
using System.Text;

namespace CollabBoard.Application.DTOs.Auth.Request
{
    public record LoginRequest(string Email, string Password);

}
