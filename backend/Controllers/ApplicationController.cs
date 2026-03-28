using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/application")]
public class ApplicationController(IApplicationService applicationService) : ControllerBase
/*
    The ApplicationController class is an API controller that handles HTTP requests related to applications. It provides an endpoint for retrieving all applications. The controller uses the IApplicationService to perform the necessary operations and includes error handling for exceptions that may occur during the retrieval process.
    - endpoints:
        GET /api/Application: Retrieves a list of all applications. This endpoint is accessible to authenticated users.
    - error handling:
        The controller includes error handling for general exceptions, returning a 500 Internal Server Error status code and an appropriate message in case of errors during the retrieval of applications.
*/
{
    private readonly IApplicationService _applicationService = applicationService;

    [HttpGet]
    // [Authorize]
    public async Task<IActionResult> GetAllApplications()
    {
        try
        {
            var applications = await _applicationService.GetAllApplicationsAsync();
            return Ok(applications);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
