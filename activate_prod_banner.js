const https = require('https');

const data = JSON.stringify({
  isLiveAnnouncementActive: true,
  liveAnnouncementText: "Bienvenue sur le nouveau site de l'École de Coran ! 🌟",
  liveAnnouncementStartDate: new Date().toISOString(),
  liveAnnouncementEndDate: new Date(Date.now() + 86400000 * 7).toISOString() // 7 days
});

const options = {
  hostname: 'grgvcjsiap.us-east-1.awsapprunner.com',
  path: '/api/MosqueSettings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  res.on('data', (d) => { process.stdout.write(d); });
  res.on('end', () => { console.log("\n✅ Banner activated successfully!"); });
});

req.on('error', (error) => { console.error(error); });
req.write(data);
req.end();
