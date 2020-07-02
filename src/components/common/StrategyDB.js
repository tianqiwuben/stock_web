const allData = {};

const COLORS = ['black', 'teal', 'purple', 'orange', 'maroon', 'pink', 'olive', 'red'];

const colorMap = {idx: 0};

export const setDB = (data) => {
  for (let key in data) {
    allData[key] = data[key];
  }
}

export const getStrategyColor = (strategy) => {
  if (!colorMap[strategy]) {
    colorMap[strategy] = COLORS[colorMap.idx];
    colorMap.idx += 1;
    if (colorMap.idx === COLORS.length) {
      colorMap.idx = 0;
    }
  }
  return colorMap[strategy];
}

export default allData;