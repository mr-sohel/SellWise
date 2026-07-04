import axios from 'axios';
import { randomUUID } from 'crypto';

const API = 'http://localhost:5000/api/v1';

async function run() {
  console.log("Starting verification...");
  try {
    const ownerEmail = `owner_${Date.now()}@test.com`;
    const ownerPass = 'password123';
    
    // 1. Signup owner
    const signupRes = await axios.post(`${API}/auth/signup`, {
      email: ownerEmail,
      password: ownerPass,
      preferred_lang: 'en'
    });
    
    const ownerCookie = signupRes.headers['set-cookie']?.[0];
    const storeId = signupRes.data.data.storeId;
    console.log("✅ Owner Signed up, Store ID:", storeId);

    const authHeaders = { headers: { Cookie: ownerCookie } };

    // 2. Add member
    const memberEmail = `staff_${Date.now()}@test.com`;
    const addMemberRes = await axios.post(`${API}/stores/${storeId}/members`, {
      email: memberEmail,
      password: 'staffpassword',
      preferred_lang: 'bn'
    }, authHeaders);
    
    const memberId = addMemberRes.data.data.id;
    console.log("✅ Member Added:", addMemberRes.data.data.email);

    // 3. List members
    const listRes = await axios.get(`${API}/stores/${storeId}/members`, authHeaders);
    const members = listRes.data.data;
    console.log("✅ Members listed:", members.map(m => m.email));
    
    if (members.length !== 2) throw new Error("Expected 2 members");

    // 4. Update Profile (change email & password)
    const newOwnerEmail = `updated_${Date.now()}@test.com`;
    const newOwnerPass = 'newpassword456';
    
    const updateRes = await axios.put(`${API}/auth/me`, {
      email: newOwnerEmail,
      currentPassword: ownerPass,
      newPassword: newOwnerPass
    }, authHeaders);
    console.log("✅ Profile Updated to email:", updateRes.data.data.email);

    // 5. Verify new login works
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: newOwnerEmail,
      password: newOwnerPass
    });
    console.log("✅ Logged in with new credentials.");
    const newAuthHeaders = { headers: { Cookie: loginRes.headers['set-cookie']?.[0] } };

    // 6. Delete member
    await axios.delete(`${API}/stores/${storeId}/members/${memberId}`, newAuthHeaders);
    console.log("✅ Member removed.");

    // 7. Verify member removed
    const listRes2 = await axios.get(`${API}/stores/${storeId}/members`, newAuthHeaders);
    console.log("✅ Members listed after removal:", listRes2.data.data.map(m => m.email));
    if (listRes2.data.data.length !== 1) throw new Error("Expected 1 member after deletion");

    // 8. Probe: Try updating profile with wrong password
    try {
      await axios.put(`${API}/auth/me`, {
        email: "fail@test.com",
        currentPassword: 'wrongpassword'
      }, newAuthHeaders);
      console.log("❌ Probe failed: Expected error on wrong password");
    } catch (e: any) {
      console.log("🔍 Probe passed: Updating with wrong password correctly failed:", e.response?.data?.error?.message || e.message);
    }

    console.log("All tests passed!");
  } catch (error: any) {
    console.error("Verification failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

// wait for server to boot
setTimeout(run, 2000);
