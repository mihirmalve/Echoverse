import React from 'react'
import styles from './Button.module.css'

const Button = ({onclick,text,icon}) => {
  return (
    <div>
    <button onClick={onclick} className={styles.button}>
        <span>{text}</span>
        <img className={styles.arrow} src={icon} alt="arrow" />
    </button>
</div>
  ) 
}

export default Button
