using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UrlShortener.API.Data;
using UrlShortener.API.Services;

namespace UrlShortener.API.Controllers
{
    [ApiController]
    public class RedirectController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ICacheService _cache;

        public RedirectController(AppDbContext context, ICacheService cache)
        {
            _context = context;
            _cache = cache;
        }

        [HttpGet("/{code}")]
        public async Task<IActionResult> Redirect(string code)
        {
            var cacheKey = $"link:{code}";
            var cachedLink = await _cache.GetAsync<CachedLink>(cacheKey);

            if (cachedLink != null)
            {
                if (cachedLink.ExpiresAt.HasValue && cachedLink.ExpiresAt.Value < DateTime.UtcNow)
                {
                    await _cache.RemoveAsync(cacheKey);
                    return StatusCode(410, "This link has expired");
                }

                if (cachedLink.MaxClicks.HasValue && cachedLink.Clicks >= cachedLink.MaxClicks.Value)
                {
                    await _cache.RemoveAsync(cacheKey);
                    return StatusCode(403, "This link has reached its click limit");
                }

                _ = Task.Run(async () =>
                {
                    try
                    {
                        var link = await _context.ShortLinks.FirstOrDefaultAsync(l => l.Code == code);
                        if (link != null)
                        {
                            link.Clicks++;
                            await _context.SaveChangesAsync();
                        }
                    }
                    catch { /* Log error in production */ }
                });

                return base.Redirect(cachedLink.OriginalUrl);
            }

            var shortLink = await _context.ShortLinks
                .FirstOrDefaultAsync(l => l.Code == code);

            if (shortLink == null)
            {
                return NotFound("Short link not found");
            }

            if (shortLink.ExpiresAt.HasValue && shortLink.ExpiresAt.Value < DateTime.UtcNow)
            {
                return StatusCode(410, "This link has expired");
            }

            if (shortLink.MaxClicks.HasValue && shortLink.Clicks >= shortLink.MaxClicks.Value)
            {
                return StatusCode(403, "This link has reached its click limit");
            }

            var linkToCache = new CachedLink
            {
                OriginalUrl = shortLink.OriginalUrl,
                Clicks = shortLink.Clicks,
                ExpiresAt = shortLink.ExpiresAt,
                MaxClicks = shortLink.MaxClicks
            };

            var cacheExpiration = shortLink.ExpiresAt.HasValue
                ? shortLink.ExpiresAt.Value - DateTime.UtcNow
                : TimeSpan.FromMinutes(30);

            await _cache.SetAsync(cacheKey, linkToCache, cacheExpiration);

            shortLink.Clicks++;
            await _context.SaveChangesAsync();

            return base.Redirect(shortLink.OriginalUrl);
        }
    }

    public class CachedLink
    {
        public string OriginalUrl { get; set; } = string.Empty;
        public int Clicks { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public int? MaxClicks { get; set; }
    }
}
