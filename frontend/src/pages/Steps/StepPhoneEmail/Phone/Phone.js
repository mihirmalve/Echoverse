import React from 'react'
import { useState } from 'react'
import Card from '../../../../components/shared/Card/Card'
import Button from '../../../../components/shared/Button/Button'
import TextInput from '../../../../components/shared/TextInput/TextInput'
import styles from '../StepPhoneEmail.module.css'



const Phone = ({onNext}) => {


const [phoneNumber, setPhoneNumber] = useState('');
  return (
    <Card title="Enter Your Phone Number" icon="/images/Phone.png">
     <TextInput value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
    <div>
      <div className={styles.actionButtonWrap}> 
          <Button  onclick={onNext} text="Next" icon="/images/arrow.png"/>
      </div>
       <div className={styles.bottomParagraph}> 
        <p>By entering your number, you’re agreeing to our Terms of Service and Privacy Policy. Thanks!</p>
       </div>
     
     </div>
  
    </Card>
  )
}

export default Phone
 