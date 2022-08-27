import env, { request } from './env';

const version = async () : Promise<string> => {
  var resp = await request(`${env.appURL}/version`)
  if (resp.status === 403) {
    throw new Error("access denied");
  }
  return await resp.text()
}

export default version