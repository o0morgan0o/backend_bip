const fs = require('fs')
const path = require('path')
const fastify = require('fastify')({
    logger: false,
    // https: {
    //     key: fs.readFileSync(path.join(__dirname, 'ssl', 'selfsigned.key')),
    //     cert: fs.readFileSync(path.join(__dirname, "ssl", 'selfsigned.crt'))
    // }
})
const authenticate = { realm: 'test' }

fastify.register(require('fastify-basic-auth'), { validate, authenticate })

const PORT = 3000
const HOST = "0.0.0.0"


function validate(username, password, req, reply, done) {
    console.log('username : ', username, 'password ', password)
    if (username === 'bipol' && password === 'log') {
        done()
    } else {
        done(new Error('authentication incorrect'))
    }
}

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
    try {
        let json = JSON.parse(body)
        done(null, json)
    } catch (err) {
        err.statusCode = 400
        done(err, undefined)
    }
})
fastify.get('/', async (req, reply) => {
    return { hello: 'world' }
})

fastify.after(() => {
    fastify.addHook('onRequest', fastify.basicAuth)
    fastify.post('/', (request, reply) => {
        console.log('receiving log ...', request.body.filename)

        let file_received = request.body.filename
        // TODO: validate

        fs.writeFile(path.join(__dirname, "received_logs", request.body.filename), request.body.filedata, (error) => {
            if (error) {
                console.log('error saving the file')
                // reply.send('error')
                throw error;
            }
        })
        // reply.code(200)
        reply.send({ filename: file_received, status: "Log received" })
        console.log('log received')

    })
})

fastify.listen(PORT, HOST, (err, address) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(`Server listening on port ${PORT} ,at address ${address}`)
})

