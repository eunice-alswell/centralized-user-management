namespace backend.Models
{
    public class UserApplication
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User? User { get; set; }
        public Guid ApplicationId { get; set; }
        public Application? Application { get; set; }
    }
}