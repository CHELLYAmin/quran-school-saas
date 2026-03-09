using Microsoft.EntityFrameworkCore;
using QuranSchool.Infrastructure.Data;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;

var config = new ConfigurationBuilder().AddJsonFile("appsettings.Production.json").Build();
var connectionString = config.GetConnectionString("DefaultConnection");

var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
optionsBuilder.UseNpgsql(connectionString);

using var context = new AppDbContext(optionsBuilder.Options);
var count = context.Users.Count();
var superAdmin = context.Users.Any(u => u.Email == "superadmin@quranschool.com");

Console.WriteLine($">>> USER COUNT: {count}");
Console.WriteLine($">>> SUPERADMIN EXISTS: {superAdmin}");
