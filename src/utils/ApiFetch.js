import axios from 'axios';

const API_PREFIX = 'http://localhost:3001';

function getAPIHeaders() {
  return ({
    'Content-Type': 'application/json',
    Accept: 'application/json'
  });
}


function callAPI(path, method, payload = null) {
  const headers = getAPIHeaders();
  const data = method === 'get' ? null : payload;
  return axios({
    url: path,
    method,
    data,
    headers,
    baseURL: API_PREFIX,
    params: method === 'get' ? payload : null,
    transformRequest: (data) => {
      if (typeof data === 'object') {
        return JSON.stringify(data);
      } else {
        return data;
      }
    }
  }).catch(error => {
    return error.response;
  });
}

export const apiBars = query => callAPI('/bars', 'get', query);

export const apiGetAgg = query => callAPI('/aggs', 'get', query);

export const apiPostAgg = query => callAPI('/aggs', 'post', query);
