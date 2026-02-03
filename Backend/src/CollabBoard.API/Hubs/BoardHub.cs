using CollabBoard.Application.DTOs.Hub;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CollabBoard.API.Hubs
{
    [Authorize]
    public class BoardHub: Hub<IBoardClient>
    {
        public async Task JoinBoard(string boardId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, boardId);
            var userInfo = new UserCursorDto
            {
                Id = Context.ConnectionId,
                Name = Context.User?.Identity?.Name ?? "Unknown User",
                Color = GetRandomColor()
            };

            await Clients.OthersInGroup(boardId).UserJoined(userInfo);
        }
        public async Task LeaveBoard(string boardId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, boardId);
        }
        public async Task SendShape(string boardId, object shape)
        {
            // send shape data to all other clients in the same board
            await Clients.OthersInGroup(boardId).ReceiveShape(shape);
        }
        public async Task SendCursor(string boardId, float x, float y)
        {
            await Clients.OthersInGroup(boardId).ReceiveCursor(Context.UserIdentifier!, x, y);
        }
        public async Task MoveCursor(string boardId, double x, double y)
        {
            await Clients.OthersInGroup(boardId).CursorMoved(Context.ConnectionId, x, y);
        }
        private string GetRandomColor()
        {
            var colors = new[] { "#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF33A8", "#33FFF5" };
            return colors[new Random().Next(colors.Length)];
        }
    }
}
