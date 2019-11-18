exports.handler =  async (event) => {
  const payload = {
    date: new Date(),
    message: 'Hello Lambda CLI World (v2)'
  };
  return JSON.stringify(payload);
};
