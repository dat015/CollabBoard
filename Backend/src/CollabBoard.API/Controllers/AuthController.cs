using CollabBoard.Application.Common.Interfaces;
using CollabBoard.Application.DTOs.Auth;
using CollabBoard.Application.DTOs.Auth.Request;
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
            return Ok(new
            {
                data = result,
                message = "User registered successfully",
                success =true
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _identityService.LoginAsync(request);
            return Ok(new
            {
                data = result,
                message = "User login successfully",
                success = true
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}