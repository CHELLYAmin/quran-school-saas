const { RDSClient, DescribeDBInstancesCommand, DescribeDBClustersCommand, DeleteDBInstanceCommand, DeleteDBClusterCommand } = require("@aws-sdk/client-rds");

const client = new RDSClient({ region: "ca-central-1" });

async function cleanup() {
    try {
        console.log("=== CHECKING CANADA RESOURCES (ca-central-1) ===");
        
        // Check Instances
        const instances = await client.send(new DescribeDBInstancesCommand({}));
        for (const db of instances.DBInstances) {
            console.log(`Found Instance: ${db.DBInstanceIdentifier} (${db.DBInstanceStatus})`);
            if (db.DBInstanceIdentifier === "quranschool-db") {
                console.log("DELETING quranschool-db...");
                await client.send(new DeleteDBInstanceCommand({
                    DBInstanceIdentifier: "quranschool-db",
                    SkipFinalSnapshot: true,
                    DeleteAutomatedBackups: true
                }));
            }
        }

        // Check Clusters
        const clusters = await client.send(new DescribeDBClustersCommand({}));
        for (const cluster of clusters.DBClusters) {
            console.log(`Found Cluster: ${cluster.DBClusterIdentifier} (${cluster.Status})`);
            if (cluster.DBClusterIdentifier === "dbtest-cluster") {
                console.log("DELETING dbtest-cluster...");
                await client.send(new DeleteDBClusterCommand({
                    DBClusterIdentifier: "dbtest-cluster",
                    SkipFinalSnapshot: true
                }));
            }
        }

        console.log("Cleanup check complete.");
    } catch (err) {
        console.log("Note: Resource might already be deleted or:", err.message);
    }
}

cleanup();
