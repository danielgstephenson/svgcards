import { CardInfo } from '../cards'
import { Server } from '../server'

export class SetupSummary {
  seed: string
  playerCount: 2 | 3 | 4
  state = []
  layers = []
  cards: CardInfo[]

  constructor (server: Server) {
    if (server.cards == null) {
      throw new Error('SetupSummary: server.cards = null')
    }
    this.cards = server.cards
    this.seed = server.seed
    this.playerCount = server.config.playerCount
  }
}
