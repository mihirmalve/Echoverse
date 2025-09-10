import React, { useState } from 'react';
import styles from './AddRoomModal.module.css';
import TextInput from '../shared/TextInput/TextInput';
import { createRoom as create } from '../../http';
import { useNavigate } from 'react-router-dom';

function AddRoomModel({ onClose }) {
  const [roomType, setRoomType] = useState('open'); // default: open
  const [topic, setTopic] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function createRoom() {
    try {
      if (!topic.trim()) {
        setError('⚠ Please enter a topic');
        return;
      }
      setError('');

      const { data } = await create({ topic, roomType });
      if (data.id) {
        onClose();
        setTopic('');
        setRoomType('open');
        navigate(`/room/${data.id}`);
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  return (
    <div className={styles.modalMask}>
      <div className={styles.modalBody}>
        {/* Close Button */}
        <button onClick={onClose} className={styles.closeButton}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className={styles.modalHeader}>
          <h3 className={styles.heading}>Enter the topic to be discussed</h3>
          <TextInput
            className={styles.textInput}
            fullwidth="true"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          {error && <p className={styles.error}>{error}</p>}

          <h2 className={styles.subHeading}>Room type</h2>
          <div className={styles.roomTypes} style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              onClick={() => setRoomType('open')}
              className={`${styles.typeBox} ${roomType === 'open' ? styles.active : ''}`}
            >
              <img src="/images/globe.png" alt="globe" />
              <span>Open</span>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <h2>Start a room, open to everyone</h2>
          <button onClick={createRoom} className={styles.footerButton}>
            <img src="/images/celebration.png" alt="celebration" />
            <span>Let's go</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddRoomModel;
