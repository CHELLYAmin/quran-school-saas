const { RDSClient, DescribeDBInstancesCommand } = require("@aws-sdk/client-rds");
const { EC2Client, DescribeSubnetsCommand, DescribeRouteTablesCommand, DescribeSecurityGroupsCommand } = require("@aws-sdk/client-ec2");

const rdsClient = new RDSClient({ region: "us-east-1" });
const ec2Client = new EC2Client({ region: "us-east-1" });

async function networkDiagnostic() {
    try {
        const rdsResp = await rdsClient.send(new DescribeDBInstancesCommand({ DBInstanceIdentifier: "quranschool-prod-final" }));
        const db = rdsResp.DBInstances[0];
        
        console.log(`RDS: ${db.DBInstanceIdentifier} | Status: ${db.DBInstanceStatus} | Public: ${db.PubliclyAccessible}`);
        console.log(`Endpoint: ${db.Endpoint?.Address}`);
        
        const subnetIds = db.DBSubnetGroup.Subnets.map(s => s.SubnetIdentifier);
        const sgIds = db.VpcSecurityGroups.map(sg => sg.VpcSecurityGroupId);

        console.log("\n[Security Groups]");
        const sgResp = await ec2Client.send(new DescribeSecurityGroupsCommand({ GroupIds: sgIds }));
        sgResp.SecurityGroups.forEach(sg => {
            console.log(`SG: ${sg.GroupName} (${sg.GroupId})`);
            sg.IpPermissions.forEach(p => {
                const ports = `${p.FromPort}-${p.ToPort}`;
                const ranges = p.IpRanges.map(r => r.CidrIp).join(",");
                console.log(`  Rule: Port ${ports} | Sources: ${ranges || "Other SGs"}`);
            });
        });

        console.log("\n[Routing]");
        const subResp = await ec2Client.send(new DescribeSubnetsCommand({ SubnetIds: subnetIds }));
        for (const sub of subResp.Subnets) {
            let rtResp = await ec2Client.send(new DescribeRouteTablesCommand({ Filters: [{ Name: "association.subnet-id", Values: [sub.SubnetId] }] }));
            if (rtResp.RouteTables.length === 0) {
                rtResp = await ec2Client.send(new DescribeRouteTablesCommand({ Filters: [{ Name: "vpc-id", Values: [sub.VpcId] }, { Name: "association.main", Values: ["true"] }] }));
            }
            const rt = rtResp.RouteTables[0];
            const hasIgw = rt ? rt.Routes.some(r => r.GatewayId && r.GatewayId.startsWith("igw-")) : false;
            console.log(`Subnet: ${sub.SubnetId} (${sub.AvailabilityZone}) -> RT: ${rt?.RouteTableId} | ${hasIgw ? "PUBLIC" : "PRIVATE"}`);
        }
    } catch (err) { console.error("ERR:", err.message); }
}
networkDiagnostic();
