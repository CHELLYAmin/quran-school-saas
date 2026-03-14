using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace QuranSchool.Infrastructure.Seed;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // 1. Seed Quran Data (independent of school)
        var quranSeeder = new QuranDataSeeder(context);
        await quranSeeder.SeedAsync();

        // 2. Define IDs used in seeding
        var schoolId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        var existingSchool = await context.Schools.FirstOrDefaultAsync(s => s.Id == schoolId);
        if (existingSchool == null)
        {
            var anySchool = await context.Schools.FirstOrDefaultAsync();
            if (anySchool != null)
            {
                schoolId = anySchool.Id;
                Console.WriteLine($">>> Using existing production school: {anySchool.Name} ({schoolId})");
            }
            else
            {
                var school = new School
                {
                    Id = schoolId,
                    SchoolId = schoolId,
                    Name = "Centre Culturel Islamique de Québec",
                    Address = "2877 Chemin Ste-Foy, Québec, G1V 1W3",
                    Phone = "(418) 651-3630",
                    Email = "info@cciq.org",
                    Description = "Le pilier de la communauté musulmane de Québec."
                };
                context.Schools.Add(school);
            }
        }

        // Seed Permissions
        var allPermStrings = QuranSchool.Domain.Constants.Permissions.All.ToList();
        var existingPerms = await context.Permissions.Where(p => p.SchoolId == schoolId).ToListAsync();
        
        foreach (var p in allPermStrings)
        {
            if (existingPerms.Any(x => x.Code == p)) continue;
            var parts = p.Split('_');
            var module = parts.Count() > 0 ? parts[0] : p;
            var action = parts.Count() > 1 ? parts[1] : "VIEW";
            context.Permissions.Add(new Permission { Id = Guid.NewGuid(), SchoolId = schoolId, Code = p, Module = module, ActionType = action, Description = $"Permission {p}" });
        }

        // Seed Roles
        var existingRoles = await context.Roles.Where(r => r.SchoolId == schoolId).ToListAsync();
        
        var superAdminRole = existingRoles.FirstOrDefault(r => r.Name == "SuperAdmin") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "SuperAdmin", IsSystemRole = true };
        var adminRole = existingRoles.FirstOrDefault(r => r.Name == "Admin") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Admin", IsSystemRole = true };
        var teacherRole = existingRoles.FirstOrDefault(r => r.Name == "Teacher") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Teacher", IsSystemRole = true };
        var examinerRole = existingRoles.FirstOrDefault(r => r.Name == "Examiner") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Examiner", IsSystemRole = true };
        var parentRole = existingRoles.FirstOrDefault(r => r.Name == "Parent") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Parent", IsSystemRole = true };
        var studentRole = existingRoles.FirstOrDefault(r => r.Name == "Student") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Student", IsSystemRole = true };
        var accountantRole = existingRoles.FirstOrDefault(r => r.Name == "Accountant") ?? new Role { Id = Guid.NewGuid(), SchoolId = schoolId, Name = "Accountant", IsSystemRole = true };
        
        if (!existingRoles.Any(r => r.Name == "SuperAdmin")) context.Roles.Add(superAdminRole);
        if (!existingRoles.Any(r => r.Name == "Admin")) context.Roles.Add(adminRole);
        if (!existingRoles.Any(r => r.Name == "Teacher")) context.Roles.Add(teacherRole);
        if (!existingRoles.Any(r => r.Name == "Examiner")) context.Roles.Add(examinerRole);
        if (!existingRoles.Any(r => r.Name == "Parent")) context.Roles.Add(parentRole);
        if (!existingRoles.Any(r => r.Name == "Student")) context.Roles.Add(studentRole);
        if (!existingRoles.Any(r => r.Name == "Accountant")) context.Roles.Add(accountantRole);

        await context.SaveChangesAsync();

        // Helper to link
        async Task LinkRolePerms(Role r, List<string> perms)
        {
            var existingRolePerms = await context.RolePermissions.Where(rp => rp.RoleId == r.Id).ToListAsync();
            var currentPerms = await context.Permissions.Where(p => p.SchoolId == schoolId).ToListAsync();
            foreach (var pCode in perms)
            {
                var permSelected = currentPerms.FirstOrDefault(x => x.Code == pCode);
                if (permSelected != null && !existingRolePerms.Any(rp => rp.PermissionId == permSelected.Id))
                {
                    context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), SchoolId = schoolId, RoleId = r.Id, PermissionId = permSelected.Id });
                }
            }
        }

        await LinkRolePerms(superAdminRole, allPermStrings);
        await LinkRolePerms(adminRole, allPermStrings.Where(p => p != QuranSchool.Domain.Constants.Permissions.RolesManage).ToList());

        // Default Admin User
        if (!await context.Users.AnyAsync(u => u.Email == "admin@quran.com"))
        {
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                SchoolId = schoolId,
                FirstName = "Admin",
                LastName = "System",
                Email = "admin@quran.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                IsActive = true
            };
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
            context.UserRoles.Add(new UserRole { SchoolId = schoolId, UserId = adminUser.Id, RoleId = superAdminRole.Id });
        }

        // 12. Reset Settings for Cleanup
        var mosqueSettings = await context.MosqueSettings.FirstOrDefaultAsync();
        if (mosqueSettings != null)
        {
            mosqueSettings.IsLiveAnnouncementActive = false;
            mosqueSettings.LiveAnnouncementText = string.Empty;
        }

        var ramadan = await context.RamadanSettings.ToListAsync();
        if (ramadan.Any())
        {
            context.RamadanSettings.RemoveRange(ramadan);
        }

        // 13. Seed CCIQ Content
        if (!await context.CmsPages.AnyAsync())
        {
            var pages = new List<CmsPage>
            {
                new CmsPage
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    Title = "Notre Centre",
                    Slug = "centre",
                    Content = @"<h3>Mission et Objectifs</h3>
<p>Le Centre Culturel Islamique de Québec (CCIQ) agit proactivement pour le développement spirituel, social et économique de la communauté musulmane tout en favorisant son intégration positive.</p>
<h4>Nos 6 Objectifs Clés</h4>
<ul>
<li>Leadership communautaire et unité.</li>
<li>Centre de référence pour l'Islam à Québec.</li>
<li>Favoriser une intégration harmonieuse et positive.</li>
<li>Solidarité avec la société québécoise.</li>
<li>Offrir des services de qualité à tous nos membres.</li>
<li>Promotion des valeurs universelles de l'Islam.</li>
</ul>",
                    Category = "about",
                    IsPublished = true,
                    SortOrder = 1,
                    Excerpt = "Découvrez la mission, la vision et les objectifs du CCIQ."
                },
                new CmsPage
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    Title = "École Salam",
                    Slug = "education",
                    Content = @"<h3>Éducation et Épanouissement</h3>
<p>L'École Salam est le pôle éducatif du CCIQ, proposant des programmes d'apprentissage du Coran et de la langue arabe pour tous les âges.</p>
<h4>Programmes</h4>
<ul>
<li><strong>École Coranique :</strong> Lecture et mémorisation du Coran pour enfants et adultes.</li>
<li><strong>Langue Arabe :</strong> Apprentissage de l'arabe littéraire pour francophones et arabophones.</li>
</ul>",
                    Category = "service",
                    IsPublished = true,
                    SortOrder = 2,
                    Excerpt = "Tout savoir sur nos programmes d'éducation coranique et d'arabe."
                },
                new CmsPage
                {
                    Id = Guid.NewGuid(),
                    SchoolId = schoolId,
                    Title = "Services Communautaires",
                    Slug = "services",
                    Content = @"<h3>Au service de la communauté</h3>
<p>Le CCIQ offre une large gamme de services pour accompagner les musulmans de Québec dans leur quotidien.</p>
<ul>
<li><strong>Soutien Social :</strong> Collecte et distribution de la Zakat, banque alimentaire.</li>
<li><strong>Rites Funéraires :</strong> Gestion du cimetière et accompagnement des familles.</li>
<li><strong>Mariage :</strong> Célébration et conseil conjugal.</li>
<li><strong>Événements :</strong> Conférences, activités jeunesse et repas communautaires.</li>
</ul>",
                    Category = "service",
                    IsPublished = true,
                    SortOrder = 3,
                    Excerpt = "Soutien social, rites funéraires, mariage et événements communautaires."
                }
            };
            context.CmsPages.AddRange(pages);
        }

        await context.SaveChangesAsync();
        Console.WriteLine(">>> Seeding completed successfully (CCIQ Content Added).");
    }
}
