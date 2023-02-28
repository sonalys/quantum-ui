import env, { request } from './env';

const tURL = `${env.baseURL}/torrents`

export const resumePause = async (hash: string, action: "resume" | "pause"): Promise<void> => {
  const resp = await request(`${tURL}/${action}?hashes=${hash}`);
  if (resp.status >= 400) {
    throw await resp.text();
  }
}

export const addTorrent = async (urls, category: string): Promise<void> => {
  const body = new FormData();
  body.append("urls", urls);
  body.append("category", category);
  const resp = await request(`${tURL}/add`, {
    method: "POST",
    body,
  })
  if (resp.status >= 400) {
    throw await resp.text();
  }
};