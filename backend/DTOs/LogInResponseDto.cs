namespace backend.DTOs;
public class LoginResponseDto
{
    public string Message { get; set; } = string.Empty;
    public UserResponseDto User { get; set; } = new UserResponseDto();
    public string Token { get; set; } = string.Empty;
}