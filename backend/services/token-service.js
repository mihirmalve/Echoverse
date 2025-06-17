import jwt from 'jsonwebtoken';

const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
class TokenService {
   generateTokens(payload){
  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: '1h' // Access token valid for 1 hour
  })

  const refreshToken = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: '7d' // Refresh token valid for 7 days
  })
    return { accessToken, refreshToken };

   }
}


  export default new TokenService();