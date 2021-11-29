// dependencies
const AWS = require("aws-sdk");
const multipart = require("aws-lambda-multipart-parser");
const { errorMsg } = require("./func");
const BUCKET_NAME = process.env.BucketName;

// event handler
exports.lambdaHandler = async (event, context) => {
  try {
    // error handle when no request body being passed
    if (event.body === null || event.body === undefined) {
      return errorMsg("Request body is missing.");
    }

    // parsing file to binary string
    const result = await multipart.parse(event, true);

    const content = result.file.content;

    // S3 connection
    const S3 = new AWS.S3();
    // list S3 bucket and check if bucket already been created.
    const bucketList = await S3.listBuckets().promise();
    const buckets = bucketList.Buckets;
    const isContainerExist =
      buckets.filter((i) => i.Name === BUCKET_NAME).length > 0;

    // create bucket and turn versioning on if bucket not exist
    if (!isContainerExist) {
      await S3.createBucket({ Bucket: BUCKET_NAME }).promise();
      await S3.putBucketVersioning({
        Bucket: BUCKET_NAME, 
        VersioningConfiguration: {
          MFADelete: "Disabled", 
          Status: "Enabled"
        }
      }).promise();
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: "data.csv",
      Body: content,
      ContentType: "text/csv",
    };

    const res = await S3.upload(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*"
      },
      body: JSON.stringify({
        res,
      }),
    };
  } catch (err) {
    return errorMsg(err);
  }
};
