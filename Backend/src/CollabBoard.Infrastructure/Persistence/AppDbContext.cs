using CollabBoard.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace CollabBoard.Infrastructure.Persistence
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<BoardElement> Boards { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomAsset> RoomAssets { get; set; }
        public DbSet<RoomParticipant> RoomParticipantAssets { get; set; }
        public DbSet<RoomSnapshot> RoomSnapshots { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // CỰC KỲ QUAN TRỌNG: Dòng này để Identity tạo các bảng AspNetUsers, AspNetRoles...
            // Nếu thiếu dòng này, migration sẽ báo lỗi Key.
            base.OnModelCreating(builder);

            // Apply các file cấu hình (Configuration) nằm trong project này
            builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // (Optional) Đổi tên bảng
            builder.Entity<ApplicationUser>().ToTable("Users");
            builder.Entity<IdentityRole>().ToTable("Roles");
        }

    }
}
