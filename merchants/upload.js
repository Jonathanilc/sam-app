// dependencies
const AWS = require("aws-sdk");
const multipart = require('aws-lambda-multipart-parser');
const { errorMsg } = require("./func");

// event handler
exports.lambdaHandler = async (event, context) => {
  try {
    // error handle when no request body being passed
    if (event.body === null || event.body === undefined) {
      return errorMsg("Request body is missing.");
    };

    // parsing file to binary string
    const result = await multipart.parse(event, true);

    const content = result.file.content;

    // S3 connection
    const S3 = new AWS.S3();

    const params = {
      Bucket: "example-test-for-sam",
      Key: "data.csv",
      Body: content,
      ContentType: "text/csv",
    };

    const res = await S3.upload(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        res
      }),
    };
  } catch (err) {
    return errorMsg(err);
  }
};
