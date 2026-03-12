const { AppRunnerClient, ListServicesCommand, DescribeServiceCommand, UpdateServiceCommand } = require("@aws-sdk/client-apprunner");

const client = new AppRunnerClient({ region: "us-east-1" });
const NEW_CONNECTION_STRING = "Host=quranschool-prod-final.cwteswms66jd.us-east-1.rds.amazonaws.com;Port=5432;Database=postgres;Username=postgres;Password='&Kakashi123';";

async function updateAppRunner() {
    try {
        console.log("=== APP RUNNER UPDATE ===");
        
        // 1. List services
        const listCmd = new ListServicesCommand({});
        const listResp = await client.send(listCmd);
        
        const service = listResp.ServiceSummaryList.find(s => s.ServiceName.toLowerCase().includes("quran"));
        
        if (!service) {
            console.log("Service not found. Listing all:");
            listResp.ServiceSummaryList.forEach(s => console.log(`- ${s.ServiceName}`));
            return;
        }
        
        console.log(`Targeting Service: ${service.ServiceName} (${service.ServiceArn})`);
        
        // 2. Describe to get current config
        const descCmd = new DescribeServiceCommand({ ServiceArn: service.ServiceArn });
        const descResp = await client.send(descCmd);
        const currentService = descResp.Service;
        
        // 3. Update env variables
        const envVars = currentService.SourceConfiguration.ImageRepository.ImageConfiguration.RuntimeEnvironmentVariables || {};
        envVars["ConnectionStrings__DefaultConnection"] = NEW_CONNECTION_STRING;
        
        console.log("Updating Connection String...");
        
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
