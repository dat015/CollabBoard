using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace CollabBoard.Domain.Entities
{
    public class RoomParticipant
    {
        public Guid Id { get; set; }
        public Guid RoomId { get; set; }
        public string Role {  get; set; }
        public DateTime JonedAt { get; set; } = DateTime.Now;
        public DateTime? LeftAt { get; set; }

        [ForeignKey(nameof(RoomId))]
        public Room? Room { get; set; }
    }
}
