const https = require('https');

const data = JSON.stringify({
  isLiveAnnouncementActive: true,
  liveAnnouncementText: "Bienvenue sur le nouveau site de l'École de Coran ! 🌟",
  liveAnnouncementStartDate: new Date().toISOString(),
  liveAnnouncementEndDate: new Date(Date.now() + 86400000 * 7).toISOString()
});

const options = {
  hostname: 'grgvcjsiap.us-east-1.awsapprunner.com',
  path: '/api/MosqueSettings',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let responseBody = '';
  res.on('data', (d) => { responseBody += d; });
  res.on('end', () => { 
    console.log("Response:", responseBody);
    if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log("\n✅ Banner activated successfully!"); 
    } else {
        console.log("\n❌ Failed to activate banner.");
    }
  });
});

req.on('error', (error) => { console.error(error); });
req.write(data);
req.end();
