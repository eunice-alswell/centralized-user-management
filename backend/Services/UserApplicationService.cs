using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IUserApplicationService
{
   Task AssignUserToApplicationAsync(AssignUserApplicationDto dto);
   Task<IEnumerable<Application>> GetUserApplicationsAsync(Guid userId);
   Task RemoveUserApplicationAsync(Guid userId, Guid applicationId);
}

public class UserApplicationService(AppDBContext context) : IUserApplicationService
/**
    * The UserApplicationService class implements the IUserApplicationService interface and provides the logic for managing user-application relationships. 
    * It uses the AppDBContext to access the database and perform operations related to assigning users to applications, retrieving user applications, and removing user applications. 
    * The service includes methods for assigning a user to an application, retrieving all applications assigned to a specific user, and removing a user's assignment from an application.

    - methods:
        AssignUserToApplicationAsync(AssignUserApplicationDto dto): Assigns a user to an application based on the provided data transfer object (DTO). It checks if the user and application exist, verifies that the user is active, and ensures that the user is not already assigned to the application before creating a new UserApplication record in the database.

        GetUserApplicationsAsync(Guid userId): Retrieves all applications assigned to a specific user based on their user ID. It checks if the user exists and then queries the UserApplications table to return a list of associated applications.

        RemoveUserApplicationAsync(Guid userId, Guid applicationId): Removes a user's assignment from an application based on the provided user ID and application ID. It checks if both the user and application exist, verifies that the user is currently assigned to the application, and then deletes the corresponding UserApplication record from the database.

    - parameters:
        dto: An instance of the AssignUserApplicationDto class containing the necessary information for assigning a user to an application (user ID and application ID).
        userId: A GUID representing the unique identifier of a user.
        applicationId: A GUID representing the unique identifier of an application.

    - returns:
        Task: Represents an asynchronous operation for each method. The AssignUserToApplicationAsync method does not return any data, while GetUserApplicationsAsync returns an IEnumerable of Application objects representing the applications assigned to a specific user.
*/
{
    private readonly AppDBContext _context = context;

    public async Task AssignUserToApplicationAsync(AssignUserApplicationDto dto)
    {
        var user = await _context.Users.FindAsync(dto.UserId) 
            ?? throw new InvalidOperationException("User not found.");
            
        var application = await _context.Applications.FindAsync(dto.ApplicationId) 
            ?? throw new InvalidOperationException("Application not found.");

        var userDeactivated = user.IsActive == false;
        if (userDeactivated) throw new InvalidOperationException("Cannot assign application to deactivated user.");


        //check if the user is already assigned to the application
        var existingAssignment = await _context.UserApplications
            .FirstOrDefaultAsync(ua => ua.UserId == dto.UserId && ua.ApplicationId == dto.ApplicationId);

        if (existingAssignment != null) throw new InvalidOperationException("User is already assigned to this application.");

        var userApplication = new UserApplication
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            ApplicationId = dto.ApplicationId

        };

        await _context.UserApplications.AddAsync(userApplication);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Application>> GetUserApplicationsAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId) ?? throw new InvalidOperationException("User not found.");

        var applications = await _context.UserApplications
            .Where(ua => ua.UserId == userId)
            .Include(ua => ua.Application)
            .Select(ua => ua.Application!)
            .ToListAsync();

        return applications;
    }

    public async Task RemoveUserApplicationAsync(Guid userId, Guid applicationId)
    {
        var user = await _context.Users.FindAsync(userId) ?? throw new InvalidOperationException("User not found.");

        var application = await _context.Applications.FindAsync(applicationId) ?? throw new InvalidOperationException("Application not found.");

        var userApplication = await _context.UserApplications
            .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.ApplicationId == applicationId) 
            ?? throw new InvalidOperationException("User is not assigned to this application.");

        _context.UserApplications.Remove(userApplication);
        await _context.SaveChangesAsync();
    }
}