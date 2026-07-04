import axios from 'axios';
const API = 'http://localhost:5000/api/v1';

async function run() {
  try {
    const signupRes = await axios.post(`${API}/auth/signup`, {
      email: `test_${Date.now()}@test.com`,
      password: 'password123',
      preferred_lang: 'en'
    });
    const cookie = signupRes.headers['set-cookie']?.[0];
    const storeId = signupRes.data.data.storeId;
    
    await axios.get(`${API}/stores/${storeId}/products?page=1&limit=10`, {
      headers: { Cookie: cookie }
    });
    console.log("Success");
  } catch (err: any) {
    console.error(JSON.stringify(err.response?.data, null, 2));
  }
}
run();
