
export const StrategyDB = {};

export const SymList = [];

const COLORS = ['black', 'teal', 'purple', 'orange', 'maroon', 'pink', 'olive', 'red'];

const colorMap = {idx: 0};

function copyHash(src, dst) {
  for (let k in src) {
    dst[k] = src[k];
  }
}

export const setDB = (data) => {
  for (let key in data) {
    switch(key) {
      case 'strategies': {
        copyHash(data.strategies, StrategyDB);
        break; 
      }
      case 'sym_list': {
        SymList.splice(0, SymList.length);
        SymList.push(...data.sym_list)
        break;
      }
      default:
    }
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
