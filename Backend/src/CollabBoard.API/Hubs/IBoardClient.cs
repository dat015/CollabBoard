using CollabBoard.Application.DTOs.Hub;

namespace CollabBoard.API.Hubs;

public interface IBoardClient
{
    // Server bắn xuống Client: "Có ai đó vừa vẽ hình mới"
    Task ReceiveShape(object shape);

    // Server bắn xuống Client: "Có ai đó vừa di chuyển chuột" (để hiện con trỏ tên User)
    Task ReceiveCursor(string userId, float x, float y);

    // Server bắn xuống Client: "User này vừa vào phòng"
    Task UserJoined(UserCursorDto user);
    Task CursorMoved(string userId, double x, double y);
    Task ShapesDeleted(List<string> ids);   
}