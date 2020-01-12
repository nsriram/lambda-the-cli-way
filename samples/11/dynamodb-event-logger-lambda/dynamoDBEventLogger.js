exports.handler =  async (event, context) => {
  event.Records.forEach(record => console.log(record.dynamodb.Keys));
};
