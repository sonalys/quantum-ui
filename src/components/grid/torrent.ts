import moment from "moment";
import { GridTorrentData, Torrent } from "types/torrent";
import { getSize } from "utils/bytes";

const maxETA = 8640000;

const getETA = (v : number) : string => {
  return v === maxETA ? "∞" : moment.duration(v, "seconds").humanize();
}

export const torrentFieldMapping = (torrent: Torrent) : GridTorrentData => ({
  name: torrent.name,
  state: torrent.state,
  size: getSize(torrent.size),
  progress: torrent.progress,
  num_seeds: torrent.num_seeds,
  num_leechs: torrent.num_leechs,
  dlspeed: getSize(torrent.dlspeed),
  upspeed: getSize(torrent.upspeed),
  eta: getETA(torrent.eta),
  category: torrent.category,
  added_on: moment.unix(torrent.added_on).calendar(),
  availability: torrent.availability,
  hash: torrent.infohash_v1,
});