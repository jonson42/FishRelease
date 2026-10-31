using System;
using System.Threading;
using System.Threading.Tasks;
using FishRelease.Application.Common.Exceptions;
using FishRelease.Application.Common.Interfaces;
using FishRelease.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FishRelease.Application.Features.Tasks.Commands;

public record CreateTikTokTaskCommand(
    string Title,
    string VideoUrl,
    string? Description,
    Guid RewardFishSpeciesId,
    int RewardQuantity,
    int RequiredWatchSeconds
) : IRequest<Guid>;

public class CreateTikTokTaskCommandValidator : AbstractValidator<CreateTikTokTaskCommand>
{
    public CreateTikTokTaskCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Tiêu đề không được để trống.");
        RuleFor(x => x.VideoUrl).NotEmpty().Must(u => Uri.TryCreate(u, UriKind.Absolute, out _))
            .WithMessage("Đường dẫn video TikTok không hợp lệ.");
        RuleFor(x => x.RewardFishSpeciesId).NotEmpty().WithMessage("Vui lòng chọn loại cá thưởng.");
        RuleFor(x => x.RewardQuantity).GreaterThan(0).WithMessage("Số lượng cá thưởng phải > 0.");
        RuleFor(x => x.RequiredWatchSeconds).GreaterThanOrEqualTo(5).WithMessage("Thời gian xem tối thiểu là 5 giây.");
    }
}

public class CreateTikTokTaskCommandHandler : IRequestHandler<CreateTikTokTaskCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateTikTokTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateTikTokTaskCommand request, CancellationToken cancellationToken)
    {
        var species = await _context.FishSpecies
            .FirstOrDefaultAsync(s => s.Id == request.RewardFishSpeciesId, cancellationToken);
        if (species == null)
            throw new NotFoundException(nameof(FishSpecies), request.RewardFishSpeciesId);

        var task = new TikTokTask
        {
            Title = request.Title,
            VideoUrl = request.VideoUrl,
            Description = request.Description,
            RewardFishSpeciesId = request.RewardFishSpeciesId,
            RewardQuantity = request.RewardQuantity,
            RequiredWatchSeconds = request.RequiredWatchSeconds,
            IsActive = true
        };

        _context.TikTokTasks.Add(task);
        await _context.SaveChangesAsync(cancellationToken);

        return task.Id;
    }
}
