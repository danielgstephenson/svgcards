import { Server } from '../server'
import { User } from '../user'
import { Update } from './update'

export class ServerMessage {
  seed: string
  updates: Update[] = []
  step: number

  constructor (server: Server, user: User) {
    this.seed = server.seed
    this.step = server.step
    this.updates = server.updates.filter(update => {
      return update.step >= user.step
    })
    // console.log([user.step, ...this.updates.map(x => x.step)])
  }
}
