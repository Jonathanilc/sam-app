function calcLinear(x0, y0, x1, y1, x) {
  // linear interpolation algorithm and keep 2 decimals
  return ((y0 * (x1 - x) + y1 * (x - x0)) / (x1 - x0)).toFixed(2);
}

function errorMsg(msg) {
  return {
    statusCode: 400,
    headers: {
      "Access-Control-Allow-Origin" : "*"
    },
    body: JSON.stringify({
      error: msg,
    }),
  };
}

function getCost(filterdIndustryData, paramValue, type) {
  let costBoundsStart, costBoundsEnd;

  // 1. filter data according to the given type.
  // 2. make sure data has been sorted based on value ascending.
  // 3. take advantages of array.prototype.reduce to get the bounds.
  filterdIndustryData
    .filter((i) => i.Type === type)
    .sort((prev, cur) => +prev.Value - +cur.Value)
    .reduce(function (prev, cur) {
      if (+paramValue >= +prev.Value && +paramValue <= +cur.Value) {
        costBoundsStart = prev;
        costBoundsEnd = cur;
      }
      return cur;
    });

    if (!costBoundsStart || !costBoundsEnd) {
        return false;
    }

    // call private function to calculate the linear interpolation between two given coordinates.
    return calcLinear(
      +costBoundsStart.Value,
      +costBoundsStart.Price,
      +costBoundsEnd.Value,
      +costBoundsEnd.Price,
      +paramValue
    );
}

module.exports = { errorMsg, getCost };
