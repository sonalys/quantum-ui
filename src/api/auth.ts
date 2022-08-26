import env, { request } from './env';
import get_version from './version';

const login = async (username: string, password: string): Promise<boolean> => {
  var resp = await request(`${env.base_url}/auth/login`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/x-www-form-urlencoded"
    }),
    body: `username=${username}&password=${password}`
  });
  let body: string = await resp.text();
  return !(resp.status >= 400 || body.includes("Fails"))
}

export default login