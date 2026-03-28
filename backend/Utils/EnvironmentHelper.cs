namespace backend.Utils;
public static class EnvironmentHelper
/* * This class provides helper methods for retrieving environment variables.
 * It ensures that required environment variables are present and throws an exception if any are missing.
    
    methods:
    - GetRequiredVariable(string variableName): Retrieves the value of the specified environment variable. If the variable is not set, it throws an InvalidOperationException with a descriptive message.
    
    parameters:
    - variableName: The name of the environment variable to retrieve.

    returns:
    - The value of the specified environment variable as a string.
 */
{
    public static string GetRequiredVariable(string variableName) =>
        Environment.GetEnvironmentVariable(variableName) 
            ?? throw new InvalidOperationException($"Environment variable '{variableName}' is not configured.");
}
