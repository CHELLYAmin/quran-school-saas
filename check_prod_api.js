const axios = require('axios');

async function checkProdApi() {
    const apiUrl = 'https://grgvcjsiap.us-east-1.awsapprunner.com/api/MosqueSettings';
    try {
        console.log(`Checking API: ${apiUrl}`);
        const response = await axios.get(apiUrl);
        console.log("=== PROD MOSQUE SETTINGS ===");
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.isLiveAnnouncementActive) {
            console.log("\n✅ News Banner is ACTIVE in Production");
            console.log(`Message: ${response.data.liveAnnouncementText}`);
        } else {
            console.log("\n❌ News Banner is INACTIVE in Production");
        }
    } catch (err) {
        console.error("ERROR:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        }
    }
}

checkProdApi();
