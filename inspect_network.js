const { RDSClient, DescribeDBInstancesCommand } = require("@aws-sdk/client-rds");
const { EC2Client, DescribeSubnetsCommand, DescribeRouteTablesCommand, DescribeSecurityGroupsCommand } = require("@aws-sdk/client-ec2");

const rdsClient = new RDSClient({ region: "us-east-1" });
const ec2Client = new EC2Client({ region: "us-east-1" });

async function networkDiagnostic() {
    try {
        console.log("=== NETWORK DIAGNOSTIC ===");
        
        // 1. Get RDS Instance Details
        const rdsCmd = new DescribeDBInstancesCommand({ DBInstanceIdentifier: "quranschool-prod-final" });
        const rdsResp = await rdsClient.send(rdsCmd);
        const db = rdsResp.DBInstances[0];
        
        console.log(`DB Instance: ${db.DBInstanceIdentifier}`);
        console.log(`Endpoint: ${db.Endpoint?.Address}`);
        console.log(`Publicly Accessible: ${db.PubliclyAccessible}`);
        
        const subnetIds = db.DBSubnetGroup.Subnets.map(s => s.SubnetIdentifier);
        const sgIds = db.VpcSecurityGroups.map(sg => sg.VpcSecurityGroupId);

        // 2. Check Security Groups
        console.log("\n--- Security Groups ---");
        const sgCmd = new DescribeSecurityGroupsCommand({ GroupIds: sgIds });
        const sgResp = await ec2Client.send(sgCmd);
        for (const sg of sgResp.SecurityGroups) {
            console.log(`SG: ${sg.GroupName} (${sg.GroupId})`);
            sg.IpPermissions.forEach(p => {
                const ports = `${p.FromPort}-${p.ToPort}`;
                const sources = p.IpRanges.map(r => r.CidrIp).join(", ");
                console.log(`  Inbound: Port ${ports} from ${sources || "Other SGs"}`);
            });
        }

        // 3. Check Subnets and Route Tables
        console.log("\n--- Subnets & Routing ---");
        const subCmd = new DescribeSubnetsCommand({ SubnetIds: subnetIds });
        const subResp = await ec2Client.send(subCmd);
        
        for (const sub of subResp.Subnets) {
            console.log(`Subnet: ${sub.SubnetId} (${sub.AvailabilityZone})`);
            
            const rtCmd = new DescribeRouteTablesCommand({ 
                Filters: [{ Name: "association.subnet-id", Values: [sub.SubnetId] }] 
            });
            let rtResp = await ec2Client.send(rtCmd);
            
            // If no explicit association, it uses the main route table
            if (rtResp.RouteTables.length === 0) {
                const mainRtCmd = new DescribeRouteTablesCommand({
                    Filters: [
                        { Name: "vpc-id", Values: [sub.VpcId] },
                        { Name: "association.main", Values: ["true"] }
                    ]
                });
                rtResp = await ec2Client.send(mainRtCmd);
            }

            for (const rt of rtResp.RouteTables) {
                const hasIgw = rt.Routes.some(r => r.GatewayId && r.GatewayId.startsWith("igw-"));
                console.log(`  Route Table: ${rt.RouteTableId} - ${hasIgw ? "PUBLIC (Has IGW)" : "PRIVATE (No IGW)"}`);
            }
        }
        
    } catch (err) {
        console.error("DIAGNOSTIC ERROR:", err.message);
    }
}

networkDiagnostic();
