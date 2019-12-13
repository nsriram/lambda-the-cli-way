exports.handler =  async (event) => {
  const payload = {
    date: new Date(),
    message: 'Hello Lambda CLI World'
  };
  console.log(JSON.stringify(payload));
  return JSON.stringify(payload);
};
