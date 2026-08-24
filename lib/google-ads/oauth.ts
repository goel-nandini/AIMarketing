export class GoogleAdsOAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_ADS_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET || '';
    this.redirectUri = process.env.GOOGLE_ADS_REDIRECT_URI || 'http://localhost:3000/api/auth/google-ads/callback';
  }

  // Generate OAuth login URL
  getAuthUrl(): string {
    const scope = encodeURIComponent('https://www.googleapis.com/auth/adwords');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  }

  // Exchange auth code for tokens
  async exchangeCodeForTokens(code: string) {
    if (!this.clientId || !this.clientSecret) {
      return {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 3600,
      };
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      console.error('[Google Ads OAuth Error]:', error);
      throw error;
    }
  }
}

export const googleAdsOAuthService = new GoogleAdsOAuthService();
