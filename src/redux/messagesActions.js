import {SAVE_MESSAGE, UPDATE_MESSAGE_PAGE, INSERT_MESSAGE} from './actionTypes';

export const saveMessages = (records) => {
  const data = {};
  records.forEach(r => {
    data[r.id] = r;
  })
  return({
    type: SAVE_MESSAGE,
    data,
  });
};

export const updateMessagesPage = (payload) => {
  const {
    total_entries,
    total_unread,
    page,
    records,
  } = payload;
  const data = {
    total_entries,
    total_unread,
    ids: [],
    page,
  }
  const barIds = [];
  records.forEach(r => {
    data.ids.push(r.id);
    if (page === 1 && barIds.length < 5) {
      barIds.push(r.id)
    }
  });
  if (page === 1) {
    data['barIds'] = barIds;
  }
  return({
    type: UPDATE_MESSAGE_PAGE,
    data,
  })
};

export const updateMessagesPageContent = (data) => ({
  type: UPDATE_MESSAGE_PAGE,
  data,
});

export const insertMessage = (message) => ({
  type: INSERT_MESSAGE,
  message,
});
