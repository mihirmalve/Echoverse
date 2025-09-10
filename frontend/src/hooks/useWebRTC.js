import { useEffect, useState, useRef, useCallback } from 'react';
import { ACTIONS } from '../actions';
import socketInit from '../socket';
import freeice from 'freeice';
import { useStateWithCallback } from './useStateWithCallback';

export const useWebRTC = (roomId, user) => {
  const [clients, setClients] = useStateWithCallback([]);
  const audioElements = useRef({});
  const connections = useRef({});
  const socket = useRef(null);
  const localMediaStream = useRef(null);
  const clientsRef = useRef([]);
  const initRef = useRef(false); // guard for StrictMode double-render

  const addNewClient = useCallback(
    (newClient, cb) => {
      const lookingFor = clientsRef.current.find(
        (client) => client.id === newClient.id
      );

      if (!lookingFor) {
        setClients((existingClients) => [...existingClients, newClient], cb);
      }
    },
    [setClients]
  );

  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);

  useEffect(() => {
    if (initRef.current) return; // prevents double init in Strict Mode (dev)
    initRef.current = true;

    let mounted = true;

    const initChat = async () => {
      try {
        socket.current = socketInit();

        // capture media with echo/noise/gain control constraints
        await captureMedia();

        if (!mounted) return;

        addNewClient({ ...user, muted: true }, () => {
          const localElement = audioElements.current[user.id];
          if (localElement && localMediaStream.current) {
            localElement.volume = 0;
            localElement.srcObject = localMediaStream.current;
            localMediaStream.current.getTracks()[0].enabled = false;
          }
        });

        // socket listeners
        socket.current.on(ACTIONS.MUTE_INFO, ({ userId, isMute }) => {
          handleSetMute(isMute, userId);
        });

        socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
        socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
        socket.current.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
        socket.current.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
        socket.current.on(ACTIONS.MUTE, ({ peerId, userId }) => {
          handleSetMute(true, userId);
        });
        socket.current.on(ACTIONS.UNMUTE, ({ peerId, userId }) => {
          handleSetMute(false, userId);
        });

        socket.current.emit(ACTIONS.JOIN, {
          roomId,
          user,
        });
      } catch (err) {
        console.error('initChat error:', err);
      }
    };

    async function captureMedia() {
      try {
        // add constraints to reduce echo/noise and auto gain
        localMediaStream.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            // optional: higher quality settings (browsers may ignore some)
            channelCount: 1,
            sampleRate: 48000,
            sampleSize: 16,
          },
        });
      } catch (err) {
        console.error('Failed to get user media:', err);
        throw err;
      }
    }

    async function handleNewPeer({ peerId, createOffer, user: remoteUser }) {
      try {
        if (connections.current[peerId]) {
          return console.warn(`Already connected with ${peerId} (${user.name})`);
        }

        const pc = new RTCPeerConnection({ iceServers: freeice() });
        connections.current[peerId] = pc;

        pc.onicecandidate = (event) => {
          if (event.candidate && socket.current) {
            socket.current.emit(ACTIONS.RELAY_ICE, {
              peerId,
              icecandidate: event.candidate,
            });
          }
        };

        pc.ontrack = ({ streams: [remoteStream] }) => {
          addNewClient({ ...remoteUser, muted: true }, () => {
            // send local mute info to remote
            const currentUser = clientsRef.current.find(
              (client) => client.id === user.id
            );
            if (currentUser && socket.current) {
              socket.current.emit(ACTIONS.MUTE_INFO, {
                userId: user.id,
                roomId,
                isMute: currentUser.muted,
              });
            }

            // attach remote stream to audio element when available
            if (audioElements.current[remoteUser.id]) {
              audioElements.current[remoteUser.id].srcObject = remoteStream;
            } else {
              // Retry attaching with limited retries instead of infinite interval
              let retries = 0;
              const maxRetries = 10;

              const tryAttach = () => {
                const el = audioElements.current[remoteUser.id];
                if (el) {
                  el.srcObject = remoteStream;
                } else if (retries < maxRetries) {
                  retries += 1;
                  setTimeout(tryAttach, 250);
                } else {
                  console.warn('Could not attach remote audio element for', remoteUser.id);
                }
              };

              tryAttach();
            }
          });
        };

        // add local tracks
        if (localMediaStream.current) {
          localMediaStream.current.getTracks().forEach((track) => {
            pc.addTrack(track, localMediaStream.current);
          });
        }

        if (createOffer) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          if (socket.current) {
            socket.current.emit(ACTIONS.RELAY_SDP, {
              peerId,
              sessionDescription: offer,
            });
          }
        }
      } catch (err) {
        console.error('handleNewPeer error:', err);
      }
    }

    async function handleRemovePeer({ peerId, userId }) {
      try {
        if (connections.current[peerId]) {
          connections.current[peerId].close();
        }
        delete connections.current[peerId];
        delete audioElements.current[peerId];
        setClients((list) => list.filter((c) => c.id !== userId));
      } catch (err) {
        console.error('handleRemovePeer error:', err);
      }
    }

    async function handleIceCandidate({ peerId, icecandidate }) {
      try {
        if (!icecandidate) return;
        const pc = connections.current[peerId];
        if (pc) await pc.addIceCandidate(icecandidate);
      } catch (err) {
        console.error('handleIceCandidate error:', err);
      }
    }

    async function setRemoteMedia({ peerId, sessionDescription: remoteSessionDescription }) {
      try {
        const pc = connections.current[peerId];
        if (!pc) return console.warn('No connection for peer', peerId);

        await pc.setRemoteDescription(new RTCSessionDescription(remoteSessionDescription));

        if (remoteSessionDescription.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          if (socket.current) {
            socket.current.emit(ACTIONS.RELAY_SDP, {
              peerId,
              sessionDescription: answer,
            });
          }
        }
      } catch (err) {
        console.error('setRemoteMedia error:', err);
      }
    }

    async function handleSetMute(mute, userId) {
      try {
        const clientIdx = clientsRef.current.map((c) => c.id).indexOf(userId);
        const allConnectedClients = JSON.parse(JSON.stringify(clientsRef.current));
        if (clientIdx > -1) {
          allConnectedClients[clientIdx].muted = mute;
          setClients(allConnectedClients);
        }
      } catch (err) {
        console.error('handleSetMute error:', err);
      }
    }

    initChat();

    return () => {
      mounted = false;
      initRef.current = false;

      try {
        if (localMediaStream.current) {
          localMediaStream.current.getTracks().forEach((track) => track.stop());
        }

        if (socket.current) {
          socket.current.emit(ACTIONS.LEAVE, { roomId });
        }

        for (let peerId in connections.current) {
          connections.current[peerId].close();
          delete connections.current[peerId];
          delete audioElements.current[peerId];
        }

        if (socket.current) {
          socket.current.off(ACTIONS.ADD_PEER, handleNewPeer);
          socket.current.off(ACTIONS.REMOVE_PEER, handleRemovePeer);
          socket.current.off(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
          socket.current.off(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
          socket.current.off(ACTIONS.MUTE);
          socket.current.off(ACTIONS.UNMUTE);
        }
      } catch (err) {
        console.error('cleanup error:', err);
      }
    };
  }, [roomId, user, addNewClient]);

  const provideRef = (instance, userId) => {
    audioElements.current[userId] = instance;
  };

  const handleMute = (isMute, userId) => {
    if (userId === user.id) {
      // wait until localMediaStream available then toggle track
      let attempts = 0;
      const maxAttempts = 10;

      const tryToggle = () => {
        attempts += 1;
        if (localMediaStream.current && localMediaStream.current.getTracks().length) {
          localMediaStream.current.getTracks()[0].enabled = !isMute;
          if (socket.current) {
            socket.current.emit(isMute ? ACTIONS.MUTE : ACTIONS.UNMUTE, {
              roomId,
              userId: user.id,
            });
          }
        } else if (attempts < maxAttempts) {
          setTimeout(tryToggle, 200);
        } else {
          console.warn('Could not toggle mute, media stream not available');
        }
      };

      tryToggle();
    }
  };

  return {
    clients,
    provideRef,
    handleMute,
  };
};
