const { RDSClient, DescribeDBInstancesCommand } = require("@aws-sdk/client-rds");

const client = new RDSClient({ region: "us-east-1" });

async function checkRDS() {
    try {
        const command = new DescribeDBInstancesCommand({
            DBInstanceIdentifier: "quranschool-prod-final"
        });
        const response = await client.send(command);
        const instance = response.DBInstances[0];
        
        console.log("=== RDS DIAGNOSTIC ===");
        console.log("Status:", instance.DBInstanceStatus);
        console.log("Endpoint:", instance.Endpoint?.Address);
        console.log("Publicly Accessible:", instance.PubliclyAccessible);
        console.log("Subnet Group:", instance.DBSubnetGroup?.DBSubnetGroupName);
        console.log("VPC ID:", instance.DBSubnetGroup?.VpcId);
        
        if (instance.Endpoint?.Address && instance.PubliclyAccessible) {
            console.log("SUCCESS: Instance is configured for public access.");
        } else {
            console.log("WARNING: Instance might NOT be publicly accessible.");
        }
        
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

checkRDS();
