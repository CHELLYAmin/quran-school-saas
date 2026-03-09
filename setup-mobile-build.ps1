# Script d'installation des outils Android et Génération APK
# Ce script utilise Winget pour installer Java et les outils Android.

Write-Host "--- Verification des outils ---" -ForegroundColor Cyan

# 1. Installer Java (OpenJDK 17)
if (!(Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Host "Installation de Java (OpenJDK 17)..." -ForegroundColor Yellow
    winget install Microsoft.OpenJDK.17 --accept-source-agreements --accept-package-agreements
}
else {
    Write-Host "Java est déja installé." -ForegroundColor Green
}

# 2. Note sur Android Studio
Write-Host ""
Write-Host "--- IMPORTANT ---" -ForegroundColor Red
Write-Host "Pour générer un APK localement, vous devez installer Android Studio :" -ForegroundColor White
Write-Host "1. Téléchargez-le ici : https://developer.android.com/studio" -ForegroundColor Cyan
Write-Host "2. Installez le SDK Android (API 34 recommandé)" -ForegroundColor White
Write-Host "3. Définit la variable d'environnement ANDROID_HOME." -ForegroundColor White
Write-Host ""

# 3. Preparation du projet
Write-Host "Préparation du projet..." -ForegroundColor Cyan
Set-Location frontend
npm install
npm run build

# 4. Capacitor
Write-Host "Syncronisation Capacitor..." -ForegroundColor Cyan
if (!(Test-Path android)) {
    npx cap add android
}
npx cap sync android

Write-Host ""
Write-Host "--- PROCHAINE ÉTAPE ---" -ForegroundColor Yellow
Write-Host "Ouvrez le projet dans Android Studio avec la commande :" -ForegroundColor White
Write-Host "npx cap open android" -ForegroundColor Cyan
Write-Host "Ensuite, faites: Build > Build Bundle(s) / APK(s) > Build APK(s)" -ForegroundColor White
