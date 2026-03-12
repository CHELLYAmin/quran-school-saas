const { AppRunnerClient, ListOperationsCommand, DescribeServiceCommand } = require("@aws-sdk/client-apprunner");

const client = new AppRunnerClient({ region: "us-east-1" });

async function checkOperations() {
    try {
        const serviceName = "quran-school-api";
        const listCmd = new ListOperationsCommand({ MaxResults: 5 }); // Usually needs service ARN, but let's find ARN first
        
        const descRes = await client.send(new DescribeServiceCommand({ ServiceArn: "arn:aws:apprunner:us-east-1:986269327775:service/quran-school-api/2506ba63b2da463e8454fa27c61b6395" }));
        const service = descRes.Service;
        
        console.log("=== APP RUNNER STATUS ===");
        console.log("Status:", service.Status);
        console.log("Latest Operation ID:", service.LatestOperationId);
        
        const opsCmd = new ListOperationsCommand({ ServiceArn: service.ServiceArn });
        const opsResp = await client.send(opsCmd);
        
        console.log("\n--- Operations History ---");
        opsResp.OperationSummaryList.slice(0, 3).forEach(op => {
            console.log(`ID: ${op.Id} | Type: ${op.Type} | Status: ${op.Status} | Updated: ${op.UpdatedAt}`);
        });

        const currentEnv = service.SourceConfiguration.ImageRepository.ImageConfiguration.RuntimeEnvironmentVariables || {};
        console.log("\n--- Current Connection String in Service ---");
        console.log(currentEnv["ConnectionStrings__DefaultConnection"] || "NOT FOUND");
        
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

checkOperations();
