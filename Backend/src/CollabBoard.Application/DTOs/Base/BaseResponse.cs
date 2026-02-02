using System;
using System.Collections.Generic;
using System.Text;

namespace CollabBoard.Application.DTOs.Base
{
    public record BaseResponse<T>
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
        public T? Data { get; init; }
        public string? ErrorCode { get; init; }

        public static BaseResponse<T> Ok(T data, string message = "Success")
            => new()
            {
                Success = true,
                Message = message,
                Data = data
            };

        public static BaseResponse<T> Fail(string message, string? errorCode = null)
            => new()
            {
                Success = false,
                Message = message,
                ErrorCode = errorCode
            };
    }

}
