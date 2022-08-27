const apiURL = "http://localhost:9090/api/v2"

const getHeader = (props): RequestInit => ({
  mode: "cors",
  credentials: 'include',
  ...props
});

export const request = async (input : RequestInfo, props ?: any) : Promise<Response> => {
  return fetch(input, getHeader(props))
};

const env = {
  baseURL: apiURL,
  appURL: `${apiURL}/app`,
  syncURL: `${apiURL}/sync`,
}

export default env;