const { AppRunnerClient, ListServicesCommand, DescribeServiceCommand, UpdateServiceCommand } = require("@aws-sdk/client-apprunner");

const client = new AppRunnerClient({ region: "us-east-1" });
// NO QUOTES around the password here, letting the string be literal
const NEW_CONNECTION_STRING = "Host=quranschool-prod-final.cwteswms66jd.us-east-1.rds.amazonaws.com;Port=5432;Database=postgres;Username=postgres;Password=&Kakashi123;";

async function updateAppRunner() {
    try {
        console.log("=== APP RUNNER UPDATE (FIX PASSWORD FORMAT) ===");
        
        const listCmd = new ListServicesCommand({});
        const listResp = await client.send(listCmd);
        const service = listResp.ServiceSummaryList.find(s => s.ServiceName.toLowerCase().includes("quran"));
        
        if (!service) {
            console.log("Service not found.");
            return;
        }
        
        const descResp = await client.send(new DescribeServiceCommand({ ServiceArn: service.ServiceArn }));
        const currentService = descResp.Service;
        
        const envVars = currentService.SourceConfiguration.ImageRepository.ImageConfiguration.RuntimeEnvironmentVariables || {};
        envVars["ConnectionStrings__DefaultConnection"] = NEW_CONNECTION_STRING;
        
        console.log(`Setting connection string without quotes: ${NEW_CONNECTION_STRING}`);
        
        const updateCmd = new UpdateServiceCommand({
            ServiceArn: service.ServiceArn,
            SourceConfiguration: {
                ImageRepository: {
                    ...currentService.SourceConfiguration.ImageRepository,
                    ImageConfiguration: {
                        ...currentService.SourceConfiguration.ImageRepository.ImageConfiguration,
                        RuntimeEnvironmentVariables: envVars
                    }
                }
            }
        });
        
        await client.send(updateCmd);
        console.log("SUCCESS: App Runner update triggered!");
        
    } catch (err) {
        console.error("APP RUNNER ERROR:", err.message);
    }
}

updateAppRunner();
