import * as SocketIo from 'socket.io'

export class User {
  socket: SocketIo.Socket
  step = 0
  seed = ''

  constructor (socket: SocketIo.Socket) {
    this.socket = socket
  }
}
