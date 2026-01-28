using UrlShortener.API.Models;

namespace UrlShortener.API.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        int? ValidateToken(string token);
    }
}

