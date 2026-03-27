using DotNetEnv;

//Load environment variables from .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

var DBhost = Environment.GetEnvironmentVariable("DATABASE_HOST");
var DBport = Environment.GetEnvironmentVariable("DATABASE_PORT");
var DBname = Environment.GetEnvironmentVariable("DATABASE_NAME");
var DBuser = Environment.GetEnvironmentVariable("DATABASE_USER");
var DBpassword = Environment.GetEnvironmentVariable("DATABASE_PASSWORD");

var connectionString = $"Host={DBhost};Port={DBport};Database={DBname};Username={DBuser};Password={DBpassword}";


// Add services to the container.


var app = builder.Build();

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
    
// }

// app.UseHttpsRedirection();

app.MapGet("/", ()=> "Hello World!");

app.Run();
