using System;
using FishRelease.Application.Common.Interfaces;

namespace FishRelease.Infrastructure.Services;

public class DateTimeService : IDateTimeService
{
    public DateTime UtcNow => DateTime.UtcNow;
}
