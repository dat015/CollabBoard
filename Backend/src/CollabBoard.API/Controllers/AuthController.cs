using CollabBoard.Application.Common.Interfaces;
using CollabBoard.Application.DTOs.Auth;
using CollabBoard.Application.DTOs.Auth.Request;
using CollabBoard.Application.DTOs.Auth.Response;
using CollabBoard.Application.DTOs.Base;
using Microsoft.AspNetCore.Mvc;

namespace CollabBoard.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public AuthController(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _identityService.RegisterAsync(request);

            return Ok(
                BaseResponse<AuthResponse>.Ok(
                    result,
                    "User registered successfully"
                )
            );
        }
        catch (Exception ex)
        {
            return BadRequest(
                BaseResponse<object>.Fail(
                    ex.Message,
                    "AUTH_REGISTER_FAILED"
                )
            );
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _identityService.LoginAsync(request);

            return Ok(
                BaseResponse<AuthResponse>.Ok(
                    result,
                    "User login successfully"
                )
            );
        }
        catch (Exception ex)
        {
            return BadRequest(
                BaseResponse<object>.Fail(
                    ex.Message,
                    "AUTH_LOGIN_FAILED"
                )
            );
        }
    }

    [HttpPost("token")]
    public async Task<IActionResult> RefreshAccessToken(
        [FromBody] RefreshTokenRequest request)
    {
        try
        {
            var result = await _identityService
                .RefreshAccessToken(request.RefreshToken);

            return Ok(
                BaseResponse<AuthResponse>.Ok(
                    result,
                    "Get access token successfully"
                )
            );
        }
        catch (Exception ex)
        {
            return Unauthorized(
                BaseResponse<object>.Fail(
                    ex.Message,
                    "AUTH_REFRESH_TOKEN_FAILED"
                )
            );
        }
    }
}
