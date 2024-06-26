import { useCallback, useEffect, useRef, useState } from 'react';
import styled from "styled-components";
import { Dropdown, DropdownProps, Menu } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css';
import { GridTorrentData, Torrent, torrentState } from 'types/torrent';
import { CategoryModal } from './category_modal';
import { ResumePauseOption } from './resume_pause';

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

type myType = ElementCSSInlineStyle & Element;

function constrainPosition(element: myType, container: myType) : number {
  if (!element) return;
  if (!container) return;
  // Get the dimensions of the container
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  // Get the dimensions of the element
  const elementRect = element.getBoundingClientRect();
  const elementWidth = elementRect.width;
  const elementHeight = elementRect.height;

  // Get current top and left positions
  let top = parseFloat(window.getComputedStyle(element).top);
  let left = parseFloat(window.getComputedStyle(element).left);

  var changed = false;
  // Constrain the top position
  if (top < 0) {
    top = 0;
    changed = true;
  }
  if (top + elementHeight > containerHeight) {
    top = containerHeight - elementHeight;
    changed = true;
  }

  // Constrain the left position
  if (left < 0) {
    left = 0;
    changed = true;
  }
  if (left + elementWidth > containerWidth) {
    left = containerWidth - elementWidth;
    changed = true;
  }

  if (!changed) return containerWidth - (left + elementWidth);
  // Apply the constrained positions
  element.style.position = "absolute";
  element.style.top = `${top}px`;
  element.style.left = `${left}px`;
  return containerWidth - (left + elementWidth)
}

export const ContextMenu = ({ top, left, torrent, hide, setRowData }: Props) => {
  const containerRef = useRef<HTMLDivElement>();
  const menuRef = useRef<HTMLDivElement>();
  const [modalOpen, setModalOpen] = useState(false);
  const clickHandler = useCallback(
    (e: MouseEvent) => !modalOpen && !containerRef.current.contains(e.target as any) && hide(),
    [hide, modalOpen]);
  useEffect(() => {
    document.addEventListener("mousedown", clickHandler);
    document.addEventListener("touchstart", clickHandler);
    return () => {
      document.removeEventListener("mousedown", clickHandler);
      document.removeEventListener("touchstart", clickHandler);
    };
  }, [hide, modalOpen, clickHandler]);

  const [dir, setDir] = useState<any>("right");
  useEffect(() => {
    if (constrainPosition(containerRef.current, document.body) < Math.max(100, menuRef.current?.clientWidth)) setDir("left");
  }, [left])

  const torrentAction = getTorrentAction(torrent);
  return <Container ref={containerRef} top={top} left={left}>
    <CategoryModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
    <Menu secondary vertical>
      <ResumePauseOption hide={hide} setRowData={setRowData} torrent={torrent} torrentAction={torrentAction} />
      <HoverDropdown item text='Categories' openOnFocus>
        <Dropdown.Menu ref={menuRef} direction={dir}>
          <Dropdown.Item onClick={() => { setModalOpen(true) }}>Anime</Dropdown.Item>
          <Dropdown.Item>Series</Dropdown.Item>
          <Dropdown.Item>Movies</Dropdown.Item>
        </Dropdown.Menu>
      </HoverDropdown>
    </Menu>
  </Container>
};