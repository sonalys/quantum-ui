import { resumePause } from "api/torrents";
import { Menu } from "semantic-ui-react";
import { GridTorrentData, Torrent, torrentState } from "types/torrent";

interface Props {
  torrent : GridTorrentData
  torrentAction: { action: "resume" | "pause", newState : torrentState }
  setRowData: (t: Partial<Torrent>) => void
  hide: () => void
};

export const ResumePauseOption = ({torrentAction, torrent, setRowData, hide} : Props) => {
  return <Menu.Item
  name={torrentAction.action}
  onClick={() => {
    resumePause(torrent.hash, torrentAction.action).then(() => {
      setRowData({ state: torrentAction.newState, infohash_v1: torrent.hash });
    });
    hide();
  }}
/>
};