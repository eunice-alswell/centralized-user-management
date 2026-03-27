using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class AssignUserApplicationDto
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid ApplicationId { get; set; }
    }
}