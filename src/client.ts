import io from 'socket.io-client'
import { SetupMessage } from './messages/setupMessage'
import { Stage } from './stage/stage'

export class Client {
  socket = io()
  setupMessage?: SetupMessage
  stage?: Stage

  constructor () {
    this.socket.on('connected', () => {
      console.log('connected')
    })
    this.socket.on('setup', (setupMessage: SetupMessage) => {
      if (this.setupMessage == null) {
        this.setupMessage = setupMessage
        this.stage = new Stage(this, setupMessage)
      } else {
        console.warn('Restart Needed')
      }
    })
  }

  updateServer (): void {
    //
  }
}
