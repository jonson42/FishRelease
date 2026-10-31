using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Exceptions;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Application.Features.Auth.DTOs;
using FishRelease.Domain.Entities;
using FishRelease.Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Auth.Commands;

public record RegisterCommand(
    string Username,
    string Password,
    string FullName,
    string Email
) : IRequest<AuthResponseDto>;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Username).NotEmpty().MinimumLength(3).MaximumLength(50);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IDateTimeService _dateTimeService;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        IJwtTokenGenerator jwtTokenGenerator,
        IDateTimeService dateTimeService)
    {
        _context = context;
        _jwtTokenGenerator = jwtTokenGenerator;
        _dateTimeService = dateTimeService;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _context.Users
            .AnyAsync(u => u.Username.ToLower() == request.Username.ToLower() || u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (existingUser)
        {
            throw new BadRequestException("Tên đăng nhập hoặc email đã tồn tại trên hệ thống.");
        }

        var now = _dateTimeService.UtcNow;
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            FullName = request.FullName,
            PasswordHash = HashPassword(request.Password),
            Role = UserRole.User,
            WalletBalance = 50, // Tặng khởi nghiệp 50 xu
            FreeFishQuotaToday = 10,
            LastFreeFishClaimDate = now.Date
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

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
