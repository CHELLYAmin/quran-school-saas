const { AppRunnerClient, ListServicesCommand, DescribeServiceCommand, UpdateServiceCommand } = require("@aws-sdk/client-apprunner");

const client = new AppRunnerClient({ region: "us-east-1" });

// FINAL AND VERIFIED CONNECTION STRING
const CORRECT_CONNECTION_STRING = "Host=quranschool-prod-final.cwteswms66jd.us-east-1.rds.amazonaws.com;Port=5432;Database=postgres;Username=postgres;Password=&Kakashi123;";

async function fixAppRunner() {
    try {
        console.log("=== APP RUNNER EMERGENCY FIX ===");
        
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
        
        console.log("Old String (truncated in logs potentially):", envVars["ConnectionStrings__DefaultConnection"]);
        
        // APPLY FIX
        envVars["ConnectionStrings__DefaultConnection"] = CORRECT_CONNECTION_STRING;
        
        console.log("New String:", CORRECT_CONNECTION_STRING);
        
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
        console.log("SUCCESS: Emergency update triggered. Waiting for deployment...");
        
    } catch (err) {
        console.error("CRITICAL ERROR:", err.message);
    }
}

fixAppRunner();
