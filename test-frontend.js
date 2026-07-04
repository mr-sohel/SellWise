const http = require('http');

http.get('http://localhost:5173', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    if(res.statusCode === 200) console.log('✅ Frontend responded.');
  });
}).on('error', err => {
  console.log('❌ Error connecting to frontend:', err.message);
});
