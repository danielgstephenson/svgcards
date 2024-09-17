import io from 'socket.io-client'
import { SetupSummary } from '../summaries/setupSummary'
import { Tabletop } from './tabletop'

export class Client {
  socket = io()
  tabletop?: Tabletop

  constructor () {
    this.socket.on('connected', () => {
      console.log('connected')
    })
    this.socket.on('setup', (setupSummary: SetupSummary) => {
      this.tabletop = new Tabletop(this, setupSummary)
    })
  }
}
