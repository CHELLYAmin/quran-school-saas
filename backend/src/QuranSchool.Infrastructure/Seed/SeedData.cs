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
        
        // Force seeding for restoration
        if (false) 
        {
            Console.WriteLine(">>> Schools already exist. Skipping rest of seed.");
            return;
        }

        var existingSchool = await context.Schools.FirstOrDefaultAsync(s => s.Id == schoolId);
        if (existingSchool == null)
        {
            var school = new School
            {
                Id = schoolId,
                SchoolId = schoolId,
                Name = "École Al-Noor du Coran",
                Address = "123 Rue de la Paix, Paris",
                Phone = "+33 1 23 45 67 89",
                Email = "contact@alnoor-quran.fr",
                Description = "École de Coran spécialisée en Hifdh et Tajwid"
            };
            context.Schools.Add(school);
        }
        else
        {
            Console.WriteLine(">>> School already exists, skipping addition.");
        }

        // Seed Permissions
        var permissions = new List<Permission>();
        var allPermStrings = QuranSchool.Domain.Constants.Permissions.All.ToList();
        
        var existingPerms = await context.Permissions.Where(p => p.SchoolId == schoolId).ToListAsync();
        
        foreach (var p in allPermStrings)
        {
            if (existingPerms.Any(x => x.Code == p)) continue;

            var parts = p.Split('_');
            var module = parts.Count() > 0 ? parts[0] : p;
            var action = parts.Count() > 1 ? parts[1] : "VIEW";
            permissions.Add(new Permission { Id = Guid.NewGuid(), SchoolId = schoolId, Code = p, Module = module, ActionType = action, Description = $"Permission {p}" });
        }
        if (permissions.Any())
        {
            context.Permissions.AddRange(permissions);
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
        
        var newRoles = new List<Role>();
        if (!existingRoles.Any(r => r.Name == "SuperAdmin")) newRoles.Add(superAdminRole);
        if (!existingRoles.Any(r => r.Name == "Admin")) newRoles.Add(adminRole);
        if (!existingRoles.Any(r => r.Name == "Teacher")) newRoles.Add(teacherRole);
        if (!existingRoles.Any(r => r.Name == "Examiner")) newRoles.Add(examinerRole);
        if (!existingRoles.Any(r => r.Name == "Parent")) newRoles.Add(parentRole);
        if (!existingRoles.Any(r => r.Name == "Student")) newRoles.Add(studentRole);
        if (!existingRoles.Any(r => r.Name == "Accountant")) newRoles.Add(accountantRole);

        if (newRoles.Any())
        {
            context.Roles.AddRange(newRoles);
        }

        // Seed CMS Pages (Hub de Vie)
        var existingCmsPages = await context.CmsPages.Where(p => p.SchoolId == schoolId).ToListAsync();
        
        var cmsPages = new List<CmsPage>
        {
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "9e Commémoration — 29 Janvier 2026", 
                Slug = "commemoration-2026", 
                Excerpt = "Trois journées de mémoire et de recueillement pour honorer les victimes du 29 janvier 2017.",
                Content = "# 9e Commémoration du 29 Janvier\n\nNous vous invitons à participer aux événements de commémoration prévus pour le 9e anniversaire de la tragédie de la Grande Mosquée de Québec. \n\n### Programme :\n- **Veillée de prière** : 28 janvier à 19h00\n- **Cérémonie officielle** : 29 janvier à 18h00\n- **Journée portes ouvertes** : 30 janvier de 10h à 16h\n\n*Ensemble, cultivons la paix et le vivre-ensemble.*",
                Category = "announcement", 
                IsPublished = true, 
                SortOrder = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Annonce du début de Ramadan 1447 / 2026", 
                Slug = "annonce-ramadan-2026", 
                Excerpt = "La TCOM annonce le premier jour du mois béni de Ramadan 1447.",
                Content = "# Ramadan Mubarak\n\nLe Centre Culturel Islamique de Québec a le plaisir de vous annoncer que le premier jour du mois de Ramadan 1447 sera le **1er Mars 2026** (sous réserve de l'observation lunaire).\n\n### Horaires :\nLes horaires de l'Imsakiya sont disponibles dans l'onglet 'Horaires' de notre site.\n\n### Tarawih :\nLes prières de Tarawih débuteront la veille au soir et seront dirigées par nos imams habituels.",
                Category = "announcement", 
                IsPublished = true, 
                SortOrder = 2,
                CreatedAt = DateTime.UtcNow.AddHours(-12)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Le Centre — MISSION ET OBJECTIFS", 
                Slug = "centre", 
                Excerpt = "Mission et objectifs du Centre Culturel Islamique de Québec — au service de la communauté depuis 1985.",
                Content = "# Notre Mission\n\nLe CCIQ est une organisation à but non lucratif dont la mission principale est de répondre aux besoins spirituels, sociaux et éducatifs de la communauté musulmane de la grande région de Québec.\n\n## Nos objectifs :\n1. Fournir un lieu de culte et de recueillement.\n2. Promouvoir une meilleure compréhension de l'Islam.\n3. Favoriser l'intégration et la participation citoyenne.\n4. Offrir des services éducatifs de qualité via notre école coranique.",
                Category = "about", 
                IsPublished = true, 
                SortOrder = 3,
                CreatedAt = DateTime.UtcNow.AddDays(-30)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Services Funéraires", 
                Slug = "services-funeraires", 
                Excerpt = "Accompagnement des familles dans les moments difficiles selon les rites islamiques.",
                Content = "# Services Funéraires (Janaza)\n\nLe CCIQ accompagne les familles endeuillées pour l'organisation des funérailles. \n\n### Services inclus :\n- Lavage mortuaire (Ghusl)\n- Mise en linceul (Kaffan)\n- Prière funéraire (Salat al-Janaza)\n- Transport au cimetière\n\n**Contact d'urgence (24h/24) : 418-xxx-xxxx**",
                Category = "service", 
                IsPublished = true, 
                SortOrder = 4,
                CreatedAt = DateTime.UtcNow.AddDays(-40)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Cimetière Islamique de Québec", 
                Slug = "cimetiere", 
                Excerpt = "Informations sur le premier cimetière musulman géré par la communauté à Québec.",
                Content = "# Cimetière Islamique\n\nSitué à Saint-Augustin-de-Desmaures, notre cimetière offre un lieu de repos éternel respectant les traditions islamiques.\n\n### Acquisition de lots :\nLes membres de la communauté peuvent faire une demande d'acquisition de lot de sépulture auprès de l'administration du Centre.",
                Category = "service", 
                IsPublished = true, 
                SortOrder = 5,
                CreatedAt = DateTime.UtcNow.AddDays(-45)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Ensemble pour notre Mosquée", 
                Slug = "ensemble-mosquee", 
                Excerpt = "Campagne de financement pour l'entretien et l'amélioration de nos installations.",
                Content = "# Soutenez votre Mosquée\n\nLa gestion et l'entretien de notre centre reposent entièrement sur vos dons généreux. \n\n### Comment aider ?\n- Dons ponctuels en ligne\n- Prélèvements automatiques mensuels\n- Devenir membre bâtisseur\n\n*Chaque contribution, aussi petite soit-elle, fait une différence.*",
                Category = "donation", 
                IsPublished = true, 
                SortOrder = 6,
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Programme Jeunesse", 
                Slug = "programme-jeunesse", 
                Excerpt = "Activités sportives, culturelles et spirituelles pour les 12-18 ans.",
                Content = "# Jeunesse CCIQ\n\nNous offrons un cadre sain et dynamique pour nos jeunes. \n\n### Activités régulières :\n- Cercle de discussion (Halaqa)\n- Tournois de soccer\n- Sorties plein air\n- Ateliers de leadership",
                Category = "service", 
                IsPublished = true, 
                SortOrder = 7,
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Inscriptions École Coranique 2026", 
                Slug = "ecole-coranique-inscriptions", 
                Excerpt = "Les inscriptions pour la session de printemps sont maintenant ouvertes.",
                Content = "# École Al-Noor\n\nRejoignez nos programmes d'apprentissage du Coran et d'éducation islamique.\n\n### Niveaux :\n- Débutants (Lettres et lecture)\n- Mémorisation (Hifdh)\n- Tajwid théorique et pratique\n\n*Places limitées.*",
                Category = "announcement", 
                IsPublished = true, 
                SortOrder = 8,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Conférence Mensuelle : La Famille en Islam", 
                Slug = "conference-mensuelle", 
                Excerpt = "Rejoignez-nous pour notre conférence thématique avec Dr. Cheikh X.",
                Content = "# Conférence Publique\n\nLe CCIQ organise une conférence sur le thème de la famille.\n\n- **Date** : Samedi 15 Mars\n- **Heure** : Après Salat al-Maghrib\n- **Lieu** : Grande salle de prière\n\n*Entrée libre, ouvert à tous.*",
                Category = "event", 
                IsPublished = true, 
                SortOrder = 9,
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Aide aux Devoirs et Soutien Scolaire", 
                Slug = "soutien-scolaire", 
                Excerpt = "Service gratuit de tutorat pour les élèves du primaire et secondaire.",
                Content = "# Soutien Scolaire\n\nNos bénévoles diplômés accompagnent vos enfants dans leur réussite académique.\n\n- **Matières** : Maths, Français, Sciences\n- **Horaire** : Dimanche de 10h à 12h",
                Category = "volunteer", 
                IsPublished = true, 
                SortOrder = 10,
                CreatedAt = DateTime.UtcNow.AddDays(-20)
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Nos Services", 
                Slug = "services", 
                Excerpt = "Découvrez l'ensemble des services offerts par le Centre Culturel Islamique de Québec.", 
                Content = "# Nos Services\n\nLe Centre Culturel Islamique de Québec (CCIQ) est fier d'offrir une vaste gamme de services à sa communauté.\n\n### Liste de nos services :\n- **École Al-Noor** : Enseignement du Coran et de la langue arabe.\n- **Services Funéraires** : Accompagnement complet selon les rites islamiques.\n- **Cimetière** : Gestion du cimetière musulman de Québec.\n- **Programme Jeunesse** : Activités sportives et spirituelles pour les jeunes.\n- **Messagerie Interne** : Restez connectés aux membres du centre.", 
                Category = "service", 
                IsPublished = true, 
                SortOrder = 11, 
                CreatedAt = DateTime.UtcNow.AddDays(-1) 
            },
            new CmsPage 
            { 
                Id = Guid.NewGuid(), 
                SchoolId = schoolId, 
                Title = "Comprendre l'Islam", 
                Slug = "islam", 
                Excerpt = "Ressources et informations pour découvrir et approfondir la connaissance de l'Islam.", 
                Content = "# L'Islam au CCIQ\n\nNous croyons en un Islam de paix, de savoir et de partage. Cette section est dédiée à l'apprentissage des principes fondamentaux de notre foi.\n\n### Ce que nous offrons :\n- **Conférences Mensuelles** : Avec des savants et professeurs renommés.\n- **Cours de Fiqh** : Compréhension de la pratique quotidienne.\n- **Bibliothèque** : Accès à une collection d'ouvrages authentiques.\n- **Portes Ouvertes** : Pour nos concitoyens souhaitant découvrir notre centre.", 
                Category = "islam", 
                IsPublished = true, 
                SortOrder = 12, 
                CreatedAt = DateTime.UtcNow.AddDays(-2) 
            }
        };
        
        var newCmsPages = cmsPages.Where(p => !existingCmsPages.Any(e => e.Slug == p.Slug)).ToList();
        if (newCmsPages.Any())
        {
            context.CmsPages.AddRange(newCmsPages);
        }

        // Helper to link
        async Task LinkRolePerms(Role r, List<string> perms)
        {
            var existingRolePerms = await context.RolePermissions.Where(rp => rp.RoleId == r.Id).ToListAsync();
            foreach (var pCode in perms)
            {
                var permSelected = permissions.FirstOrDefault(x => x.Code == pCode) ?? existingPerms.FirstOrDefault(x => x.Code == pCode);
                if (permSelected != null)
                {
                    if (!existingRolePerms.Any(rp => rp.PermissionId == permSelected.Id))
                    {
                        context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), SchoolId = schoolId, RoleId = r.Id, PermissionId = permSelected.Id });
                    }
                }
            }
        }

        // 1. SuperAdmin / Admin (All Permissions except RolesManage for Admin)
        await LinkRolePerms(superAdminRole, allPermStrings);
        
        var adminPerms = allPermStrings
            .Where(p => p != QuranSchool.Domain.Constants.Permissions.RolesManage)
            .ToList();
        await LinkRolePerms(adminRole, adminPerms);

        // 2. Teacher Permissions
        var teacherPerms = new List<string> { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.StudentsView,
            QuranSchool.Domain.Constants.Permissions.GroupsView,
            QuranSchool.Domain.Constants.Permissions.SessionsView, QuranSchool.Domain.Constants.Permissions.SessionsManage,
            QuranSchool.Domain.Constants.Permissions.ScheduleView,
            QuranSchool.Domain.Constants.Permissions.AttendanceView, QuranSchool.Domain.Constants.Permissions.AttendanceManage,
            QuranSchool.Domain.Constants.Permissions.ExamsView, QuranSchool.Domain.Constants.Permissions.ExamsManage,
            QuranSchool.Domain.Constants.Permissions.ProgressView,
            QuranSchool.Domain.Constants.Permissions.MessagesView, QuranSchool.Domain.Constants.Permissions.MessagesSend,
            QuranSchool.Domain.Constants.Permissions.HomeworkView, QuranSchool.Domain.Constants.Permissions.HomeworkManage,
            QuranSchool.Domain.Constants.Permissions.MushafView
        };
        await LinkRolePerms(teacherRole, teacherPerms);

        // 3. Examiner Permissions
        var examinerPerms = new List<string> { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.StudentsView,
            QuranSchool.Domain.Constants.Permissions.ExamsView, QuranSchool.Domain.Constants.Permissions.ExamsManage,
            QuranSchool.Domain.Constants.Permissions.MushafView
        };
        await LinkRolePerms(examinerRole, examinerPerms);

        // 4. Parent Permissions
        var parentPerms = new List<string> { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.ScheduleView,
            QuranSchool.Domain.Constants.Permissions.ProgressView,
            QuranSchool.Domain.Constants.Permissions.PaymentsView,
            QuranSchool.Domain.Constants.Permissions.MessagesView, QuranSchool.Domain.Constants.Permissions.MessagesSend,
            QuranSchool.Domain.Constants.Permissions.MushafView
        };
        await LinkRolePerms(parentRole, parentPerms);

        // 5. Student Permissions
        var studentPerms = new List<string> { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.ScheduleView,
            QuranSchool.Domain.Constants.Permissions.ProgressView,
            QuranSchool.Domain.Constants.Permissions.HomeworkView,
            QuranSchool.Domain.Constants.Permissions.MushafView
        };
        await LinkRolePerms(studentRole, studentPerms);

        // 6. Accountant Permissions
        var accountantPerms = new List<string> { 
            QuranSchool.Domain.Constants.Permissions.DashboardView,
            QuranSchool.Domain.Constants.Permissions.PaymentsView, QuranSchool.Domain.Constants.Permissions.PaymentsManage
        };
        await LinkRolePerms(accountantRole, accountantPerms);

        await context.SaveChangesAsync();
    }
}
