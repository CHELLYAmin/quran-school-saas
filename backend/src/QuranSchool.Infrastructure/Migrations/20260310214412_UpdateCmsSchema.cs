using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuranSchool.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCmsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BlocksJson",
                table: "CmsPages",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Icon",
                table: "CmsPages",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystemPage",
                table: "CmsPages",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MetaImage",
                table: "CmsPages",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SeoDescription",
                table: "CmsPages",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SeoTitle",
                table: "CmsPages",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ShowInMenu",
                table: "CmsPages",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BlocksJson",
                table: "CmsPages");

            migrationBuilder.DropColumn(
                name: "Icon",
                table: "CmsPages");

            migrationBuilder.DropColumn(
                name: "IsSystemPage",
                table: "CmsPages");

            migrationBuilder.DropColumn(
                name: "MetaImage",
                table: "CmsPages");

            migrationBuilder.DropColumn(
                name: "SeoDescription",
                table: "CmsPages");

            migrationBuilder.DropColumn(
                name: "SeoTitle",
                table: "CmsPages");

            migrationBuilder.DropColumn(
                name: "ShowInMenu",
                table: "CmsPages");
        }
    }
}
