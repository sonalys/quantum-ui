import env, { request } from './env';

const login = async (username: string, password: string): Promise<void> => {
  var resp = await request(`${env.baseURL}/auth/login`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/x-www-form-urlencoded"
    }),
    body: `username=${username}&password=${password}`
  });
  let body: string = await resp.text();
  if (resp.status >= 400 || body.includes("Fails")) throw new Error("failed to authenticate");
}

export default login