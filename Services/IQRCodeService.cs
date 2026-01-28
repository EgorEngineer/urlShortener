namespace UrlShortener.API.Services
{
    public interface IQRCodeService
    {
        byte[] GenerateQRCode(string url, int pixelsPerModule = 10);
        string GenerateQRCodeBase64(string url, int pixelsPerModule = 10);
    }
}
