
const Koa = require('koa')
const Token = require('./token')(process.env.SECRET || '<your_secret_here>')

const port = 3000
const REQUIRED_SCOPES = ['user:read']

async function main () {
  const app = new Koa()

  // Generate a token with scopes for testing purpose
  const encoded = await Token.sign(['user:read', 'user:write', 'user:delete'])
  console.log(`got encoded token: ${encoded}`)

  app.use(async (ctx, next) => {
    try {
      // Call the validation middleware
      await next()

      ctx.status = 200
      ctx.body = {
        message: 'scope is valid'
      }
    } catch (err) {
      ctx.status = 400
      ctx.body = {
        error: err.message
      }
    }
  })

  app.use(async (ctx, next) => {
    const { token } = ctx.query
    const decoded = await Token.verify(token)
    const isValid = await Token.validateScopes(REQUIRED_SCOPES, decoded.scopes)
    if (!isValid) {
      throw new Error('scope provided is invalid')
    }
    console.log(`decoded token: ${JSON.stringify(decoded)}`)
  })

  app.listen(port)
}

main()
.then(console.log)
.catch(console.error)
