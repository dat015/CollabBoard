using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using System.Text.Json;

namespace CollabBoard.Domain.Entities
{
    public class BoardElement
    {
        public Guid Id { get; set; }
        public Guid RoomId { get; set; }
        public string Type { get; set; } // rect, circle, path, text, image
        [Column(TypeName = "jsonb")]
        public JsonDocument? Data { get; set; }
        public int ZIndex { get; set; }
        public bool IsLocked { get; set; }
        public string? LockedBy { get; set; }
        public int Version { get; set; }
        [ForeignKey(nameof(LockedBy))]
        public ApplicationUser? User { get; set; }
        [ForeignKey(nameof(RoomId))]
        public Room? Room { get; set; }
    }
}
