const fs = require('fs');

async function test() {
  let out = "";
  const log = (msg) => { out += msg + '\n'; console.log(msg); };
  
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "admin@testorg.com", password: "password123" })
    });
    const data = await res.json();
    log("Status: " + res.status);
    log("Response: " + JSON.stringify(data, null, 2));

    if (res.status === 200 && data.token) {
      const orgRes = await fetch('http://localhost:5000/api/organization', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const orgData = await orgRes.json();
      log("Org Status: " + orgRes.status);
      log("Org Response: " + JSON.stringify(orgData, null, 2));
    }
  } catch (err) {
    log("Error: " + err);
  }
  
  fs.writeFileSync('test-output.txt', out);
}
test();
