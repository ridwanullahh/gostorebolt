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
    domain: import.meta.env.VITE_APP_DOMAIN || 'gostore.com',
    supportEmail: 'support@gostore.com',
  },

  // Super Admin Configuration (Environment-based)
  superAdmins: (() => {
    const admins = [];
    let i = 1;
    while (import.meta.env[`VITE_SUPER_ADMIN_${i}_EMAIL`]) {
      admins.push({
        email: import.meta.env[`VITE_SUPER_ADMIN_${i}_EMAIL`],
        password: import.meta.env[`VITE_SUPER_ADMIN_${i}_PASSWORD`],
        name: import.meta.env[`VITE_SUPER_ADMIN_${i}_NAME`] || `Super Admin ${i}`,
      });
      i++;
    }
    return admins;
  })(),
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
    console.warn('The platform will work with demo data until these are configured');
  }
  
  return missing.length === 0;
};

// Initialize config validation
validateConfig();