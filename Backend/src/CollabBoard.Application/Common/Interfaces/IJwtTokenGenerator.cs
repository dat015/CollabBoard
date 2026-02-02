using CollabBoard.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace CollabBoard.Application.Common.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(ApplicationUser user);
        string GenerateRefreshToken();
    }

}
