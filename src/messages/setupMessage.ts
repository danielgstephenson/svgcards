import { CardInfo } from '../cardInfo'
import { Server } from '../server'
import { PlayerCount } from '../types'
import { Update } from './update'

export class SetupMessage {
  seed: string
  socketId: string
  playerCount: PlayerCount
  cards: CardInfo[]
  updates: Update[]

  constructor (server: Server, socketId: string) {
    if (server.cards == null) {
      throw new Error('SetupMessage: server.cards = null')
    }
    this.cards = server.cards
    this.seed = server.seed
    this.socketId = socketId
    this.playerCount = server.config.playerCount
    this.updates = server.updates
  }
}
