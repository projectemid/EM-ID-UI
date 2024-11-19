// import { Amplify } from "aws-amplify";



export const awsconfig = {
    Auth: {
      region: "us-east-1",
      userPoolId: "us-east-1_aIT1U6BjO",
      userPoolWebClientId: "572klhnhoev3svo27a8dl3iija",
      oauth: {
        domain: "emid-auth.auth.us-east-1.amazoncognito.com",
        redirectSignIn: "https://master.d36oqwnd21kzf4.amplifyapp.com/",
        redirectSignOut: "https://master.d36oqwnd21kzf4.amplifyapp.com/",
        responseType: "code",
      },
    },
  };
  