const allData = {};

export const setDB = (data) => {
  for (let key in data) {
    allData[key] = data[key];
  }
}

export default allData;