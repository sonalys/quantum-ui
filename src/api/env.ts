const api_url = "http://localhost:9090/api/v2"

const get_header = (props): RequestInit => ({
  mode: "cors",
  credentials: 'include',
  ...props
});

export const request = async (input : RequestInfo, props ?: any) : Promise<Response> => {
  return fetch(input, get_header(props))
};

export default {
  base_url: api_url,
  app_url: `${api_url}/app`,
  sync_url: `${api_url}/sync`,
};