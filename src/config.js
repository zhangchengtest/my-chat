const env = process.env.REACT_APP_ENV || 'development';

const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    websocketUrl: 'ws://localhost:8080/chat'
  },
  production: {
    apiUrl: 'https://api.example.com',
    websocketUrl: 'ws://chat.punengshuo.com/chat'
  }
};

const currentConfig = config[env];

export default currentConfig;
