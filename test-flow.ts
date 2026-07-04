import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
});

async function run() {
  try {
    // 1. Signup
    const email = `test-${Date.now()}@example.com`;
    console.log(`Signing up ${email}...`);
    let authRes = await api.post('/auth/register', {
      email,
      password: 'password123',
      name: 'Test User'
    });
    
    const cookie = authRes.headers['set-cookie'];
    if (cookie) {
      api.defaults.headers.Cookie = cookie;
    } else {
        console.log("No cookie returned. Maybe need to login manually?");
        // Try login
        authRes = await api.post('/auth/login', {
            email,
            password: 'password123'
        });
        api.defaults.headers.Cookie = authRes.headers['set-cookie'];
    }

    console.log("Login res:", authRes.data);

    // 2. Create Store
    console.log("Creating store...");
    const storeRes = await api.post('/stores', {
      name: 'My Store',
      currency: 'BDT',
      language: 'en'
    });
    console.log("Store res:", storeRes.data);
    const storeId = storeRes.data.data.id;

    // 3. Get Products
    console.log("Fetching products...");
    const prodRes = await api.get(`/stores/${storeId}/products`);
    console.log("Products res:", prodRes.data);
    
    // 4. Get Customers
    console.log("Fetching customers...");
    const custRes = await api.get(`/stores/${storeId}/customers`);
    console.log("Customers res:", custRes.data);

    // 5. Get Expenses
    console.log("Fetching expenses...");
    const expRes = await api.get(`/stores/${storeId}/expenses`);
    console.log("Expenses res:", expRes.data);

  } catch (error) {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else {
      console.error(error);
    }
  }
}

run();
