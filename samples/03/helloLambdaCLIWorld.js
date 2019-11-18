exports.handler =  async (event) => {
  const payload = {
    date: new Date(),
    message: 'Hello Lambda CLI World'
  };
  return JSON.stringify(payload);
};
