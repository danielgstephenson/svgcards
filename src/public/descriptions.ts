import { SetupSummary } from '../summaries/setupSummary'

export class Descriptions {
  array: Description[]
  setupSummary: SetupSummary
  playerCount: number

  constructor (setupSummary: SetupSummary) {
    this.setupSummary = setupSummary
    this.playerCount = setupSummary.playerCount
    this.array = []
  }
}

interface Description {
  file: 'string'
  x: number
  y: number
  type: string
  clones: number
  cardId: number
}
