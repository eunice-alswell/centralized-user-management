using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IApplicationService
{
    Task<IEnumerable<Application>> GetAllApplicationsAsync();
}

public class ApplicationService : IApplicationService
/*
    The ApplicationService class implements the IApplicationService interface and provides the logic for retrieving application data from the database. 
    It uses the AppDBContext to access the Applications table and includes related UserApplications data. 
    The GetAllApplicationsAsync method retrieves all applications along with their associated user applications asynchronously and returns them as an IEnumerable of Application objects.

    - methods:
        GetAllApplicationsAsync(): Retrieves all applications from the database, including their associated user applications, and returns them as an IEnumerable of Application objects.

    - parameters: None
    
    - returns:
        IEnumerable<Application>: A collection of Application objects representing all applications in the database, including their associated user applications.
*/
{
    private readonly AppDBContext _context;

    public ApplicationService(AppDBContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Application>> GetAllApplicationsAsync()
    {
        return await _context.Applications
            .Include(a => a.UserApplications)
            .ToListAsync();
    }
}
