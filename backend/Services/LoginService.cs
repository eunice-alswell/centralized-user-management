using backend.DTOs;
using backend.Utils;

namespace backend.Services;

public interface ILoginService
{
    Task<LoginResponseDto> LoginAsync(LogInDto dto);
}

public class LoginService : ILoginService
    /**
        The LoginService class implements the ILoginService interface and provides the logic for authenticating users. It uses the IUserService to retrieve user information from the database and verifies the provided password using BCrypt. If authentication is successful, it generates a JWT token for the user and returns a LoginResponseDto containing the user's information and the token.
        - methods:
            LoginAsync(LogInDto dto): Authenticates a user based on the provided email and password. 
            It retrieves the user from the database using the IUserService, verifies the password using BCrypt, and generates a JWT token if authentication is successful. 
            If authentication fails, it throws an UnauthorizedAccessException with an appropriate message.
        - parameters:
            dto: An instance of the LogInDto class containing the user's email and password for authentication.

        - returns:
            LoginResponseDto: A data transfer object containing the user's information and the generated JWT token if authentication is successful.
    */
{
    // Implementation of the LoginAsync method to authenticate a user and return a JWT token.
    private readonly IUserService _userService;

    public LoginService(IUserService userService)
    {
        _userService = userService;
    }
    
    public async Task<LoginResponseDto> LoginAsync(LogInDto dto)
    {
        var user = await _userService.GetUserByEmailAsync(dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("User account is deactivated.");
        }

        return new LoginResponseDto
        {
            Message = "Login successful",
            User = new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive
            },
            Token = TokenGenerator.GenerateJwtToken(user)
        };
        
    }

    
}