using System;
using System.Collections.Generic;
using System.Text;

namespace CollabBoard.Application.DTOs.Auth.Response
{
    public record AuthResponse(string Id, string Email, string DisplayName, string Token);
}
