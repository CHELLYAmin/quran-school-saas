const { AmplifyClient, ListBranchesCommand } = require("@aws-sdk/client-amplify");

const client = new AmplifyClient({ region: "ca-central-1" });

async function listBranches() {
    try {
        const command = new ListBranchesCommand({ appId: "dvzbe963bxnuz" });
        const response = await client.send(command);
        console.log("=== AMPLIFY BRANCHES ===");
        response.branches.forEach(branch => {
            console.log(`Branch Name: ${branch.branchName}`);
            console.log(`URL: https://${branch.branchName}.dvzbe963bxnuz.amplifyapp.com`);
            console.log("---");
        });
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

listBranches();
