const axios = require('axios');

// A lot of instruction for how to connect to the Spotify db can be found at https://developer.spotify.com/
// Create an account, add the server address to the white list
// use the Client ID and password for the .env file

// Error I have found - Be quick when typing into /search. If you type a single letter, the site will crash probably due to too many results

class SpotifyService {
    constructor() {
        this.clientId = process.env.SPOTIFY_CLIENT_ID;
        this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        this.baseUrl = 'https://api.spotify.com/v1';
        this.tokenUrl = 'https://accounts.spotify.com/api/token';
        this.accessToken = null;
        this.tokenExpiresAt = null;
    }

    async getAccessToken() {
        // Check if token exists and is not expired
        if (this.accessToken && this.tokenExpiresAt > Date.now()) {
            return this.accessToken;
        }

        try {
            const response = await axios.post(this.tokenUrl,
                'grant_type=client_credentials', {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                this.accessToken = response.data.access_token;
                this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);
                return this.accessToken;
        } catch (error) {
            console.error('Error getting Spotify access token:', error);
            throw error;
        }
    }

    async searchAlbums(query, limit = 20, offset = 0) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get(`${this.baseUrl}/search`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    q: query,
                    type: 'album',
                    limit,
                    offset
                }
            });

            return response.data.albums;
        } catch (error) {
            console.error('Error searching albums:', error);
            throw error;
        }
    }

    async getAlbumDetails(albumId) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get(`${this.baseUrl}/albums/${albumId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting album details:', error);
            throw error;
        }
    }
}

module.exports = new SpotifyService();