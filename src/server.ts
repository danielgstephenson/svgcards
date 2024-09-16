import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs-extra'
import path from 'path'
import csvtojson from 'csvtojson'
import * as SocketIo from 'socket.io'
import { Config } from './config'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

export class Server {
  seed = Math.random().toString()
  config = new Config()
  dirname = path.dirname(__filename)
  app = express()
  httpServer: https.Server | http.Server
  io: SocketIoServer
  state = []
  layers = []

  constructor () {
    this.setupApp()
    this.httpServer = this.getHttpServer()
    this.httpServer.listen(this.config.port, () => {
      console.log(`listening on port: ${this.config.port}`)
    })
    this.io = new SocketIo.Server(this.httpServer)
    this.io.on('connection', async socket => {
      const cards = await csvtojson().fromFile('cards.csv')
      console.log('connected:', socket.id)
      socket.emit('setup', {
        seed: this.seed,
        state: this.state,
        layers: this.layers,
        plots: cards,
        playerCount: this.config.playerCount
      })
      socket.on('updateServer', msg => {
        if (msg.seed === this.seed) {
          // msg.updates.forEach(update => {
          //   state[update.id] = update
          //   events[update.id] = { socket, update }
          //   layers = msg.layers
          // })
        }
      })
    })
  }

  setupApp (): void {
    const staticPath = path.join(this.dirname, 'public')
    const staticMiddleware = express.static(staticPath)
    this.app.use(staticMiddleware)
    const clientHtmlPath = path.join(this.dirname, 'public', 'client.html')
    this.app.get('/', function (req, res) { res.sendFile(clientHtmlPath) })
  }

  getHttpServer (): https.Server | http.Server {
    if (this.config.secure) {
      const keyPath = path.join(this.dirname, '../sis-key.pem')
      const certPath = path.join(this.dirname, '../sis-cert.pem')
      const key = fs.readFileSync(keyPath)
      const cert = fs.readFileSync(certPath)
      const credentials = { key, cert }
      return new https.Server(credentials, this.app)
    } else {
      return new http.Server(this.app)
    }
  }
}

type SocketIoServer = SocketIo.Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
