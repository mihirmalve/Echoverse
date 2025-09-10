import otpService from "../services/otp-service.js";
import hashService from "../services/hash-service.js";
import userService from "../services/user-service.js";
import  tokenService from "../services/token-service.js";
import UserDto from "../dtos/user-dto.js";
class AuthController {
async sendOtp(req,res){
   
  const {phone} = req.body;
  if (!phone) {
    return res.status(400).json({
      error: "Phone number is required",
    });
     
  }
  // generate otp
  const otp =await otpService.generateOtp();

//hashing the otp
  const ttl= 1000*60*2; // 2 minutes
  const expires = Date.now() + ttl;
  const data = `${phone}.${otp}.${expires}`;
  const hash=  await hashService.hashOtp(data);

  // send otp
  
try {
  await otpService.sendBySms(phone,otp);
  return res.json({
    hash: `${hash}.${expires}`,
    phone,
  })
}
catch (error) {
  console.error("Error sending OTP:", error);
  return res.status(500).json({
    error: "Failed to send OTP",
  });
}
}

async verifyOtp(req, res) {
  //logic
  const {phone, otp, hash} = req.body;
  
  if(!phone || !otp || !hash){
     return res.status(400).json({message: "All fields are required"});
  }
  const [hashedOtp, expires] = hash.split('.');
  if(Date.now() > +expires){
   return  res.status(400).json({message: "OTP expired"});
  }
  
  const data = `${phone}.${otp}.${expires}`;
  const isvalid = await otpService.verifyOtp(hashedOtp,data);
  
 if(!isvalid){
   return res.status(400).json({message: "Invalid OTP"});
  }

let user;

  try {
  user= await userService.findUser({phone});
  if (!user) {
    // Create a new user if not found
   user= await userService.createUser({phone});
  }
    } catch (error) {
      console.error("Error finding or creating user:", error);
      return res.status(500).json({message: "Internal server error"});
    }
   

    // Generate tokens
    const {accessToken, refreshToken } =tokenService.generateTokens({_id: user._id , activated: false});
   
  await tokenService.storeRefreshToken(refreshToken, user._id)

res.cookie('refreshToken',refreshToken,{
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  httpOnly: true,
})

res.cookie('accessToken',accessToken,{
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  httpOnly: true,
})
    

const userDto = new UserDto(user);
res.json({user: userDto,auth: true})

  }
  
  async refresh(req,res){
    //get refresh token from cookies
    const {refreshToken: refreshTokenFromCookie} = req.cookies;
    //check if token is valid
    let userData;
    try {
     userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
    } catch (error) {
      return res.status(401).json({message: "Invalid Token"});
    }
    // check if token is in db
   
    try {
        const token= await tokenService.findRefreshToken(userData._id, refreshTokenFromCookie);
      if(!token){
        return res.status(401).json({message: "Invalid Token"});
      }
    } catch (error) {
      return res.status(500).json({message: "Internal error"});
    }
    // check if valid user
    const user=  await userService.findUser({_id:userData._id});
    if(!user){
      return res.status(404).json({message: "User not found"});
  }
    // Generate new tokens
    const {accessToken, refreshToken } =  tokenService.generateTokens({_id:userData._id});
    // update refresh token in db
    try {
      await tokenService.updateRefreshToken(userData._id, refreshToken);
    }
    catch (error) {
      return res.status(500).json({message: "Internal error"});
    }  
    // set cookies
    res.cookie('refreshToken',refreshToken,{
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  httpOnly: true,
})

res.cookie('accessToken',accessToken,{
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  httpOnly: true,
})
    
// send response
const userDto = new UserDto(user);
res.json({user: userDto,auth: true});


}

//logut user
async logout(req,res){
  // delete refresh token from db
  const {refreshToken} = req.cookies;
  await tokenService.removeToken(refreshToken);
  // clear cookies
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');

  res.json({user: null, auth:false})
}

}


export default new AuthController();
// This is a placeholder for the AuthController class.
