import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import styled from "styled-components";
import { useRef, useState } from 'react';
import { addTorrent } from 'api/torrents';

const Container = styled.div`
  position: absolute;
  right: 20px;
  bottom: 20px;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);

  display: grid;
  place-items: center;
`;

const ModalContainer = styled.div`
  z-index: 99999;
  margin: 20px;
  padding: 20px;
  border-radius: 10px;

  min-width: 200px;
  min-height: 400px;

  width: 80vw;
  max-width: 600px;

  height: 70vh;

  /* fullscreen for mobile */
  @media (max-width: 720px) {
    margin: 0;
    max-width: 100vw;
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
  }

  background-color: #b8b8b8;
`;

const Modal = ({ hide }) => {
  const buttonRef = useRef<HTMLInputElement>();

  const clickHandler = () => {
    const url = buttonRef.current.value;
    addTorrent(url, "movie").catch(reason => console.log(reason));
  };
  return <ModalOverlay onClick={hide}>
    <ModalContainer onClick={e => e.stopPropagation()}>
      Add Torrent
      <input ref={buttonRef} />
      <button onClick={clickHandler}>Add</button>
    </ModalContainer>
  </ModalOverlay>
};

export const FAB = () => {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      {/* TODO: Modal */}
      {isOpen && <Modal hide={() => setOpen(false)} />}
      <Container>
        <Fab onClick={() => setOpen(true)}>
          <AddIcon />
        </Fab>
      </Container>
    </>
  );
}