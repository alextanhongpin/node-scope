const jwt = require('jsonwebtoken')

const Token = (secret) => {
  async function sign (scopes, expiresIn = '1h') {
    return jwt.sign({
      scopes
    }, secret, { expiresIn })
  }

  async function verify (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        err ? reject(err) : resolve(decoded)
      })
    })
  }

  async function validateScopes (requiredScopes, providedScopes) {
    return requiredScopes.map(scope => providedScopes.includes(scope)).every(isTrue => isTrue)
  }

  return { sign, verify, validateScopes }
}

module.exports = Token
