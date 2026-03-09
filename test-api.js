const http = require('http');

const data = JSON.stringify({
    email: "admin@alnoor-quran.fr",
    password: "Admin@123"
});

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/Auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        try {
            const token = JSON.parse(body).token;
            if (!token) throw new Error("No token returned");

            const config = {
                hostname: 'localhost',
                port: 5000,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            // Test groups
            http.get({ ...config, path: '/api/Group' }, (r) => {
                console.log(`GET /api/Group -> ${r.statusCode}`);
                if (r.statusCode >= 400) { r.on('data', d => console.error(d.toString())); }
            });

            // Test levels
            http.get({ ...config, path: '/api/Level' }, (r) => {
                console.log(`GET /api/Level -> ${r.statusCode}`);
                if (r.statusCode >= 400) { r.on('data', d => console.error(d.toString())); }
            });

            // Test user roles
            http.get({ ...config, path: '/api/User/roles?roles=Teacher&roles=Examiner' }, (r) => {
                console.log(`GET /api/User/roles?roles=Teacher&roles=Examiner -> ${r.statusCode}`);
                if (r.statusCode >= 400) { r.on('data', d => console.error(d.toString())); }
            });

        } catch (e) { console.error("Login failed:", e, body); }
    });
});
req.write(data);
req.end();
