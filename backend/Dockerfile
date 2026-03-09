# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["src/QuranSchool.API/QuranSchool.API.csproj", "QuranSchool.API/"]
COPY ["src/QuranSchool.Application/QuranSchool.Application.csproj", "QuranSchool.Application/"]
COPY ["src/QuranSchool.Domain/QuranSchool.Domain.csproj", "QuranSchool.Domain/"]
COPY ["src/QuranSchool.Infrastructure/QuranSchool.Infrastructure.csproj", "QuranSchool.Infrastructure/"]

RUN dotnet restore "QuranSchool.API/QuranSchool.API.csproj"

# Copy the rest of the code and build
COPY src/ .
WORKDIR "/src/QuranSchool.API"
RUN dotnet build "QuranSchool.API.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "QuranSchool.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose the port the app runs on
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "QuranSchool.API.dll"]
