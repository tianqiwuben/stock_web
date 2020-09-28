import axios from 'axios';

const API_PREFIX = 'http://192.168.86.101:3001';

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

export const apiConstants = () => callAPI('/constants', 'get');

export const apiBars = query => callAPI('/bars', 'get', query);

export const apiLiveBars = query => callAPI('/live_bars', 'get', query);

export const apiGetTrend = query => callAPI('/bar_trend', 'get', query);

export const apiUpdateSymProp = (query) => callAPI(`/sym_prop`, 'post', query);

export const apiRecalcSymProp = (sym) => callAPI(`/sym_prop/${sym}`, 'get');

export const apiGetDistribution = query => callAPI('/aggs/distribution', 'get', query);

export const apiPostDistribution = query => callAPI('/aggs/distribution', 'post', query);

export const apiGetConfig = sym => callAPI(`/configs/${sym}`, 'get');

export const apiPostConfig = (sym, payload) => callAPI(`/configs/${sym}`, 'post', payload);

export const apiTestConfig = (payload) => callAPI('/test/new', 'post', payload);

export const apiOptimizationProcessAction = payload => callAPI(`/optimization_process`, 'post', payload);

export const apiOptimizationProcessCancelAll = () => callAPI(`/optimization_process/cancel_all`, 'post');

export const apiGetTriggers = (sym, query) => callAPI(`/triggers/${sym}`, 'get', query);

export const apiOptimizationApply = (id, query) => callAPI(`/optimization_result_apply/${id}`, 'post', query);

export const apiGetProcesses = (query)  => callAPI(`/optimization_process`, 'get', query);

export const apiRemarkCreate = (payload)  => callAPI(`/remark`, 'post', payload);

export const apiDeleteRemark = (id)  => callAPI(`/remark/${id}`, 'delete');

export const apiGetRemarks = (query)  => callAPI(`/remark`, 'get', query);

export const apiGetTransactions = (query) => callAPI('/transactions', 'get', query);

export const apiBulkOptimizations = payload => callAPI('/bulk/optimizations', 'post', payload);

export const apiBulkAssignOptimizations = payload => callAPI('/bulk/assign_optimization_result', 'post', payload);

export const apiBulkInitStrategy = payload => callAPI('/bulk/init_strategy', 'post', payload);

export const apiGetMessages = query => callAPI('/messages', 'get', query);

export const apiMarkRead = payload => callAPI('/messages/mark_read', 'post', payload);

export const apiDeleteMessage = id => callAPI(`/messages/${id}`, 'DELETE');

export const apiCalcTrend = payload => callAPI('/bar_trend', 'post', payload);

export const apiGetList = query => callAPI('/watch_list', 'get', query);

export const apiUpdateList = payload => callAPI('/watch_list', 'post', payload);

export const apiStreamingListAction = (payload) => callAPI('/watch_list/streaming_watch_list', 'post', payload);

export const apiGetSuggestions = query => callAPI('/suggestions', 'get', query);

export const apiPostManual = query => callAPI('/follower/manual', 'post', query);

export const apiDeleteManual = sym => callAPI(`/follower/delete_position/${sym}`, 'delete');

export const apiGetManual = () => callAPI('/follower/current_positions', 'get');

export const apiResolverStatus = query => callAPI('/status/resolver', 'get', query);

export const apiResolverCommand = payload => callAPI('/status/command', 'post', payload);

