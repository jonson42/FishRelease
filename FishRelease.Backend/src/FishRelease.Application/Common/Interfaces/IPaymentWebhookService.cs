using System.Threading.Tasks;

namespace FishRelease.Application.Common.Interfaces;

public interface IPaymentWebhookService
{
    bool VerifySignature(string rawData, string signature);
    string GenerateVietQrUrl(string bankId, string accountNo, decimal amount, string description);
}
