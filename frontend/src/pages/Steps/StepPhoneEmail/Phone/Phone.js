import React from 'react'
import { useState } from 'react'
import Card from '../../../../components/shared/Card/Card'
import Button from '../../../../components/shared/Button/Button'
import TextInput from '../../../../components/shared/TextInput/TextInput'
import styles from '../StepPhoneEmail.module.css'
import { sendOtp } from '../../../../http/index.js'
import { useDispatch } from 'react-redux'
import {setOtp} from '../../../../store/authSlice.js'



const Phone = ({onNext}) => {

const [phoneNumber, setPhoneNumber] = useState('');
const [error, setError] = useState('');

const dispatch = useDispatch();

 async function submit() {
  if (!phoneNumber|| phoneNumber.length < 10|| phoneNumber.length > 10) {
    setError("Please enter a valid phone number");
    return;
  }
  setError(""); // clear error

  try {
    const { data } = await sendOtp({ phone: phoneNumber });
    console.log(data);
    dispatch(setOtp({ phone: data.phone, hash: data.hash }));
    onNext();
  } catch (err) {
    setError("Something went wrong. Please try again.");
  }
}

  return (
    <Card title="Enter Your Phone Number" icon="/images/Phone.png">
    <TextInput
  type="tel"   // 👈 "tel" use kar le, isme E ya . allowed nahi hota
  value={phoneNumber}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ''); // sirf digits rakho
    setPhoneNumber(value);
  }}
  maxLength={10}
/>
      {error && <p className={styles.error}>{error}</p>}
    <div>
      <div className={styles.actionButtonWrap}> 
          <Button  onclick={submit} text="Next" icon="/images/arrow.png"/>
      </div>
       <div className={styles.bottomParagraph}> 
        <p>By entering your number, you’re agreeing to our Terms of Service and Privacy Policy. Thanks!</p>
       </div>
     
     </div>
  
    </Card>
  )
}

export default Phone
 