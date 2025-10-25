import { Stage } from './stage'

export class Deal {
  hand: number[]
  reserve: number[]
  center: number[]
  market: number[]
  dungeon: number

  constructor (stage: Stage) {
    this.market = [5]
    this.dungeon = 18
    this.hand = [2, 3, 6, 8, 9]
    const playerCount = stage.setupMessage.playerCount
    if (playerCount === 2) {
      this.reserve = []
      this.center = [20, 21, 22, 23, 24]
    } else if (playerCount === 3) {
      this.reserve = [10, 11, 12, 13, 14]
      this.center = [19, 20, 21, 22, 23, 24]
    } else if (playerCount === 4) {
      this.reserve = [8, 15, 16, 17, 18]
      this.center = [9, 19, 20, 21, 22, 23, 24]
    } else {
      this.reserve = [8, 9, 12, 15, 16]
      this.center = [17, 18, 19, 20, 21, 22, 23, 24]
    }
  }

  printRanks (label: string, ids: number[]): void {
    const ranks = ids.map(id => id + 1)
    console.info(label, ranks)
  }
}
