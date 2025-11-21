const http = require('http');

const data = JSON.stringify({
    member_id: 1 // Using an existing member ID for simplicity
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/chits/1/members',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response Body: ${body}`);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
