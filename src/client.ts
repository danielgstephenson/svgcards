import io from 'socket.io-client'
import { SetupMessage } from './messages/setupMessage'
import { Stage } from './stage/stage'

export class Client {
  socket = io()
  stage?: Stage

  constructor () {
    this.socket.on('connected', () => {
      console.log('connected')
    })
    this.socket.on('setup', (setupMessage: SetupMessage) => {
      this.stage = new Stage(this, setupMessage)
    })
  }
}
