exports.handler =  async (event, context, callback) => {
  event.Records.forEach(record => console.log(Buffer.from(record.kinesis.data, 'base64').toString('utf8')));
};
