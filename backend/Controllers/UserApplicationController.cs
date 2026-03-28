using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/userapplication")]
[Authorize]
public class UserApplicationController(IUserApplicationService userApplicationService) : ControllerBase
/*
    The UserApplicationController class is an API controller that handles HTTP requests related to user-application relationships. It provides endpoints for assigning users to applications, retrieving applications assigned to a specific user, and removing user-application assignments. The controller uses the IUserApplicationService to perform the necessary operations and includes appropriate error handling for various scenarios.
    - endpoints:
        POST /api/UserApplication/assign: Assigns a user to an application based on the provided AssignUserApplicationDto. This endpoint is restricted to users with the "Admin" role.
        GET /api/UserApplication/user/{userId}: Retrieves all applications assigned to a specific user identified by their userId.
        DELETE /api/UserApplication/user/{userId}/application/{applicationId}: Removes the assignment of a user from a specific application identified by their userId and applicationId. This endpoint is restricted to users with the "Admin" role.
    - error handling:
        The controller includes error handling for InvalidOperationException and general exceptions, returning appropriate HTTP status codes and messages in case of errors.
*/

{
    private readonly IUserApplicationService _userApplicationService = userApplicationService;

    [HttpPost("assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignUserToApplication(AssignUserApplicationDto dto)
    {
        try
        {
            await _userApplicationService.AssignUserToApplicationAsync(dto);
            return Ok(new { message = "User assigned to application successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserApplications(Guid userId)
    {
        try
        {
            // Check authorization: User can only view their own apps or admin can view any
            var isAdmin = User.IsInRole("Admin");
            var currentUserIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (!isAdmin && currentUserIdClaim != userId.ToString())
            {
                return Forbid();
            }

            var applications = await _userApplicationService.GetUserApplicationsAsync(userId);
            return Ok(new 
            { 
                message = "Applications retrieved successfully",
                data = applications 
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpDelete("user/{userId}/application/{applicationId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveUserApplication(Guid userId, Guid applicationId)
    {
        try
        {
            await _userApplicationService.RemoveUserApplicationAsync(userId, applicationId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
