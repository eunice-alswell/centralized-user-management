using DotNetEnv;
using backend.Utils;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Controllers;
using backend.Services;
using backend.Middleware;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;



//Load environment variables from .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Build the database connection string using environment variables
var DBhost = EnvironmentHelper.GetRequiredVariable("DATABASE_HOST");
var DBport = EnvironmentHelper.GetRequiredVariable("DATABASE_PORT");
var DBname = EnvironmentHelper.GetRequiredVariable("DATABASE_NAME");
var DBuser = EnvironmentHelper.GetRequiredVariable("DATABASE_USER");
var DBpassword = EnvironmentHelper.GetRequiredVariable("DATABASE_PASSWORD");

var connectionString = $"Host={DBhost};Port={DBport};Database={DBname};Username={DBuser};Password={DBpassword}";

builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
{
    { "ConnectionStrings:DefaultConnection", connectionString }
});


// Add services to the container.
builder.Services.AddDbContext<AppDBContext>( options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);
builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddScoped<ILoginService, LoginService>();
builder.Services.AddScoped<IUserApplicationService, UserApplicationService>();

// Configure JWT Authentication
var jwtSecret = EnvironmentHelper.GetRequiredVariable("JWT_SECRET");
var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Configure CORS to allow requests from the React frontend
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
    
});


var app = builder.Build();

// Configure the HTTP request pipeline.

// Test database connection on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDBContext>();
    try
    {
        await db.Database.CanConnectAsync();
        Console.WriteLine("Successfully connected to the database.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Failed to connect to the database: {ex.Message}");
    }
}

if (app.Environment.IsDevelopment())
{ 
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("AllowReact");
app.UseAuthentication();
app.UseAuthorization();

// Configure OpenAPI for JWT Bearer
app.MapOpenApi();

app.MapControllers();

app.Run();
