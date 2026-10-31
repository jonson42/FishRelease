using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using FishRelease.Application.Common.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace FishRelease.WebApi.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Đã xảy ra lỗi không mong muốn trong HTTP Pipeline.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            success = false,
            message = exception.Message,
            errors = (object?)null
        };

        switch (exception)
        {
            case ValidationException valEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    success = false,
                    message = "Dữ liệu yêu cầu không hợp lệ.",
                    errors = (object?)valEx.Errors
                };
                break;

            case NotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                break;

            case BadRequestException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response = new
                {
                    success = false,
                    message = "Đã xảy ra lỗi hệ thống! Vui lòng thử lại sau.",
                    errors = (object?)null
                };
                break;
        }

        var json = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(json);
    }
}
