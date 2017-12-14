
const Koa = require('koa')
const jwt = require('jsonwebtoken')

const secret = '$3cr3t'
const port = 3000

async function sign (scopes, expiresIn = '1h') {
  return jwt.sign({
    scopes
  }, secret, { expiresIn: '1h' })
}

async function verify (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      err ? reject(err) : resolve(decoded)
    })
  })
}

async function main () {
  const app = new Koa()

  const token = await sign(['cars:read', 'cars:write', 'cars:delete'])
  console.log('got token:', token)

  app.use(async (ctx, next) => {
    try {
      // Call the validation middleware
      await next()
      ctx.body = 'hello'
    } catch (err) {
      ctx.status = 400
      ctx.body = {
        error: err.message
      }
    }
  })

  // Validation middleware
  app.use(async (ctx, next) => {
    const allowedScopes = 'cars:read'
    const { token } = ctx.query
    const decoded = await verify(token)
    if (!decoded.scopes) {
      throw new Error('scope does not exist')
    }
    if (!decoded.scopes.includes(allowedScopes)) {
      throw new Error('scope is not valid')
    }
    console.log('decoded:', decoded)
  })

  app.listen(port)
}

main()
.then(console.log)
.catch(console.error)
