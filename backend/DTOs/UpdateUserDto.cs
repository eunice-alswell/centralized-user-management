using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class UpdateUserDto
    {

        [StringLength(200, MinimumLength = 2)]
        public string? Name { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        [StringLength(100, MinimumLength = 8)]
        [RegularExpression(
            @"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':""|\,.<>\/?])",
            ErrorMessage = "Password must contain uppercase, number, and special character"
        )]
        public string? Password { get; set; }

        public string? Role { get; set; }

        public bool? IsActive { get; set; }
    }
}