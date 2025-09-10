import React, { useState, useEffect } from 'react';
import RoomCard from '../../components/RoomCard/RoomCard';
import styles from './Rooms.module.css';
import AddRoomModal from '../../components/AddRoomModal/AddRoomModal';
import { getAllRooms } from '../../http/index.js';

const Rooms = () => {
  const [showModal, setShowModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // search state

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await getAllRooms();
      setRooms(data);
    };
    fetchRooms();
  }, []);

  function openModal() {
    setShowModal(true);
  }

  // filter logic
  const filteredRooms = rooms.filter((room) =>
    room.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="container">
        <div className={styles.roomsHeader}>
          <div className={styles.left}>
            <span className={styles.heading}>All voice rooms</span>
            <div className={styles.searchBox}>
              <img src="/images/search.png" alt="search" />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // update state
              />
            </div>
          </div>
          <div className={styles.right}>
            <button
              onClick={openModal}
              className={styles.startRoomButton}
            >
              <img src="/images/group.png" alt="add-room" />
              <span>Start a room</span>
            </button>
          </div>
        </div>

        <div className={styles.roomList}>
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))
          ) : (
            <p>No rooms found</p> // fallback if no match
          )}
        </div>
      </div>
      {showModal && <AddRoomModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Rooms;
