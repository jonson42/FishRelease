using System;
using System.Collections.Generic;
using System.Linq;

namespace FishRelease.Application.Common.Exceptions;

public class AppException : Exception
{
    public AppException(string message) : base(message) { }
}

public class NotFoundException : AppException
{
    public NotFoundException(string name, object key)
        : base($"Entity \"{name}\" ({key}) không tồn tại.") { }
}

public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message) { }
}

public class ValidationException : AppException
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(IEnumerable<FluentValidation.Results.ValidationFailure> failures)
        : base("Đã xảy ra một hoặc nhiều lỗi xác thực dữ liệu.")
    {
        Errors = failures
            .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
            .ToDictionary(failureGroup => failureGroup.Key, failureGroup => failureGroup.ToArray());
    }
}
