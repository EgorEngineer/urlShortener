using QRCoder;

namespace UrlShortener.API.Services
{
    public class QRCodeService : IQRCodeService
    {
        public byte[] GenerateQRCode(string url, int pixelsPerModule = 10)
        {
            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);
            return qrCode.GetGraphic(pixelsPerModule);
        }

        public string GenerateQRCodeBase64(string url, int pixelsPerModule = 10)
        {
            var qrBytes = GenerateQRCode(url, pixelsPerModule);
            return Convert.ToBase64String(qrBytes);
        }
    }
}
