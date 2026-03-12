const https = require('https');

https.get('https://grgvcjsiap.us-east-1.awsapprunner.com/api/MosqueSettings', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("=== PROD RESPONSE ===");
    console.log(data);
    try {
        const json = JSON.parse(data);
        console.log("\nStatus: " + (json.isLiveAnnouncementActive ? "ACTIVE" : "INACTIVE"));
        console.log("Text: " + json.liveAnnouncementText);
    } catch(e) {
        console.log("Parse error: " + e.message);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
