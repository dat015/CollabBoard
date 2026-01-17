using CollabBoard.Domain.Entities.ValueObjects;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace CollabBoard.Domain.Entities
{
    public class Room
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public string HostUserId { get; set; }
        public bool IsActived { get; set; }
        [Column(TypeName = "jsonb")]
        public SettingValues Settings { get; set; }
        public string VideoProviderId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        [ForeignKey(nameof(HostUserId))]
        public ApplicationUser? User { get; set; }
    }
}
