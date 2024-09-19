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
    const ids = [...cards.keys()]
    const shuffleable = ids.filter(i => i !== 5 && i !== 1)
    const shuffled = stage.shuffle(shuffleable)
    const dealCount = 12 + playerCount * 2
    const sliced = shuffled.slice(0, dealCount)
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
      2: { green: 2, red: 3, yellow: 2 },
      3: { green: 2, red: 3, yellow: 3 },
      4: { green: 3, red: 3, yellow: 3 }
    }
    const portfolioCount = portfolioCounts[playerCount]
    const portfolioGreen = green.slice(0, portfolioCount.green)
    const portfolioRed = red.slice(0, portfolioCount.red)
    const portfolioYellow = yellow.slice(0, portfolioCount.yellow)
    this.portfolio = [5, ...portfolioGreen, ...portfolioRed, ...portfolioYellow]
    this.portfolio.sort((a, b) => a - b)
    this.hand = this.portfolio.slice(0, 5)
    this.reserve = this.portfolio.slice(5)
    this.center = sorted.filter(id => !this.portfolio.includes(id) && this.exile !== id)
  }
}
