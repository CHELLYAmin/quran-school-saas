const { EC2Client, AuthorizeSecurityGroupIngressCommand, RevokeSecurityGroupIngressCommand, DescribeSecurityGroupsCommand } = require("@aws-sdk/client-ec2");

const ec2Client = new EC2Client({ region: "us-east-1" });
const GROUP_ID = "sg-0476f6c3fb33df813"; // rds-prod-sg-final

async function fixSG() {
    try {
        console.log(`=== FIXING SECURITY GROUP: ${GROUP_ID} ===`);
        
        // 1. Describe to confirm current rules
        const describe = await ec2Client.send(new DescribeSecurityGroupsCommand({ GroupIds: [GROUP_ID] }));
        const sg = describe.SecurityGroups[0];
        
        // 2. Revoke restrictive rules (optional but cleaner)
        for (const perm of sg.IpPermissions) {
            if (perm.IpRanges.some(r => r.CidrIp !== "0.0.0.0/0")) {
                 console.log("Revoking old restrictive rule...");
                 await ec2Client.send(new RevokeSecurityGroupIngressCommand({
                     GroupId: GROUP_ID,
                     IpPermissions: [perm]
                 }));
            }
        }

        // 3. Add global access for PostgreSQL
        console.log("Adding 0.0.0.0/0 for port 5432...");
        await ec2Client.send(new AuthorizeSecurityGroupIngressCommand({
            GroupId: GROUP_ID,
            IpPermissions: [{
                IpProtocol: "tcp",
                FromPort: 5432,
                ToPort: 5432,
                IpRanges: [{ CidrIp: "0.0.0.0/0", Description: "Allow App Runner and Public" }]
            }]
        }));
        
        console.log("SUCCESS: Security Group updated.");
        
    } catch (err) {
        console.error("FIX ERROR:", err.message);
    }
}

fixSG();
