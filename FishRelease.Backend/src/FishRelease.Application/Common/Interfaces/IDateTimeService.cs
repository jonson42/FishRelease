using System;

namespace FishRelease.Application.Common.Interfaces;

public interface IDateTimeService
{
    DateTime UtcNow { get; }
}
