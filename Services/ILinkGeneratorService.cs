namespace UrlShortener.API.Services
{
    public interface ILinkGeneratorService
    {
        Task<string> GenerateUniqueCodeAsync();
        bool IsValidUrl(string url);
    }
}
