// FiveM NUI Bridge
window.nui = {
  send: (action, data) => console.log('NUI Send:', action, data),
  receive: (callback) => console.log('NUI Receive registered'),
  close: () => console.log('NUI Close'),
  notify: (message, type) => console.log('NUI Notify:', message, type)
};
console.log('FiveM NUI Bridge initialized');