using CollabBoard.Application.DTOs.Auth.Request;
using CollabBoard.Application.DTOs.Auth.Response;
using System;
using System.Collections.Generic;
using System.Text;

namespace CollabBoard.Application.Common.Interfaces
{
    public interface IIdentityService
    {
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> RefreshAccessToken(string RefetchToken);
    }
}
