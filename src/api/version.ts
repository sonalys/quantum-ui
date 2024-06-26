import env, { request } from './env';

const version = async () : Promise<string> => {
  var resp = await request(`${env.appURL}/version`)
  if (resp.status >= 400) {
    throw new Error("access denied");
  }
  return resp.text()
}

export default version