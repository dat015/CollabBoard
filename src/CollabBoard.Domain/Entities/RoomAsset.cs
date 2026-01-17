using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace CollabBoard.Domain.Entities
{
    public class RoomAsset
    {
        public Guid Id { get; set; }
        public Guid RoomId { get; set; }
        public string UploaderId { get; set; }
        public string Url { get; set; }
        public string Type { get; set; } // image/png  ,  application/pdf
        [ForeignKey(nameof(UploaderId))]
        public ApplicationUser? User { get; set; }
        [ForeignKey(nameof(RoomId))]
        public Room? Room { get; set; }

    }
}
