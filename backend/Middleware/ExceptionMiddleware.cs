using System.Net;
using System.Text.Json;

namespace backend.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
/*
    The ExceptionMiddleware class is a custom middleware component for handling exceptions. 
    It intercepts unhandled exceptions that occur during the processing of HTTP requests and provides a centralized mechanism for logging and returning appropriate error responses to the client. 
    The middleware uses dependency injection to access the next middleware in the pipeline and a logger for logging exceptions. 
    When an exception is caught, it logs the error and returns a JSON response containing the status code, a generic error message, and the details of the exception.
    
    - methods:
        InvokeAsync(HttpContext httpContext): This method is called for each HTTP request and is responsible for invoking the next middleware in the pipeline. It wraps the invocation in a try-catch block to catch any unhandled exceptions that may occur during request processing. If an exception is caught, it logs the error and calls the HandleExceptionAsync method to generate an appropriate error response.
        HandleExceptionAsync(HttpContext context, Exception ex): This static method generates a JSON response based on the type of exception caught. It maps specific exception types to corresponding HTTP status codes (e.g., NotFound for KeyNotFoundException, BadRequest for ArgumentException) and constructs a response object containing the status code, a generic error message, and the details of the exception. The response is then serialized to JSON and written to the HTTP response with the appropriate content type and status code.

    - parameters:
        httpContext: An instance of HttpContext representing the current HTTP request and response context.
        ex: The exception that was caught during request processing.
        
    - returns:
        A Task representing the asynchronous operation of handling exceptions and generating an error response.
 */
/*
    The ExceptionMiddleware class is a custom middleware component for handling exceptions. 
    It intercepts unhandled exceptions that occur during the processing of HTTP requests and provides a centralized mechanism for logging and returning appropriate error responses to the client. 
    The middleware uses dependency injection to access the next middleware in the pipeline and a logger for logging exceptions. 
    When an exception is caught, it logs the error and returns a JSON response containing the status code, a generic error message, and the details of the exception.
    
    - methods:
        InvokeAsync(HttpContext httpContext): This method is called for each HTTP request and is responsible for invoking the next middleware in the pipeline. It wraps the invocation in a try-catch block to catch any unhandled exceptions that may occur during request processing. If an exception is caught, it logs the error and calls the HandleExceptionAsync method to generate an appropriate error response.
        HandleExceptionAsync(HttpContext context, Exception ex): This static method generates a JSON response based on the type of exception caught. It maps specific exception types to corresponding HTTP status codes (e.g., NotFound for KeyNotFoundException, BadRequest for ArgumentException) and constructs a response object containing the status code, a generic error message, and the details of the exception. The response is then serialized to JSON and written to the HTTP response with the appropriate content type and status code.

    - parameters:
        httpContext: An instance of HttpContext representing the current HTTP request and response context.
        ex: The exception that was caught during request processing.
        
    - returns:
        A Task representing the asynchronous operation of handling exceptions and generating an error response.
 */
{
    private readonly RequestDelegate _next = next;

    private readonly ILogger<ExceptionMiddleware> _logger = logger;

    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await _next(httpContext);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(httpContext, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var StatusCode = ex switch
        {
            KeyNotFoundException => HttpStatusCode.NotFound,
            ArgumentException => HttpStatusCode.BadRequest,
            InvalidOperationException => HttpStatusCode.BadRequest,
            UnauthorizedAccessException => HttpStatusCode.Unauthorized,
            _ => HttpStatusCode.InternalServerError
        };

         var response = new
        {
            status = (int)StatusCode,
            Message = "An error occurred while processing your request.",
            Details = ex.Message
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}