import dotenv from 'dotenv';
dotenv.config(); // ensure env is loaded in THIS file too
import crypto from 'crypto';
import twilio from 'twilio';
import HashService from './hash-service.js';

const smsSid = process.env.SMS_SID;
const smsAuthToken = process.env.SMS_AUTH_TOKEN;

const client = twilio(smsSid, smsAuthToken);

class OtpService{
  async generateOtp() {
   
    const otp=   Math.floor(1000 + Math.random() * 9000);
    return otp;
}

  async sendBySms(phone,otp){
     return await client.messages.create({
      to: phone,
      from: process.env.SMS_FROM_NUMBER,
      body: `Welcome to VOICE_SYNC, your OTP is ${otp}. It is valid for 2 minutes.`,
     })
  }

  async verifyOtp(hashedOtp, data) {
    let computedHash = await HashService.hashOtp(data);
    // Compare the computed hash with the provided hash
    return computedHash === hashedOtp;
    
  }
}
export default new OtpService();
