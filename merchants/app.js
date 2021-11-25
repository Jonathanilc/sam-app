// dependencies
const AWS = require("aws-sdk");
const csvtojson = require("csvtojson");
const { errorMsg, getCost } = require("./func");

// event handler
exports.lambdaHandler = async (event, context) => {
  try {
    // error handle when no request body being passed
    if (event.body === null || event.body === undefined) {
      return errorMsg("Request body is missing.");
    }

    const { Industry, TransactionCount, TransactionVolume } = JSON.parse(
      event.body
    );

    // error handle when not all params being passed.
    if (!Industry || !TransactionCount || !TransactionVolume) {
      return errorMsg("All request params need to be provided.");
    }

    // S3 connection
    const S3 = new AWS.S3();

    const params = {
      Bucket: "example-test-for-sam",
      Key: "data.csv",
    };

    // defination
    const stream = await S3.getObject(params).createReadStream();
    const json = await csvtojson().fromStream(stream);
    const filterdIndustryData = json.filter((i) => i.Industry === Industry);
    const TERMINAL = "TERMINAL";
    const TRANSACTION_COUNT = "TRANSACTION_COUNT";
    const TRANSACTION_VOLUME = "TRANSACTION_VOLUME";
    let terminalCost, transactionCountCost, transactionVolumeCost, totalCost;

    // get terminal cost, if no terminal data found, return error to client side
    filterdIndustryData.forEach(i => {
      if (i.Type === TERMINAL) {
        terminalCost = i.Price;
      }
    });

    if (!terminalCost) {
      return errorMsg("Terminal for specified industry not found in database");
    }

    // get transaction count cost, if the given value is outside the bounds, return error
    transactionCountCost = getCost(filterdIndustryData, TransactionCount, TRANSACTION_COUNT);

    if(!transactionCountCost) {
      return errorMsg("Transaction count cost for specified industry not found in database");
    }

    // get transaction volumn cost, if the given value is outside the bounds, return error
    transactionVolumeCost = getCost(filterdIndustryData, TransactionVolume, TRANSACTION_VOLUME);

    if(!transactionVolumeCost) {
      return errorMsg("Transaction volumn cost for specified industry not found in database");
    }

    // calculate total cost
    totalCost = +terminalCost + +transactionCountCost + +transactionVolumeCost + '';
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        terminalCost,
        transactionCountCost,
        transactionVolumeCost,
        totalCost
      }),
    };
  } catch (err) {
    return errorMsg(err);
  }
};
