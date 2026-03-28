using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IUserService
{
    // Retrieves all users from the database asynchronously.
    Task<IEnumerable<User>> GetUsersAsync();
    Task<User?> GetUserByIdAsync(Guid id);
    Task<User?> GetUserByEmailAsync(string email);
    // Creates a new user in the database asynchronously.
    Task<User> CreateUserAsync(CreateUserDto dto);
    // Updates an existing user in the database asynchronously. Only Admin role can update IsActive property.
    Task UpdateUserAsync(Guid id, UpdateUserDto dto, string? userRole = null);
    // Deletes a user from the database asynchronously.
    Task DeleteUserAsync(Guid id);
}

public class UserService : IUserService
/**
    * The UserService class implements the IUserService interface and provides methods to manage user data in the database.
    * It uses Entity Framework Core to interact with the database and BCrypt for password hashing.
    * The service includes methods to retrieve all users, get a user by ID or email, create a new user, update an existing user, and delete a user.
    
    -methods:
        GetUsersAsync(): Retrieves all users from the database asynchronously.
        GetUserByIdAsync(Guid id): Retrieves a user by their unique identifier asynchronously.
        GetUserByEmailAsync(string email): Retrieves a user by their email address asynchronously.
        CreateUserAsync(CreateUserDto dto): Creates a new user in the database asynchronously. It checks for existing users with the same email and hashes the password before saving.
        UpdateUserAsync(Guid id, UpdateUserDto dto, string? userRole = null): Updates an existing user in the database asynchronously. It allows updating the user's name, email, and password. Only users with the "Admin" role can update the IsActive property.
        DeleteUserAsync(Guid id): Deletes a user from the database asynchronously. It checks if the user exists before attempting to delete them.

    -parameters:
        id: The unique identifier of the user to retrieve, update, or delete.
        email: The email address of the user to retrieve.
        dto: A data transfer object containing the information needed to create or update a user.
        userRole: An optional parameter representing the role of the user making the update request. It is used to determine if the user has permission to update the IsActive property.

    -returns:
        GetUsersAsync(): A collection of User objects representing all users in the database.
        GetUserByIdAsync(Guid id): A User object representing the user with the specified ID, or null if no such user exists.
        GetUserByEmailAsync(string email): A User object representing the user with the specified email, or null if no such user exists.
        CreateUserAsync(CreateUserDto dto): A User object representing the newly created user.
        UpdateUserAsync(Guid id, UpdateUserDto dto, string? userRole = null): Updates an existing user in the database asynchronously.
        DeleteUserAsync(Guid id): Deletes a user from the database asynchronously.

 */
{
    private readonly AppDBContext _context;

    public UserService(AppDBContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<User>> GetUsersAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User> CreateUserAsync(CreateUserDto dto)
    {
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("A user already exists.");
        }
        int hashingRounds = 12; // You can adjust this value based on your security requirements and performance needs
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, hashingRounds);
        
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email,
            Password = passwordHash,
            Role = dto.Role,
        };
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateUserAsync(Guid id, UpdateUserDto dto, string? userRole = null)
    {
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null)
        {
            throw new InvalidOperationException("User not found.");
        }
        existingUser.Name = dto.Name ?? existingUser.Name;
        existingUser.Email = dto.Email ?? existingUser.Email;
        // Only update the password if it's not null or empty
        if (!string.IsNullOrEmpty(dto.Password))
        {
            int hashingRounds = 12; // You can adjust this value based on your security requirements and performance needs
            existingUser.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password, hashingRounds);
        }
        
        // Only Admin users can update the IsActive property
        if (userRole == "Admin" && dto.IsActive != null)
        {
            existingUser.IsActive = dto.IsActive.Value;
        }
        
        _context.Users.Update(existingUser);

        await _context.SaveChangesAsync();
    }

    public async Task DeleteUserAsync(Guid id)
    {
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null)
        {
            throw new InvalidOperationException("User not found.");
        }
        _context.Users.Remove(existingUser);
        await _context.SaveChangesAsync();
    }   
}
