import { Server } from '../server'
import { Update } from './update'

export class ServerMessage {
  seed: string
  updates: Update[] = []

  constructor (server: Server) {
    this.seed = server.seed
    this.updates = server.updates
  }
}
