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

export const apiAggProgress = query => callAPI('/aggs/progress', 'get', query);

export const apiGetDistribution = query => callAPI('/aggs/distribution', 'get', query);

export const apiPostDistribution = query => callAPI('/aggs/distribution', 'post', query);

export const apiGetConfig = sym => callAPI(`/configs/${sym}`, 'get');

export const apiPostConfig = (sym, payload) => callAPI(`/configs/${sym}`, 'post', payload);

export const apiTestConfig = (sym, payload) => callAPI(`/test/${sym}`, 'post', payload);

export const apiOptimizationProcessStart = payload => callAPI(`/optimization_process`, 'post', payload);

export const apiGetTriggers = (sym, query) => callAPI(`/triggers/${sym}`, 'get', query);

export const apiGetOptimizationResult = (sym, query) => callAPI(`/optimization_result/${sym}`, 'get', query);

export const apiOptimizationApply = (id, query) => callAPI(`/optimization_result_apply/${id}`, 'post', query);


