using Microsoft.EntityFrameworkCore;
using UrlShortener.API.Data;

namespace UrlShortener.API.Services
{
    public class LinkGeneratorService : ILinkGeneratorService
    {
        private readonly AppDbContext _context;
        private const string Chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        private const int CodeLength = 6;

        public LinkGeneratorService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateUniqueCodeAsync()
        {
            var random = new Random();
            string code;
            bool exists;

            do
            {
                code = new string(Enumerable.Range(0, CodeLength)
                    .Select(_ => Chars[random.Next(Chars.Length)])
                    .ToArray());

                exists = await _context.ShortLinks.AnyAsync(l => l.Code == code);
            }
            while (exists);

            return code;
        }

        public bool IsValidUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return false;

            // Trim whitespace
            url = url.Trim();

            // Try to create URI
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uriResult))
                return false;

            // Check if scheme is http or https
            if (uriResult.Scheme != Uri.UriSchemeHttp && uriResult.Scheme != Uri.UriSchemeHttps)
                return false;

            // Check if host is valid (not empty)
            if (string.IsNullOrWhiteSpace(uriResult.Host))
                return false;

            return true;
        }
    }
}
