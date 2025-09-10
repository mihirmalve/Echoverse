import React, { useState } from 'react';
import Card from '../../../components/shared/Card/Card';
import Button from '../../../components/shared/Button/Button';
import styles from './StepAvatar.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { setAvatar } from '../../../store/activateSlice';
import { setAuth } from '../../../store/authSlice.js';
import { activate } from '../../../http/index.js';
import Loader from '../../../components/shared/Loader/Loader';

const StepAvatar = ({onNext}) => {
   const dispatch = useDispatch();
    const { name, avatar } = useSelector((state) => state.activate);
    const [image, setImage] = useState('/images/avatar.png');
     const [loading, setLoading] = useState(false);
    function captureImage(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            setImage(reader.result);
            dispatch(setAvatar(reader.result));
        };
    }
    async function submit() {
      if(!name || !avatar) {
        return;
      }
      setLoading(true);
      try {
        const {data} = await activate({name, avatar});
        if(data.auth){
          dispatch(setAuth(data));
        
        }
       
      } catch (error) {
        console.log(error);
      }
      finally {
            setLoading(false);
        }
        
    }
     if (loading) return <Loader message="Activation in progress..." />;
  return (
    <>
     <Card title={`Okay, ${name}`} icon="/images/monkey-emoji.png">
                <p className={styles.subHeading}>How’s this photo?</p>
                <div className={styles.avatarWrapper}>
                    <img
                        className={styles.avatarImage}
                        src={image}
                        alt="avatar"
                    />
                </div>
                <div>
                    <input
                        onChange={captureImage}
                        id="avatarInput"
                        type="file"
                        className={styles.avatarInput}
                    />
                    <label className={styles.avatarLabel} htmlFor="avatarInput">
                        Choose a different photo
                    </label>
                </div>
                <div className={styles.buttonWrapper}>
                    <Button onclick={submit} text="Next" icon="/images/arrow.png" />
                </div>
            </Card>
    </>
  )
}

export default StepAvatar
