using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreateUserDto
    {
        [Required]
        [StringLength(
            200, 
            MinimumLength = 2, 
            ErrorMessage = "Name must be between 2 and 200 characters long."
        )]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(
            100, 
            MinimumLength = 8, 
            ErrorMessage = "Password must be at least 8 characters long."
        )]
        [RegularExpression(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", 
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )]
        public string Password { get; set; } = string.Empty;

        [Required]
        [RegularExpression(
            @"^(Admin|User)$", 
            ErrorMessage = "Role must be either 'Admin' or 'User'."
        )]
        public string Role { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

    }
}