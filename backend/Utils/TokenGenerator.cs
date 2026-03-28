using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Models;
using Microsoft.IdentityModel.Tokens;
namespace backend.Utils;

public static class TokenGenerator
/* * This class is responsible for generating JWT tokens for authenticated users.
 * It uses the user's information to create a token that can be used for subsequent requests to protected endpoints.
 * The token includes claims such as the user's ID, email, and role, and is signed using a secret key defined in the environment variables.
    
    methods:
    - GenerateJwtToken(User user): Generates a JWT token for the given user.

    parameters:
    - user: An instance of the User class containing the user's information (ID, email, role).
    
    returns:
    - A string representation of the generated JWT token.
 */
{
    public static string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET");

        if (string.IsNullOrEmpty(secretKey))        {
            throw new InvalidOperationException("JWT_SECRET environment variable is not set.");
        }

        var key  = Encoding.ASCII.GetBytes(secretKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity( new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
        
    }
}