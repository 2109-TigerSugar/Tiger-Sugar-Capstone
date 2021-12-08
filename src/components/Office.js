import React, { useEffect, useState } from 'react';
import Popup from './Popup';
import { Link } from 'react-router-dom';
import { socket, makePeer } from '../socket';
import runWebRTC from '../webcam';
import { hidePanels, showPanels } from '../helperFunctions';
import NameDisplay from './NameDisplay';


const Office = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  let userData = JSON.parse(window.localStorage.getItem('userData'));

  const toggleVideo = () => {
    const stopVideo = document.querySelector('#stopVideo');
    const myStream = window.myStream;
    const enabled = myStream.getVideoTracks()[0].enabled;
    let newHTML;
    if (enabled) {
      myStream.getVideoTracks()[0].enabled = false;
      newHTML = `<i class="fas fa-video-slash"></i>`;
      stopVideo.classList.toggle('background__red');
      stopVideo.innerHTML = newHTML;
    } else {
      myStream.getVideoTracks()[0].enabled = true;
      newHTML = `<i class="fas fa-video"></i>`;
      stopVideo.classList.toggle('background__red');
      stopVideo.innerHTML = newHTML;
    }
  };
  const toggleMute = () => {
    const muteButton = document.querySelector('#muteButton');
    const myStream = window.myStream;
    const enabled = myStream.getAudioTracks()[0].enabled;
    let newHTML;
    if (enabled) {
      myStream.getAudioTracks()[0].enabled = false;
      newHTML = `<i class="fas fa-microphone-slash"></i>`;
      muteButton.classList.toggle('background__red');
      muteButton.innerHTML = newHTML;
    } else {
      myStream.getAudioTracks()[0].enabled = true;
      newHTML = `<i class="fas fa-microphone"></i>`;
      muteButton.classList.toggle('background__red');
      muteButton.innerHTML = newHTML;
    }
  };

  const togglePopup = event => {
    let id = event.target.id;
    switch (id) {
      case 'how-to':
        setIsOpen(true);
        break;
      case 'map':
        setMapOpen(true);
        break;
      case 'close-icon':
        setIsOpen(false);
        setMapOpen(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // if game scene is sleeping, wake it
    // if (window.game.scene.isSleeping('MainScene'))
    //   window.game.scene.wake('MainScene');

    // will show video panel and game panel
    userData = JSON.parse(window.localStorage.getItem('userData'));

    showPanels();

    //starts peerjs code for video
    (async () => {
      // if (!window.peer) {
      //   console.log('need to make peer')
      //   window.peer = await makePeer(socket.id);
      // }
      await runWebRTC(socket, userData.name);
    })();
    // when the user refreshes the page, make them join the room again if key exists
    if (userData && userData.roomKey) {
      socket.emit('doesKeyExist', userData.roomKey);
      socket.on('roomExistCheck', exists => {
        if (exists) {
          socket.emit('joinRoom', userData); //
        } else {
          alert(
            `room ${userData.roomKey} is invalid. Please join with another key.`
          );
        }
      });
    } else {
      alert(`Please create or join a room first.`);
    }
    // cleanup function
    return () => {
      // when going to another page, hide the webcam panel and phaser game
      hidePanels();

      window.game.scene.sleep('MainScene');

      // should disconnect peerJS so others can't see you anymore
      // if (window.peer) window.peer.disconnect();
      if (window.peer) {
        window.peer.destroy();
        window.peer = undefined;
      }

      let allWebCams = document.querySelectorAll(`video`);
      if (allWebCams) allWebCams.forEach(video => video.remove());

      // leave the room when going office page unmounts
      socket.emit('leaveRoom', userData.roomKey);
    };
  }, []);

  return (
    <div>
      <div id="header">
        <div className="webcam-controller" style={{ display: 'none' }}>
          <p>{userData.name}</p>
          <div
            id="stopVideo"
            className="controller_buttons"
            onClick={toggleVideo}
          >
            <i className="fa fa-video-camera"></i>
          </div>
          <div
            id="muteButton"
            className="controller_buttons"
            onClick={toggleMute}
          >
            <i className="fa fa-microphone"></i>
          </div>
        </div>
        <div id="nav">
          <ul>
            <li className="button-two">
              <Link to="/"> Switch Room </Link>
            </li>

            <li className="button-three">
              <a id="how-to" onClick={togglePopup}>
                {' '}
                How To Play{' '}
              </a>
            </li>

            <li className="button-four">
              <a id="map" onClick={togglePopup}>
                {' '}
                Map{' '}
              </a>
              {/* <a href="assets/potentialcropped.png">Map</a> */}
            </li>
          </ul>
        </div>
      </div>

      {isOpen && (
        <Popup
          content={
            <>
              <b>Instructions</b>
              <div>
                <div id="arrows-container">
                  <img className="arrows" src="assets/keys.png" />
                </div>
                <div id="arrow-instructions">
                  <p>Walk around your office with your arrow keys!</p>
                </div>
                <div id="coworker-container">
                  <img className="coworkers" src="assets/coworkers.png" />
                </div>
              </div>
            </>
          }
          handleClose={togglePopup}
        />
      )}
      {mapOpen && (
        <Popup
          content={
            <>
              <img
                src="assets/potentialcropped.png"
                style={{ width: '100%' }}
              ></img>
            </>
          }
          handleClose={togglePopup}
        />
      )}
        <NameDisplay/>
    </div>
  );
};

export default Office;
