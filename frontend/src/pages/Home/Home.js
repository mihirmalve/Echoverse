import React from 'react'
import styles from './Home.module.css'
import Card from '../../components/shared/Card/Card'
import Button from '../../components/shared/Button/Button'
import { Link , useNavigate} from 'react-router-dom'

function Home() {
    const signInLinkStyle = {
        color : '#0077FF',
        textDecoration : 'none',
        marginLeft : '10px',
        fontWeight : 'bold'
    }
    const navigate = useNavigate();

    function startRegister(){
      console.log('start register');
      navigate('/authenticate');
    }
  return (
    <div className={styles.cardWrapper}>
       <Card title="Welcome to Echoverse" icon="/images/download.svg">

       <div>
         <p className={styles.text}>
        Join live rooms on a wide range of topics or create your own 
        and bring people together through real-time audio. Whether
        you're here to speak, share ideas, or just listen and learn,
        Echoverse lets you connect effortlessly. Explore rooms, engage
        with speakers, and be part of a community where every voice matters.
         Ready to start talking?
         </p> 
        </div>
        <Button onclick={startRegister} text="Get Started" icon="/images/arrow.png"/>
       </Card>
    </div>
  )
}

export default Home
