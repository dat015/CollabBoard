using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace CollabBoard.API.Hubs
{
    [Authorize]
    public class BoardHub: Hub<IBoardClient>
    {
        public async Task JoinBoard(string boardId)
        {
            // add user to a group (board)
            await Groups.AddToGroupAsync(Context.ConnectionId, boardId);

            // notify others in the group that a new user has joined
            await Clients.OthersInGroup(boardId).UserJoined(Context.UserIdentifier!);
        }
        public async Task LeaveBoard(string boardId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, boardId);
        }
        public async Task SendShape(string boardId, string shapeData)
        {
            // send shape data to all other clients in the same board
            await Clients.OthersInGroup(boardId).ReceiveShape(shapeData);
        }
        public async Task SendCursor(string boardId, float x, float y)
        {
            await Clients.OthersInGroup(boardId).ReceiveCursor(Context.UserIdentifier!, x, y);
        }
    }
}
