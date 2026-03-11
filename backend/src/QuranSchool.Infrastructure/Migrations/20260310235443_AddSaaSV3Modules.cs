using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuranSchool.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSaaSV3Modules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DonorProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    FullName = table.Column<string>(maxLength: 200, nullable: false),
                    Email = table.Column<string>(nullable: true),
                    Phone = table.Column<string>(nullable: true),
                    Address = table.Column<string>(nullable: true),
                    IsRecurring = table.Column<bool>(nullable: false),
                    InternalNote = table.Column<string>(nullable: true),
                    SchoolId = table.Column<Guid>(nullable: false),
                    CreatedAt = table.Column<DateTime>(nullable: false),
                    UpdatedAt = table.Column<DateTime>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonorProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DonorProfiles_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FinancialProjects",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Name = table.Column<string>(maxLength: 200, nullable: false),
                    Description = table.Column<string>(nullable: true),
                    Budget = table.Column<decimal>(precision: 18, scale: 2, nullable: false),
                    StartDate = table.Column<DateTime>(nullable: true),
                    EndDate = table.Column<DateTime>(nullable: true),
                    IsActive = table.Column<bool>(nullable: false),
                    SchoolId = table.Column<Guid>(nullable: false),
                    CreatedAt = table.Column<DateTime>(nullable: false),
                    UpdatedAt = table.Column<DateTime>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialProjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinancialProjects_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StaffAbsences",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UserId = table.Column<Guid>(nullable: false),
                    Type = table.Column<string>(nullable: false),
                    StartDate = table.Column<DateTime>(nullable: false),
                    EndDate = table.Column<DateTime>(nullable: false),
                    Reason = table.Column<string>(nullable: true),
                    IsValidated = table.Column<bool>(nullable: false),
                    SchoolId = table.Column<Guid>(nullable: false),
                    CreatedAt = table.Column<DateTime>(nullable: false),
                    UpdatedAt = table.Column<DateTime>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffAbsences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StaffAbsences_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StaffAbsences_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StaffContracts",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UserId = table.Column<Guid>(nullable: false),
                    Type = table.Column<string>(nullable: false),
                    Salary = table.Column<decimal>(precision: 18, scale: 2, nullable: true),
                    StartDate = table.Column<DateTime>(nullable: false),
                    EndDate = table.Column<DateTime>(nullable: true),
                    Status = table.Column<string>(nullable: false),
                    DocumentUrl = table.Column<string>(nullable: true),
                    SchoolId = table.Column<Guid>(nullable: false),
                    CreatedAt = table.Column<DateTime>(nullable: false),
                    UpdatedAt = table.Column<DateTime>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffContracts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StaffContracts_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StaffContracts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TransactionCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Name = table.Column<string>(maxLength: 100, nullable: false),
                    Type = table.Column<int>(nullable: false),
                    Icon = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    SchoolId = table.Column<Guid>(nullable: false),
                    CreatedAt = table.Column<DateTime>(nullable: false),
                    UpdatedAt = table.Column<DateTime>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransactionCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransactionCategories_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FinancialTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    Amount = table.Column<decimal>(precision: 18, scale: 2, nullable: false),
                    Date = table.Column<DateTime>(nullable: false),
                    Type = table.Column<string>(nullable: false),
                    PaymentMethod = table.Column<string>(nullable: false),
                    Reference = table.Column<string>(nullable: true),
                    Note = table.Column<string>(nullable: true),
                    AttachmentUrl = table.Column<string>(nullable: true),
                    SchoolId = table.Column<Guid>(nullable: false),
                    CategoryId = table.Column<Guid>(nullable: false),
                    ProjectId = table.Column<Guid>(nullable: true),
                    DonorId = table.Column<Guid>(nullable: true),
                    CreatedAt = table.Column<DateTime>(nullable: false),
                    UpdatedAt = table.Column<DateTime>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinancialTransactions_DonorProfiles_DonorId",
                        column: x => x.DonorId,
                        principalTable: "DonorProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_FinancialTransactions_FinancialProjects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "FinancialProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_FinancialTransactions_Schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "Schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FinancialTransactions_TransactionCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "TransactionCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DonorProfiles_SchoolId",
                table: "DonorProfiles",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialProjects_SchoolId",
                table: "FinancialProjects",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialTransactions_CategoryId",
                table: "FinancialTransactions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialTransactions_DonorId",
                table: "FinancialTransactions",
                column: "DonorId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialTransactions_ProjectId",
                table: "FinancialTransactions",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialTransactions_SchoolId",
                table: "FinancialTransactions",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffAbsences_SchoolId",
                table: "StaffAbsences",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffAbsences_UserId",
                table: "StaffAbsences",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffContracts_SchoolId",
                table: "StaffContracts",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffContracts_UserId",
                table: "StaffContracts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionCategories_SchoolId",
                table: "TransactionCategories",
                column: "SchoolId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FinancialTransactions");

            migrationBuilder.DropTable(
                name: "StaffAbsences");

            migrationBuilder.DropTable(
                name: "StaffContracts");

            migrationBuilder.DropTable(
                name: "DonorProfiles");

            migrationBuilder.DropTable(
                name: "FinancialProjects");

            migrationBuilder.DropTable(
                name: "TransactionCategories");
        }
    }
}
