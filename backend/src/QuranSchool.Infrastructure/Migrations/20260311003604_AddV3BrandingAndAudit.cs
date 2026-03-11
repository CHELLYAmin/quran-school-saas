using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuranSchool.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddV3BrandingAndAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FaviconUrl",
                table: "Schools",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryColor",
                table: "Schools",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondaryColor",
                table: "Schools",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tagline",
                table: "Schools",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserActionLogs_SchoolId",
                table: "UserActionLogs",
                column: "SchoolId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserActionLogs_Schools_SchoolId",
                table: "UserActionLogs",
                column: "SchoolId",
                principalTable: "Schools",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserActionLogs_Schools_SchoolId",
                table: "UserActionLogs");

            migrationBuilder.DropIndex(
                name: "IX_UserActionLogs_SchoolId",
                table: "UserActionLogs");

            migrationBuilder.DropColumn(
                name: "FaviconUrl",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "PrimaryColor",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "SecondaryColor",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "Tagline",
                table: "Schools");
        }
    }
}
