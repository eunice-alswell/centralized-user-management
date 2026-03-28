using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

/// <summary>
/// AppDBContext is the Entity Framework Core database context for the Centralized User Management application.
/// It manages the persistence and relationship configurations between User, Application, and UserApplication entities.
/// </summary>
public class AppDBContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the AppDBContext class.
    /// </summary>
    /// <param name="options">The options for configuring the DbContext.</param>
    public AppDBContext(DbContextOptions<AppDBContext> options) : base(options) {}

    /// <summary>
    /// Gets the Users DbSet containing all user entities.
    /// </summary>
    public DbSet<User> Users => Set<User>();

    /// <summary>
    /// Gets the Applications DbSet containing all application entities.
    /// </summary>
    public DbSet<Application> Applications => Set<Application>();

    /// <summary>
    /// Gets the UserApplications DbSet containing the many-to-many relationship between users and applications.
    /// </summary>
    public DbSet<UserApplication> UserApplications => Set<UserApplication>();

    /// <summary>
    /// Configures the relationships between User, Application, and UserApplication entities.
    /// Sets up foreign keys, table names, and unique constraints for data integrity.
    /// </summary>
    /// <param name="modelBuilder">The model builder used to configure entity mappings.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .ToTable("users")
            .HasMany(u => u.UserApplications)
            .WithOne(ua => ua.User)
            .HasForeignKey(ua => ua.UserId);

        modelBuilder.Entity<Application>()
            .ToTable("applications")
            .HasMany(a => a.UserApplications)
            .WithOne(ua => ua.Application)
            .HasForeignKey(ua => ua.ApplicationId);
            
        modelBuilder.Entity<UserApplication>()
            .ToTable("user_applications")
            .HasIndex(ua => new { ua.UserId, ua.ApplicationId })
            .IsUnique();

        // Seed default applications
        modelBuilder.Entity<Application>().HasData(
            new Application 
            { 
                Id = new Guid("550e8400-e29b-41d4-a716-446655440000"),
                Name = "HR",
                Description = "Human Resources Management System",
                CreatedAt = new DateTime(2026, 3, 27, 0, 0, 0, DateTimeKind.Utc)
            },
            new Application 
            { 
                Id = new Guid("550e8400-e29b-41d4-a716-446655440001"),
                Name = "Accounting",
                Description = "Accounting and Finance Management System",
                CreatedAt = new DateTime(2026, 3, 27, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }


}
