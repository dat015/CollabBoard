using CollabBoard.Application.Common.Interfaces;
using CollabBoard.Application.DTOs.Auth.Request;
using CollabBoard.Application.DTOs.Auth.Response;
using CollabBoard.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CollabBoard.Infrastructure.Services
{
    public class IdentityService : IIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public IdentityService(UserManager<ApplicationUser> userManager, IConfiguration configuration, IJwtTokenGenerator jwtTokenGenerator)
        {
            _userManager = userManager;
            _configuration = configuration;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                DisplayName = request.DisplayName
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Đăng ký thất bại: {errors}");
            }

            return await GenerateAndSaveTokensAsync(user);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                throw new Exception("Tài khoản hoặc mật khẩu không đúng.");

            var isValidPassword = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isValidPassword)
                throw new Exception("Tài khoản hoặc mật khẩu không đúng.");

            return await GenerateAndSaveTokensAsync(user);
        }

        public async Task<AuthResponse> RefreshAccessToken(string refetchToken)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == refetchToken);

            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                throw new Exception("Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
            }

            return await GenerateAndSaveTokensAsync(user);
        }

        private async Task<AuthResponse> GenerateAndSaveTokensAsync(ApplicationUser user)
        {
            var accessToken = _jwtTokenGenerator.GenerateToken(user);
            var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

            user.RefreshToken = refreshToken;

            int refreshTokenValidityInDays = int.Parse(_configuration["JwtSettings:RefreshTokenExpiryDays"] ?? "7");
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshTokenValidityInDays);

            await _userManager.UpdateAsync(user);

            return new AuthResponse
            (
                user.Id,
                user.Email ?? "",
                user.DisplayName ?? "",
                accessToken,
                refreshToken
            );
        }
    }
}
