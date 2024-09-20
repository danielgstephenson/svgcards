import { CardInfo } from '../cardInfo'
import { Server } from '../server'

export class SetupMessage {
  seed: string
  socketId: string
  playerCount: PlayerCount
  state = []
  layers = []
  cards: CardInfo[]

  constructor (server: Server, socketId: string) {
    if (server.cards == null) {
      throw new Error('SetupMessage: server.cards = null')
    }
    this.cards = server.cards
    this.seed = server.seed
    this.socketId = socketId
    this.playerCount = server.config.playerCount
  }
}

export type PlayerCount = 2 | 3 | 4
