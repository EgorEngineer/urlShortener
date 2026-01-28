using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using UrlShortener.API.Data;
using UrlShortener.API.Models;
using UrlShortener.API.Services;

namespace UrlShortener.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LinksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILinkGeneratorService _linkGenerator;
        private readonly IQRCodeService _qrCodeService;

        public LinksController(
            AppDbContext context,
            ILinkGeneratorService linkGenerator,
            IQRCodeService qrCodeService)
        {
            _context = context;
            _linkGenerator = linkGenerator;
            _qrCodeService = qrCodeService;
        }

        [HttpPost]
        public async Task<ActionResult<ShortLinkResponse>> CreateShortLink([FromBody] CreateLinkRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.OriginalUrl))
                {
                    return BadRequest(new { error = "URL не может быть пустым" });
                }

                // Trim the URL
                var originalUrl = request.OriginalUrl.Trim();

                if (!_linkGenerator.IsValidUrl(originalUrl))
                {
                    return BadRequest(new { error = "Неверный формат URL. Убедитесь, что URL начинается с http:// или https://" });
                }

                // Check URL length
                if (originalUrl.Length > 2048)
                {
                    return BadRequest(new { error = "URL слишком длинный. Максимальная длина: 2048 символов" });
                }

                var code = await _linkGenerator.GenerateUniqueCodeAsync();

                // Get user ID if authenticated
                int? userId = GetUserIdFromClaims();

                var shortLink = new ShortLink
                {
                    OriginalUrl = originalUrl,
                    Code = code,
                    CreatedAt = DateTime.UtcNow,
                    Clicks = 0,
                    UserId = userId
                };

                _context.ShortLinks.Add(shortLink);
                await _context.SaveChangesAsync();

                var shortUrl = $"{Request.Scheme}://{Request.Host}/{code}";
                var qrCodeBase64 = _qrCodeService.GenerateQRCodeBase64(shortUrl);

                return Ok(new ShortLinkResponse
                {
                    Id = shortLink.Id,
                    OriginalUrl = shortLink.OriginalUrl,
                    ShortUrl = shortUrl,
                    Code = code,
                    CreatedAt = shortLink.CreatedAt,
                    QRCode = $"data:image/png;base64,{qrCodeBase64}"
                });
            }
            catch (Exception ex)
            {
                // Log the exception (you might want to add proper logging here)
                Console.WriteLine($"Error creating short link: {ex.Message}");
                return StatusCode(500, new { error = "Произошла ошибка при создании короткой ссылки" });
            }
        }

        [HttpGet("{code}")]
        public async Task<ActionResult<ShortLink>> GetLink(string code)
        {
            var link = await _context.ShortLinks.FirstOrDefaultAsync(l => l.Code == code);

            if (link == null)
            {
                return NotFound();
            }

            return Ok(link);
        }

        [HttpGet("{code}/qr")]
        public async Task<IActionResult> GetQRCode(string code)
        {
            var link = await _context.ShortLinks.FirstOrDefaultAsync(l => l.Code == code);

            if (link == null)
            {
                return NotFound();
            }

            var shortUrl = $"{Request.Scheme}://{Request.Host}/{code}";
            var qrBytes = _qrCodeService.GenerateQRCode(shortUrl, 10);

            return File(qrBytes, "image/png");
        }

        [Authorize]
        [HttpGet("my-links")]
        public async Task<ActionResult<List<ShortLinkDto>>> GetMyLinks()
        {
            try
            {
                var userId = GetUserIdFromClaims();
                if (userId == null)
                {
                    return Unauthorized();
                }

                var links = await _context.ShortLinks
                    .Where(l => l.UserId == userId)
                    .OrderByDescending(l => l.CreatedAt)
                    .Select(l => new ShortLinkDto
                    {
                        Id = l.Id,
                        OriginalUrl = l.OriginalUrl,
                        Code = l.Code,
                        ShortUrl = $"{Request.Scheme}://{Request.Host}/{l.Code}",
                        CreatedAt = l.CreatedAt,
                        Clicks = l.Clicks,
                        ExpiresAt = l.ExpiresAt,
                        MaxClicks = l.MaxClicks
                    })
                    .ToListAsync();

                return Ok(links);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user links: {ex.Message}");
                return StatusCode(500, new { error = "Произошла ошибка при получении ссылок" });
            }
        }

        private int? GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return null;
        }
    }

    public class ShortLinkDto
    {
        public int Id { get; set; }
        public string OriginalUrl { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string ShortUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int Clicks { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public int? MaxClicks { get; set; }
    }
    public class CreateLinkRequest
    {
        public string OriginalUrl { get; set; } = string.Empty;
    }

    public class ShortLinkResponse
    {
        public int Id { get; set; }
        public string OriginalUrl { get; set; } = string.Empty;
        public string ShortUrl { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string QRCode { get; set; } = string.Empty;
    }
}