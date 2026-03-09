using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace QuranSchool.Infrastructure.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var schoolId = Context.User?.FindFirst("SchoolId")?.Value;
        if (!string.IsNullOrEmpty(schoolId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"School_{schoolId}");
        }
        
        await base.OnConnectedAsync();
    }

    public async Task JoinUserGroup(string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
    }

    public async Task JoinSessionGroup(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Session_{sessionId}");
    }

    public async Task SyncMushafState(string sessionId, object state)
    {
        var isTeacher = Context.User?.IsInRole("Teacher") == true || Context.User?.IsInRole("Admin") == true;
        if (!isTeacher) return;

        await Clients.OthersInGroup($"Session_{sessionId}").SendAsync("MushafStateUpdated", state);
    }
}
