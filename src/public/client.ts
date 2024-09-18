import io from 'socket.io-client'
import { SetupMessage } from '../messages/setupMessage'
import { Tabletop } from './tabletop'

export class Client {
  socket = io()
  tabletop?: Tabletop

  constructor () {
    this.socket.on('connected', () => {
      console.log('connected')
    })
    this.socket.on('setup', (setupMessage: SetupMessage) => {
      this.tabletop = new Tabletop(this, setupMessage)
    })
  }
}
