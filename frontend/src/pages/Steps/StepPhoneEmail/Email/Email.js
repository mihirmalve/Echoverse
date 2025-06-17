import React, { useState } from 'react'
import Card from '../../../../components/shared/Card/Card'
import Button from '../../../../components/shared/Button/Button'
import TextInput from '../../../../components/shared/TextInput/TextInput'
import styles from '../StepPhoneEmail.module.css'

// import styles from './Email.module.css'
// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useDispatch } from 'react-redux'
// import { setEmail } from '../../../../redux/slices/userSlice'
// import { toast } from 'react-toastify'
// import { validateEmail } from '../../../../utils/validateEmail'              

const Email = ({onNext}) => {
  const [email, setEmail] = useState('');
  return (
    <Card title="Enter Your Email" icon="/images/Email1.png">
    <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
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

export default Email
