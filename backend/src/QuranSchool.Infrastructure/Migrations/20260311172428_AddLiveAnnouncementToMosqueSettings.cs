using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuranSchool.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLiveAnnouncementToMosqueSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Details",
                table: "UserActionLogs",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "UserActionLogs",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsLiveAnnouncementActive",
                table: "MosqueSettings",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LiveAnnouncementEndDate",
                table: "MosqueSettings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LiveAnnouncementStartDate",
                table: "MosqueSettings",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LiveAnnouncementText",
                table: "MosqueSettings",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Details",
                table: "UserActionLogs");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "UserActionLogs");

            migrationBuilder.DropColumn(
                name: "IsLiveAnnouncementActive",
                table: "MosqueSettings");

            migrationBuilder.DropColumn(
                name: "LiveAnnouncementEndDate",
                table: "MosqueSettings");

            migrationBuilder.DropColumn(
                name: "LiveAnnouncementStartDate",
                table: "MosqueSettings");

            migrationBuilder.DropColumn(
                name: "LiveAnnouncementText",
                table: "MosqueSettings");
        }
    }
}
