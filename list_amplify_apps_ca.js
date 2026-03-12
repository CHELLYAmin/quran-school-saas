const { AmplifyClient, ListAppsCommand } = require("@aws-sdk/client-amplify");

const client = new AmplifyClient({ region: "ca-central-1" });

async function listApps() {
    try {
        const command = new ListAppsCommand({});
        const response = await client.send(command);
        console.log("=== AMPLIFY APPS (ca-central-1) ===");
        response.apps.forEach(app => {
            console.log(`App Name: ${app.name}`);
            console.log(`App ID: ${app.appId}`);
            console.log(`Default Domain: ${app.defaultDomain}`);
            console.log(`Custom Domains: ${JSON.stringify(app.customDomains || [])}`);
            console.log(`Repository: ${app.repository}`);
            console.log("---");
        });
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

listApps();
