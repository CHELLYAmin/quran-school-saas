import axios from 'axios';

async function testApi() {
    try {
        // We know we need an auth token to bypass 401 Unauthorized.
        // I will try to login first.
        const loginRes = await axios.post('http://localhost:5000/api/Auth/login', {
            email: "admin@quranschool.com",
            password: "Password123!"
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log("--- Testing Group API ---");
        try {
            await axios.get('http://localhost:5000/api/Group', config);
            console.log("Group API OK");
        } catch (e: any) {
            console.error("Group API Failed:", e.response?.data || e.message);
        }

        console.log("\n--- Testing Level API ---");
        try {
            await axios.get('http://localhost:5000/api/Level', config);
            console.log("Level API OK");
        } catch (e: any) {
            console.error("Level API Failed:", e.response?.data || e.message);
        }

        console.log("\n--- Testing User Roles API ---");
        try {
            await axios.get('http://localhost:5000/api/User/roles?roles=Teacher&roles=Examiner', config);
            console.log("User Roles API OK");
        } catch (e: any) {
            console.error("User Roles API Failed:", e.response?.data || e.message);
        }

    } catch (err: any) {
        console.error("Login failed:", err.message);
    }
}

testApi();
