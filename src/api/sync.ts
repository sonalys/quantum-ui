import env, { request } from './env';
import type { Torrent } from 'types/torrent';
import type { ServerState } from 'types/transfer_info';

export class MainDataSync {
  rid!: number
  full_update?: boolean
  torrents?: {
    [Key: string] : Torrent
  }
  torrents_removed?: string[]
  categories?: string[]
  categories_removed?: string[]
  tags?: string[]
  tags_removed?: string[]
  server_state?: ServerState
}

const sync = async (rID : number): Promise<MainDataSync> => {
  let resp = await request(`${env.syncURL}/maindata?rid=${rID}`);
  if (resp.status >= 400) {
    throw await resp.json();
  }
  let body: MainDataSync = await resp.json();
  return body;
}

export default sync;