const https = require('https');

const options = {
    method: 'HEAD',
    headers: {
        'CONTEXT7_API_KEY': 'ctx7sk-66e4a0a6-7deb-4dfa-8022-dfbc06f4545e'
    }
};

const req = https.request('https://mcp.context7.com/mcp', options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
