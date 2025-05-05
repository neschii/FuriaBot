// backend/src/utils/twitchApi.js
const axios = require('axios');
const qs = require('querystring');

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_STREAMERS = process.env.TWITCH_STREAMERS ? process.env.TWITCH_STREAMERS.split(',').map(login => login.trim().toLowerCase()) : []; // Trim and lowercase logins for consistency

let accessToken = null;
let tokenExpiry = 0;


async function getAccessToken() {
  if (accessToken && tokenExpiry > Date.now() + 60000) {
    // console.log('Usando token da Twitch existente.');
    return accessToken;
  }

  console.log('Obtendo novo token da Twitch...');
   if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
      console.error('TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET not set in environment variables.');
      // Do not proceed if credentials are missing
      throw new Error('Twitch API credentials not configured.');
  }


  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', qs.stringify({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials'
    }));

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);

    console.log('Novo token da Twitch obtido com sucesso. Válido até:', new Date(tokenExpiry).toISOString());
    return accessToken;

  } catch (error) {
    console.error('Erro ao obter token da Twitch:', error.response ? error.response.data : error.message);
    accessToken = null;
    tokenExpiry = 0;
    // Re-throw the error so the caller knows it failed
    throw new Error('Failed to obtain Twitch access token: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
  }
}

// Função para verificar o status dos streamers
async function checkStreamStatus() {
  console.log(`[checkStreamStatus] -- START -- Verificando status para streamers: ${TWITCH_STREAMERS.join(', ')}`);

  let token;
  try {
      token = await getAccessToken();
      console.log(`[checkStreamStatus] Token obtained. Value is truthy: ${!!token}`); // Log after token
  } catch (tokenError) {
      console.error("[checkStreamStatus] Failed to get access token:", tokenError.message);
      token = null; // Ensure token is null on error
  }


  if (!token) {
    console.error("[checkStreamStatus] Não foi possível obter token da Twitch. Retornando todos como offline.");
    // Return all streamers as offline if token is not available
    return TWITCH_STREAMERS.map(login => ({ login, isOnline: false, title: '', viewer_count: 0, thumbnail_url: '', game_name: '', url: `https://www.twitch.tv/${login}`, profile_image_url: '' }));
  }

  if (TWITCH_STREAMERS.length === 0) {
       console.warn("[checkStreamStatus] A lista de streamers (TWITCH_STREAMERS) está vazia. Retornando array vazio.");
       return []; // Return empty array if no streamers are configured
  }

  console.log(`[checkStreamStatus] Proceeding with API calls...`); // Log before proceeding

  let users = []; // Declare users outside try for potential access in catch
  let userMapByLogin = {}; // Declare maps outside try

  try {
    // A API /helix/streams precisa dos IDs dos usuários, não dos logins.
    // Primeiro, obtemos os IDs dos usuários pelos logins.
    console.log(`[checkStreamStatus] Fetching user IDs and profile images for logins: ${TWITCH_STREAMERS.join(', ')}`);
    const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`
        },
        params: { login: TWITCH_STREAMERS }
    });

    users = userResponse.data.data; // Assign to outer scope variable
    console.log(`[checkStreamStatus] Twitch /helix/users response received. Found ${users.length} users.`);

    userMapByLogin = users.reduce((map, user) => { // Assign to outer scope variable
        map[user.login.toLowerCase()] = user; // Key map by lowercase login
        return map;
    }, {});

    const userIds = users.map(user => user.id);
    console.log(`[checkStreamStatus] User IDs found: ${userIds.join(', ')}`);


    if (userIds.length === 0) {
         console.warn(`[checkStreamStatus] Nenhum ID de usuário encontrado na resposta da Twitch para os logins fornecidos: ${TWITCH_STREAMERS.join(', ')}. Retornando todos como offline.`);
         // Return all streamers as offline, using profile images from found users (if any)
         return TWITCH_STREAMERS.map(login => ({
             login,
             isOnline: false,
             title: '',
             viewer_count: 0,
             thumbnail_url: '',
             game_name: '',
             url: `https://www.twitch.tv/${login}`,
             profile_image_url: userMapByLogin[login] ? userMapByLogin[login].profile_image_url : ''
         }));
    }


    // Agora, usamos os IDs para verificar o status das streams
    console.log(`[checkStreamStatus] Fetching stream status for user IDs: ${userIds.join(', ')}`);
    const streamResponse = await axios.get('https://api.twitch.tv/helix/streams', {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`
      },
      params: { user_id: userIds }
    });

    const onlineStreams = streamResponse.data.data;
    console.log(`[checkStreamStatus] Twitch /helix/streams response received. ${onlineStreams.length} streamers are currently online.`);

    // Create a set of logins for streamers who are currently online
    const onlineLogins = new Set(onlineStreams.map(stream => stream.user_login.toLowerCase()));

    console.log(`[checkStreamStatus] Online logins detected: ${Array.from(onlineLogins).join(', ')}`);


    // Map over the original list of streamers to return their status
    const finalStatus = TWITCH_STREAMERS.map(login => {
      const isOnline = onlineLogins.has(login.toLowerCase());
      const stream = onlineStreams.find(s => s.user_login.toLowerCase() === login.toLowerCase());
      const user = userMapByLogin[login.toLowerCase()]; // Use lowercase login for map lookup

      return {
        login: login,
        isOnline: isOnline,
        title: stream ? stream.title : '',
        viewer_count: stream ? stream.viewer_count : 0,
        thumbnail_url: stream ? stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180') : '',
        game_name: stream ? stream.game_name : '',
        url: `https://www.twitch.tv/${login}`,
        profile_image_url: user ? user.profile_image_url : ''
      };
    });
    console.log("[checkStreamStatus] -- END -- Returning streamer status.");
    return finalStatus;


  } catch (error) {
    console.error('[checkStreamStatus] Erro durante as chamadas da API Helix:', error.response ? error.response.data : error.message);

    // Return all streamers as offline in case of API errors
    // Try to include profile images if user data was successfully fetched before the stream call failed
    // Check if 'users' or 'userMapByLogin' variables populated before the error occurred
    const fallbackUserMap = {};
    if (users && users.length > 0) {
         users.forEach(user => fallbackUserMap[user.login.toLowerCase()] = user);
    } else if (Object.keys(userMapByLogin).length > 0) {
         Object.assign(fallbackUserMap, userMapByLogin); // Copy existing map if populated
    }


    const errorStatus = TWITCH_STREAMERS.map(login => ({
        login,
        isOnline: false,
        title: '',
        viewer_count: 0,
        thumbnail_url: '',
        game_name: '',
        url: `https://www.twitch.tv/${login}`,
        profile_image_url: fallbackUserMap[login.toLowerCase()] ? fallbackUserMap[login.toLowerCase()].profile_image_url : ''
    }));
     console.log("[checkStreamStatus] -- END (with Error) -- Returning error fallback status.");
    return errorStatus;
  }
}


module.exports = {
  checkStreamStatus
};