import io from 'socket.io-client'

export class Client {
  socket = io()

  constructor () {
    this.socket.on('connected', () => {
      console.log('connected')
    })
  }
}
