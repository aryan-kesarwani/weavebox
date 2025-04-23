import { Request, Response } from 'express';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive'],
    });
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Here you can save the user info and tokens to your database
    // For now, we'll just return the tokens and user info
    res.json({
      tokens,
      user: data,
    });
  } catch (error) {
    console.error('Error during Google callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
       res.status(400).json({ error: 'Access token is required' });
       return;
    }

    // Create a new OAuth2Client instance for verification
    const verifyClient = new OAuth2Client();
    
    // Set the access token with proper formatting
    verifyClient.setCredentials({
      access_token: access_token,
      token_type: 'Bearer'
    });

    // Get user info using the token
    const oauth2 = google.oauth2({ 
      version: 'v2', 
      auth: verifyClient,
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const { data } = await oauth2.userinfo.get();

    res.json({
      isValid: true,
      user: data,
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ 
      error: 'Invalid token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 