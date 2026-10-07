const axios = require('axios');
const jwt = require('jsonwebtoken');

const secret = "98a9cb40e68705c89c359e32ecca35b60ec309b8e481bbcaf3371adbdde1900ae8b1517d0c7f4aa13ba4c1665830fd8ae2eab20819432426c9ca6eca3bc0354c";

const users = [
  { id: "cmu5uu3y80000l004ulqht5i5", email: "prantokih42@gmail.com" },
  { id: "cmu5ps55a0001l204xocjpl5e", email: "kihpranto42@gmail.com" }
];

async function run() {
  for (const u of users) {
    const token = jwt.sign({ userId: u.id, email: u.email, role: 'USER' }, secret, { expiresIn: '1h' });
    try {
      const res = await axios.get('https://replio-backend.vercel.app/api/replies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Live Vercel GET /api/replies for ${u.email}:`, JSON.stringify(res.data, null, 2));
    } catch (e) {
      console.error(`Live Vercel GET /api/replies for ${u.email} error:`, e.response?.status, e.response?.data || e.message);
    }
  }
}

run();
