// Configuration and environment variables
export const config = {
  // GitHub SDK Configuration
  github: {
    owner: import.meta.env.VITE_GITHUB_OWNER || 'your-github-username',
    repo: import.meta.env.VITE_GITHUB_REPO || 'gostore-data',
    token: import.meta.env.VITE_GITHUB_TOKEN || '',
    branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
  },
  
  // Chutes AI Configuration
  chutesAI: {
    apiToken: import.meta.env.VITE_CHUTES_API_TOKEN || '',
  },
  
  // Cloudinary Configuration (for media uploads)
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
  },
  
  // SMTP Configuration (for emails)
  smtp: {
    endpoint: import.meta.env.VITE_SMTP_ENDPOINT || '',
    from: import.meta.env.VITE_SMTP_FROM || 'noreply@gostore.com',
  },
  
  // App Configuration
  app: {
    name: 'GoStore',
    version: '1.0.0',
    domain: 'gostore.com',
    supportEmail: 'support@gostore.com',
  },
};

// Validation function to check if required environment variables are set
export const validateConfig = () => {
  const required = [
    'VITE_GITHUB_OWNER',
    'VITE_GITHUB_REPO', 
    'VITE_GITHUB_TOKEN',
    'VITE_CHUTES_API_TOKEN'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    console.warn('Please set these in your .env file for full functionality');
  }
  
  return missing.length === 0;
};