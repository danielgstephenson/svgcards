import io from 'socket.io-client'
import { SetupMessage } from './messages/setupMessage'
import { Stage } from './stage/stage'
import { ClientMessage } from './messages/clientMessage'
import { Update } from './messages/update'
import { ServerMessage } from './messages/serverMessage'
import { NameTag } from './parts/nametag'

export class Client {
  socket = io()
  setupMessage?: SetupMessage
  stage?: Stage
  seed?: string

  constructor () {
    this.socket.on('connected', () => {
      console.log('connected')
    })
    this.socket.on('setup', (setupMessage: SetupMessage) => {
      if (this.setupMessage === undefined) {
        this.setupMessage = setupMessage
        this.seed = setupMessage.seed
        this.stage = new Stage(this, setupMessage)
      } else {
        console.warn('Restart Needed')
      }
    })
    this.socket.on('serverUpdate', (message: ServerMessage) => {
      if (this.seed === message.seed) {
        message.updates.forEach(update => this.updatePart(update))
      } else {
        console.warn('Restart Needed')
      }
    })
    setInterval(() => this.updateServer(), 100)
  }

  updateServer (): void {
    if (this.stage?.buildComplete === true) {
      const message = new ClientMessage(this.stage)
      this.socket.emit('clientUpdate', message)
    }
  }

  updatePart (update: Update): void {
    if (update == null) return
    if (this.stage?.buildComplete !== true) return
    if (update.socketId === this.stage.socketId) return
    const part = this.stage.parts[update.index]
    const side = update.side === 'hidden' ? 'back' : update.side
    part.setSide(side)
    part.element.stop()
    part.element.animate({ transform: update.local }, this.stage.moveTime)
    if (part instanceof NameTag) part.updateText(update.text)
    part.bringToTop()
  }
}
