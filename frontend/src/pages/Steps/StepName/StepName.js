import React from 'react'
import Card from '../../../components/shared/Card/Card'
import Button from '../../../components/shared/Button/Button'
import TextInput from '../../../components/shared/TextInput/TextInput'
import styles from './StepName.module.css'
import { useState } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { setName } from '../../../store/activateSlice'

const StepName = ({onNext}) => {
  const name = useSelector((state) => state.activate.name);
  const dispatch = useDispatch();
    const [Fullname, setFullname] = useState(name);

  function nextStep() {
    if(!Fullname) {
     return;
    }
    dispatch(setName(Fullname));
    onNext();
    
  }
  return (
  <>
      <Card
    title= "What's your Full Name?"
    icon="/images/nameemo.png"
    >
    <TextInput
    value={Fullname}
    onChange={(e) => setFullname(e.target.value)}
    />
    <div className={styles.actionButtonWrap}>
    <Button onclick={nextStep}icon="/images/arrow.png" text="Next" />
    </div>
    <p className={styles.bottomParagraph}>
       think of a name that you would like to be called by your friends and family.
    </p>
    </Card>
    </>

  )
}

export default StepName
