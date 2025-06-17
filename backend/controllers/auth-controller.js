import otpService from "../services/otp-service.js";
import hashService from "../services/hash-service.js";
import userService from "../services/user-service.js";
import  tokenService from "../services/token-service.js";
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
    const {accessToken, refreshToken } =tokenService.generateTokens({id: user._id , activated: false});



res.cookie('refreshToken',refreshToken,{
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  httpOnly: true,
})
    
res.json({accessToken})

  }
}




export default new AuthController();
// This is a placeholder for the AuthController class.
