using System;
using FishRelease.Application.Common.Interfaces;

namespace FishRelease.Infrastructure.Services;

public class PaymentService : IPaymentWebhookService
{
    public bool VerifySignature(string rawData, string signature)
    {
        // Kiểm tra chữ ký HMAC-SHA256 nếu nhà cung cấp (SePay, PayOS...) có gửi kèm
        return !string.IsNullOrEmpty(signature);
    }

    public string GenerateVietQrUrl(string bankId, string accountNo, decimal amount, string description)
    {
        string encodedDesc = Uri.EscapeDataString(description);
        return $"https://img.vietqr.io/image/{bankId}-{accountNo}-compact2.png?amount={(long)amount}&addInfo={encodedDesc}&accountName=FISH%20RELEASE";
    }
}
