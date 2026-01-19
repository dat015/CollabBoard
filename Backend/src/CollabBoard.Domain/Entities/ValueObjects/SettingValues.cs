using System;
using System.Collections.Generic;
using System.Text;

namespace CollabBoard.Domain.Entities.ValueObjects
{
    public class SettingValues
    {
        public bool AllowGuest { get; set; } = true;
        public bool RecordMetting { get; set; } = false;
        public bool MuteAllOnEntry { get; set; } = true;
    }
}
