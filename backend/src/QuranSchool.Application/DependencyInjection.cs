using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using QuranSchool.Application.Interfaces;

namespace QuranSchool.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<Validators.LoginRequestValidator>();
        return services;
    }
}
