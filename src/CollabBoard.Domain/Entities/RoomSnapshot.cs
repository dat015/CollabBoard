using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using System.Text.Json;

namespace CollabBoard.Domain.Entities
{
    public class RoomSnapshot
    {
        public Guid Id { get; set; }
        public Guid RoomId { get; set; }
        [Column(TypeName = "jsonb")]
        public JsonDocument? Data { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        [ForeignKey(nameof(RoomId))]
        public Room? Room { get; set; }
    }
}
