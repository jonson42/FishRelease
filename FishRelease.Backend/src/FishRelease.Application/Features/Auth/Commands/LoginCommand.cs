using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Exceptions;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Application.Features.Auth.DTOs;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Auth.Commands;

public record LoginCommand(string Username, string Password) : IRequest<AuthResponseDto>;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Username).NotEmpty().WithMessage("Tên đăng nhập không được để trống.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Mật khẩu không được để trống.");
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IDateTimeService _dateTimeService;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IJwtTokenGenerator jwtTokenGenerator,
        IDateTimeService dateTimeService)
    {
        _context = context;
        _jwtTokenGenerator = jwtTokenGenerator;
        _dateTimeService = dateTimeService;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower(), cancellationToken);

        if (user == null || user.PasswordHash != HashPassword(request.Password))
        {
            throw new BadRequestException("Tên đăng nhập hoặc mật khẩu không chính xác.");
        }

        // Kiểm tra và cấp phát lại 10 con cá miễn phí nếu sang ngày mới
        var now = _dateTimeService.UtcNow;
        if (user.LastFreeFishClaimDate.Date < now.Date)
        {
            user.FreeFishQuotaToday = 10;
            user.LastFreeFishClaimDate = now.Date;
            await _context.SaveChangesAsync(cancellationToken);
        }

        var token = _jwtTokenGenerator.GenerateToken(user);

        return new AuthResponseDto(
            user.Id,
            user.Username,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.WalletBalance,
            user.FreeFishQuotaToday,
            token
        );
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}
