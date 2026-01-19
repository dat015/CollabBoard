using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace CollabBoard.Domain.Entities
{
    public class ChatMessage
    {
        public Guid Id { get; set; }
        public Guid RoomId { get; set; }
        public string SenderId { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; } = DateTime.Now;
        [ForeignKey(nameof(RoomId))]
        public Room? Room { get; set; }
        [ForeignKey(nameof(SenderId))]
        public ApplicationUser? User { get; set; }
    }
}
