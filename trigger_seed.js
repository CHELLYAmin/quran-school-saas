const { AppRunnerClient, DescribeServiceCommand, UpdateServiceCommand } = require("@aws-sdk/client-apprunner");

const client = new AppRunnerClient({ region: "us-east-1" });
const SERVICE_ARN = "arn:aws:apprunner:us-east-1:986269327775:service/quran-school-api/2506ba63b2da463e8454fa27c61b6395";

async function run() {
    try {
        console.log("Fetching service configuration for SEEDING...");
        const desc = await client.send(new DescribeServiceCommand({ ServiceArn: SERVICE_ARN }));
        
        const envVars = desc.Service.SourceConfiguration.ImageRepository.ImageConfiguration.RuntimeEnvironmentVariables || {};
        
        console.log("Setting RESET_DATABASE=true for initial seed...");
        envVars["RESET_DATABASE"] = "true";
        // Also ensure the connection string is correct (precaution)
        envVars["ConnectionStrings__DefaultConnection"] = "Host=quranschool-prod-final.cwteswms66jd.us-east-1.rds.amazonaws.com;Port=5432;Database=postgres;Username=postgres;Password=&Kakashi123;";
        
        const updateCmd = new UpdateServiceCommand({
            ServiceArn: SERVICE_ARN,
            SourceConfiguration: {
                ImageRepository: {
                    ...desc.Service.SourceConfiguration.ImageRepository,
                    ImageConfiguration: {
                        ...desc.Service.SourceConfiguration.ImageRepository.ImageConfiguration,
                        RuntimeEnvironmentVariables: envVars
                    }
                }
            }
        });
        
        console.log("Triggering SEEDING deployment...");
        await client.send(updateCmd);
        console.log("SEEDING DEPLOYMENT TRIGGERED.");
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

run();
