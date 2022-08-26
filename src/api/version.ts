import env, { request } from './env';

const version = async () : Promise<string> => {
  var resp = await request(`${env.app_url}/version`)
  if (resp.status == 403) {
    throw "forbidden"
  }
  return await resp.text()
}

export default version