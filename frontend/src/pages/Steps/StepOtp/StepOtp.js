import React ,{useState}from 'react'
import Card from '../../../components/shared/Card/Card'
import Button from '../../../components/shared/Button/Button'
import TextInput from '../../../components/shared/TextInput/TextInput'
import styles from './StepOtp.module.css'
import { verifyOtp } from '../../../http/index.js'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux';
import{setAuth} from '../../../store/authSlice.js'

const StepOtp = () => {
  const [otp, setOtp] = useState('');
  const dispatch = useDispatch();

  const {phone, hash} = useSelector((state) => state.auth.otp);
 async function submit() {
    if(!otp||!phone||!hash){
        return ;
    }
    try {
        const {data} = await verifyOtp({otp, phone, hash});
        console.log(data);
        dispatch(setAuth(data));
    } catch (error) {
        console.error("Error verifying OTP:", error);
    }
  
  }
  return (
            <div className={styles.cardWrapper}>
                <Card
                    title="Enter the code we just texted"
                    icon="/images/otp.png"
                >
                    <TextInput
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <div className={styles.actionButtonWrap}>
                        <Button onclick={submit}icon="/images/arrow.png" text="Next" />
                    </div>
                    <p className={styles.bottomParagraph}>
                        By entering your number, you’re agreeing to our Terms of
                        Service and Privacy Policy. Thanks!
                    </p>
                </Card>
            </div>

  )
}

export default StepOtp
