namespace UrlShortener.API.Models
{
    public class ShortLink
    {
        public int Id { get; set; }
        public string OriginalUrl { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int Clicks { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public int? MaxClicks { get; set; }
        
        public int? UserId { get; set; }
        public User? User { get; set; }
    }
}
