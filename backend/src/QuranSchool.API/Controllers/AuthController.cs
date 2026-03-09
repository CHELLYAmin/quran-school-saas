using Microsoft.AspNetCore.Mvc;
using QuranSchool.Application.DTOs.Auth;
using QuranSchool.Application.Interfaces;

namespace QuranSchool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    /// <summary>Login with email and password</summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        return Ok(response);
    }

    /// <summary>Register a new user</summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var response = await _authService.RegisterAsync(request);
        return CreatedAtAction(nameof(Login), response);
    }

    /// <summary>Refresh JWT token</summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var response = await _authService.RefreshTokenAsync(request);
        return Ok(response);
    }

    /// <summary>Revoke refresh token (logout)</summary>
    [HttpPost("revoke/{userId}")]
    public async Task<IActionResult> RevokeToken(Guid userId)
    {
        await _authService.RevokeTokenAsync(userId);
        return NoContent();
    }

    /// <summary>Get diagnostic information about the database and users</summary>
    [HttpGet("diagnostic")]
    public async Task<ActionResult<object>> GetDiagnostic()
    {
        var info = await _authService.GetDiagnosticInfoAsync();
        return Ok(info);
    }
}
