import React, { useEffect, useRef, useState } from 'react';
import styled from "styled-components";
import { Button, Dropdown, DropdownProps, Input, Menu, Modal } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css';
import { GridTorrentData, Torrent, torrentState } from 'types/torrent';
import { resumePause } from 'api/torrents';

interface ContainerProps {
  top, left: number
}

const Container = styled.div<ContainerProps>`
  position: absolute;
  top: ${({ top }: any) => top ?? 0}px;
  left: ${({ left }: any) => left ?? 0}px;

  .ui.vertical.menu,.ui.vertical.menu .dropdown.item .menu {
    background-color: #494949;
  }

  .item, .header, .ui.menu .ui.dropdown .menu > .item {
    color: white !important;
    padding: 15px 15px 15px 30px !important;
    margin: 0 !important;
  }
`;

interface Props {
  top, left: number
  torrent: GridTorrentData
  hide: () => void
  setRowData: (t: Partial<Torrent>) => void
};

const getTorrentAction = (t: GridTorrentData): { newState: torrentState, action: "resume" | "pause" } => {
  switch (t.state) {
    case "checkingDL":
    case "forcedDL":
    case "stalledDL":
    case "metaDL":
    case "moving":
    case "downloading":
      return { newState: "pausedDL", action: "pause" }
    default:
      return { newState: "downloading", action: "resume" }
  }
};

const HoverDropdown = ({ children, ...props }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  return <Dropdown
    open={open}
    onClose={() => setOpen(false)}
    onMouseOver={() => setOpen(true)}
    onMouseLeave={() => setOpen(false)}
    onClick={() => setOpen(true)}
    {...props}>
    {children}
  </Dropdown>
};

export const ContextMenu = ({ top, left, torrent, hide, setRowData }: Props) => {
  const containerRef = useRef<HTMLDivElement>();
  const [modalOpen, setModalOpen] = useState(false);
  const clickHandler = (e: MouseEvent) => !modalOpen && !containerRef.current.contains(e.target as any) && hide();
  useEffect(() => {
    document.addEventListener("click", clickHandler);
    return () => {
      document.removeEventListener("click", clickHandler);
    };
  }, [hide, clickHandler]);
  const torrentAction = getTorrentAction(torrent);
  return <Container ref={containerRef} top={top} left={left}>
    <Modal open={modalOpen} dimmer basic size='mini'>
      <Modal.Header>New Category</Modal.Header>
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Input label="Name" fluid labelPosition='left corner' />
          <Input label="Path" fluid labelPosition='left corner' />
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={() => setModalOpen(false)}>
          Cancel
        </Button>
        <Button
          labelPosition='right'
          icon='checkmark'
          onClick={() => setModalOpen(false)}
          color="blue"
        >Create</Button>
      </Modal.Actions>
    </Modal>
    <Menu secondary vertical>
      <Menu.Item
        name={torrentAction.action}
        onClick={() => {
          resumePause(torrent.hash, torrentAction.action).then(() => {
            setRowData({ state: torrentAction.newState, infohash_v1: torrent.hash });
          });
          hide();
        }}
      />
      <HoverDropdown item text='Categories' openOnFocus>
        <Dropdown.Menu floated>
          <Dropdown.Item onClick={() => { setModalOpen(true) }}>Anime</Dropdown.Item>
          <Dropdown.Item>Series</Dropdown.Item>
          <Dropdown.Item>Movies</Dropdown.Item>
        </Dropdown.Menu>
      </HoverDropdown>
    </Menu>
  </Container>
};