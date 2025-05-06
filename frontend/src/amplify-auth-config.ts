import { Amplify } from "aws-amplify";
import type { ResourcesConfig } from "aws-amplify";

console.log("USER_POOL_ID:", process.env.REACT_APP_COGNITO_USER_POOL_ID);
console.log("CLIENT_ID:", process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID);
console.log("DOMAIN:", process.env.REACT_APP_COGNITO_DOMAIN);


const config: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID!,
      loginWith: {
        oauth: {
          domain: process.env.REACT_APP_COGNITO_DOMAIN!,
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: [process.env.REACT_APP_REDIRECT_SIGN_IN!],
          redirectSignOut: [process.env.REACT_APP_REDIRECT_SIGN_OUT!],
          responseType: 'code',
        },
      }
    }
  }
}

Amplify.configure(config)

export default config