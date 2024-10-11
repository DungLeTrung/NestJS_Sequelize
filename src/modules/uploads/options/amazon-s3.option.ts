import AWS from 'aws-sdk';
import { aws } from 'src/configs';

export const amazonS3Options = {
  S3: new AWS.S3({
    // Your config options
    accessKeyId: aws.accessKeyId,
    secretAccessKey: aws.secretAccessKey,
    region: aws.s3Region,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  }),
  bucket: aws.bucket,
};
