// config.js
let config;
if (process.env.REACT_APP_ENV === 'production') {
    console.log(process.env.REACT_APP_ENV+'aaa')
  config = require('./config.production').default;
} else {
    console.log(process.env.REACT_APP_ENV+'bbb')
  config = require('./config.development').default;
}

export default config;
