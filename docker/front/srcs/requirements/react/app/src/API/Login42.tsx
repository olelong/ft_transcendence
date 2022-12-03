import axios from 'axios'

var ClientOAuth2 = require('client-oauth2')
 
var githubAuth = new ClientOAuth2({
  clientId: `${process.env.UID}`,
  clientSecret: `${process.env.SECRET}`,
  accessTokenUri: 'https://github.com/login/oauth/access_token',
  authorizationUri: 'https://github.com/login/oauth/authorize',
  redirectUri: `${process.env.REDIRECT_URI}`
  scopes: ['notifications', 'gist']
})
