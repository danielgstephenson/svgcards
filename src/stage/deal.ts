import { Stage } from './stage'

export class Deal {
  portfolio: number[]
  hand: number[]
  reserve: number[]
  center: number[]
  market: number
  exile: number

  constructor (stage: Stage) {
    const setupMessage = stage.setupMessage
    const playerCount = stage.setupMessage.playerCount
    const cards = setupMessage.cards
    console.log('cards', cards)
    const ids = [...cards.keys()]
    const shuffleable = ids.filter(i => i !== 4 && i !== 0)
    const shuffled = stage.shuffle(shuffleable)
    const dealCount = 14 + playerCount
    const sliced = shuffled.slice(0, dealCount)
    console.log('sliced', sliced)
    const sorted = [...sliced].sort((a, b) => a - b)
    const market = sorted.shift()
    if (market == null) throw new Error('market == null')
    this.market = market
    const green = sorted.filter(i => cards[i].color === 'Green').sort((a, b) => a - b)
    const exile = green.shift()
    if (exile == null) throw new Error('exile == null')
    this.exile = exile
    const red = sorted.filter(i => cards[i].color === 'Red').sort((a, b) => a - b)
    const yellow = sorted.filter(i => cards[i].color === 'Yellow').sort((a, b) => a - b)
    const portfolioCounts = {
      2: { green: 2, red: 4, yellow: 3 },
      3: { green: 2, red: 4, yellow: 3 },
      4: { green: 2, red: 4, yellow: 3 },
      5: { green: 2, red: 4, yellow: 3 }
    }
    const portfolioCount = portfolioCounts[playerCount]
    const portfolioGreen = green.slice(0, portfolioCount.green)
    const portfolioRed = red.slice(0, portfolioCount.red)
    const portfolioYellow = yellow.slice(0, portfolioCount.yellow)
    this.portfolio = [4, ...portfolioGreen, ...portfolioRed, ...portfolioYellow]
    this.logRanks('this.portfolio', this.portfolio)
    const PORTFOLIO_SIZE = 10
    if (this.portfolio.length < PORTFOLIO_SIZE) {
      const remaining = sorted.filter(id => !this.portfolio.includes(id) && this.exile !== id)
      const missing = PORTFOLIO_SIZE - this.portfolio.length
      const more = remaining.slice(0, missing)
      this.portfolio.push(...more)
    }
    this.portfolio.sort((a, b) => a - b)
    const HAND_SIZE = 5
    this.hand = this.portfolio.slice(0, HAND_SIZE)
    this.logRanks('this.hand', this.hand)
    this.reserve = this.portfolio.slice(HAND_SIZE)
    this.logRanks('this.reserve', this.reserve)
    this.center = sorted.filter(id => !this.portfolio.includes(id) && this.exile !== id)
    const remaining = [...cards.keys()].filter(id => !this.portfolio.includes(id) && !this.center.includes(id) && this.exile !== id && this.market !== id && id !== 0)
    this.logRanks('remaining', remaining)
  }

  logRanks (label: string, ids: number[]): void {
    const ranks = ids.map(id => id + 1)
    console.log(label, ranks)
  }
}
