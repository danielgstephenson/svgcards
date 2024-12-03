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
    const dealCount = 11 + playerCount * 2
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
      2: { green: 1, red: 4, yellow: 2 },
      3: { green: 1, red: 4, yellow: 3 },
      4: { green: 2, red: 4, yellow: 3 },
      5: { green: 2, red: 5, yellow: 3 }
    }
    const portfolioCount = portfolioCounts[playerCount]
    const portfolioGreen = green.slice(0, portfolioCount.green)
    const portfolioRed = red.slice(0, portfolioCount.red)
    const portfolioYellow = yellow.slice(0, portfolioCount.yellow)
    this.portfolio = [4, ...portfolioGreen, ...portfolioRed, ...portfolioYellow]
    this.portfolio.sort((a, b) => a - b)
    const deckSize = playerCount + 1
    this.hand = this.portfolio.slice(0, -deckSize)
    this.reserve = this.portfolio.slice(-deckSize)
    this.center = sorted.filter(id => !this.portfolio.includes(id) && this.exile !== id)
  }
}
