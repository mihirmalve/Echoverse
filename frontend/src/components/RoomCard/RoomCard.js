import React from 'react';
import styles from './RoomCard.module.css';
import { useNavigate } from 'react-router-dom';


const RoomCard = ({ room }) => {
    const navigate = useNavigate();
    const goToRoom = () => {
    navigate(`/room/${room.id}`);
  };
    return (
        <div
        onClick={goToRoom} // <-- navigate on click
            className={styles.card}
        >
            <h3 className={styles.topic}>{room.topic}</h3>
            <div
                className={`${styles.speakers} ${
                    room.speakers.length === 1 ? styles.singleSpeaker : ''
                }`}
            >
                <div className={styles.avatars}>
                    {room.speakers.map((speaker) => (
                        <img
                            key={speaker.id}
                            src={speaker.avatar}
                            alt="speaker-avatar"
                        />
                    ))}
                </div>
                <div className={styles.names}>
                    {room.speakers.map((speaker) => (
                        <div key={speaker.id} className={styles.nameWrapper}>
                            <span>{speaker.name}</span>
                            <img
                                src="/images/chats.png"
                                alt="chat"
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.peopleCount}>
                <span>{room.totalPeople}</span>
                <img src="/images/userc.png" alt="user-icon" />
            </div>
        </div>
    );
};

export default RoomCard;