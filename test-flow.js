const axios = require('axios');

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/v1',
  withCredentials: true,
});

async function run() {
  try {
    const email = `test-${Date.now()}@example.com`;
    console.log(`Signing up ${email}...`);
    let authRes = await api.post('/auth/signup', {
      email,
      password: 'password123',
      name: 'Test User'
    });
    
    const cookie = authRes.headers['set-cookie'];
    if (cookie) {
      api.defaults.headers.Cookie = cookie;
    }

    const storeRes = await api.post('/stores', {
      name: 'My Store',
      currency: 'BDT',
      language: 'en'
    });
    const storeId = storeRes.data.data.id;
    console.log("Store ID:", storeId);

    console.log("Fetching products...");
    const prodRes = await api.get(`/stores/${storeId}/products`, { params: { page: 1, limit: 10, search: "" } });
    console.log("Products res:", prodRes.data);

    console.log("Fetching customers...");
    const custRes = await api.get(`/stores/${storeId}/customers`, { params: { page: 1, limit: 10, search: "" } });
    console.log("Customers res:", custRes.data);

    console.log("Fetching expenses...");
    const expRes = await api.get(`/stores/${storeId}/expenses`, { params: { page: 1, limit: 10 } });
    console.log("Expenses res:", expRes.data);

  } catch (error) {
    if (error.response) {
      console.error("API Error:", error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error);
    }
  }
}

run();
