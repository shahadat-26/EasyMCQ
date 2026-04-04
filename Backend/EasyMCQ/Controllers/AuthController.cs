using EasyMCQ.DTOs;
using EasyMCQ.Services;
using Microsoft.AspNetCore.Mvc;

namespace EasyMCQ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            if (result == null)
                return Ok(new { success = false, message = "Email already exists" });

            return Ok(new {
                success = true,
                token = result.Token,
                userId = result.UserId,
                name = result.Name,
                email = result.Email,
                role = result.Role
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            if (result == null)
                return Ok(new { success = false, message = "Invalid email or password" });

            return Ok(new {
                success = true,
                token = result.Token,
                userId = result.UserId,
                name = result.Name,
                email = result.Email,
                role = result.Role
            });
        }
    }
}