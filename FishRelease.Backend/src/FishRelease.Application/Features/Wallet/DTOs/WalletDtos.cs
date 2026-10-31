using System;

namespace FishRelease.Application.Features.Wallet.DTOs;

public record TopUpQrDto(
    string TransactionCode,
    decimal AmountVnd,
    decimal CoinsToReceive,
    string QrImageUrl,
    string BankName,
    string AccountNumber,
    string AccountName,
    string TransferContent
);

public record PaymentWebhookPayload(
    string Gateway,
    string TransactionCode,
    decimal Amount,
    string Content,
    string? Signature,
    string? RawJson
);
