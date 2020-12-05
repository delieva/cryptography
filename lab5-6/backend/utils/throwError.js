class BackendException {
  constructor(message, code) {
    this.message = message;
    this.code = code;
  }

  toString() {
    return this.message
  }
}

const throwBackendError = (message, code) => {
  throw new BackendException(message, code)
}

module.exports = throwBackendError;