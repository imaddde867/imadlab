const express = require('express');
const open = require('open').default;
const axios = require('axios');

const client_id = 'bf6a88d1b06f4752a7a566b58a2c7432';
const client_secret = '13190f676d9348c4a3cfce7a7556bfa0';
const redirect_uri = 'http://127.0.0.1:8888/callback';
const scopes = 'user-read-currently-playing user-read-playback-state';

const app = express();

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirect_uri);

  const authHeader = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    res.send(`Refresh Token: <code>${response.data.refresh_token}</code><br>Copy and save this!`);
    console.log('Refresh Token:', response.data.refresh_token);
    process.exit(0);
  } catch (err) {
    res.send('Error getting tokens: ' + err);
    process.exit(1);
  }
});

app.listen(8888, '127.0.0.1', () => {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scopes)}`;
  open(authUrl);
  console.log('Go to the browser and authorize the app.');
});