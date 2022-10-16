import env, { request } from './env';

const tURL = `${env.baseURL}/torrents`

export const resumePause = async (hash: string, action: "resume" | "pause"): Promise<void> => {
  const resp = await request(`${tURL}/${action}?hashes=${hash}`);
  if (resp.status >= 400) {
    throw await resp.text();
  }
  return
}