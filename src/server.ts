import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs-extra'
import path from 'path'
import * as SocketIo from 'socket.io'
import { Config } from './config'
import { SetupMessage } from './messages/setupMessage'
import { CardInfo, readCards } from './cardInfo'
import { ClientMessage } from './messages/clientMessage'
import { Update } from './messages/update'
import { ServerMessage } from './messages/serverMessage'
import { User } from './user'

export class Server {
  seed = Math.random().toString()
  config = new Config()
  dirname = path.dirname(__filename)
  app = express()
  httpServer: https.Server | http.Server
  io: SocketIoServer
  cards?: CardInfo[]
  users: User[] = []
  updates: Update[] = []
  step = 0

  constructor () {
    this.setupApp()
    this.httpServer = this.getHttpServer()
    this.io = new SocketIo.Server(this.httpServer)
    void this.start()
  }

  async start (): Promise<void> {
    this.cards = await readCards()
    this.httpServer.listen(this.config.port, () => {
      console.log(`listening on port: ${this.config.port}`)
    })
    this.io.on('connection', async socket => {
      console.log('connected:', socket.id)
      const user = new User(socket)
      this.users.push(user)
      socket.emit('setup', new SetupMessage(this, socket.id))
      socket.on('clientUpdate', (message: ClientMessage) => {
        if (message.seed === this.seed) {
          user.step = message.step
          message.updates.forEach(update => {
            update.step = this.step
            this.updates[update.index] = update
          })
        }
      })
    })
    setInterval(() => this.updateClients(), 100)
  }

  updateClients (): void {
    this.step += 1
    this.users.forEach(user => {
      const message = new ServerMessage(this, user)
      user.socket.emit('serverUpdate', message)
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

type SocketIoServer = SocketIo.Server
