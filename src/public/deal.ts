import { Tabletop } from './tabletop'

export class Deal {
  portfolio: number[]
  hand: number[]
  reserve: number[]
  auction: number[]
  auctionLength: number
  market: number
  dungeon: number

  constructor (tabletop: Tabletop) {
    const setupSummary = tabletop.setupSummary
    const playerCount = tabletop.setupSummary.playerCount
    const cards = setupSummary.cards
    const ids = [...cards.keys()]
    const shuffleable = ids.filter(i => i !== 5 && i !== 1)
    const shuffled = tabletop.shuffle(shuffleable)
    const dealCount = 13 + playerCount * 2
    const sliced = shuffled.slice(0, dealCount)
    const sorted = [...sliced].sort((a, b) => a - b)
    const market = sorted.shift()
    if (market == null) throw new Error('market == null')
    this.market = market
    const green = sorted.filter(i => cards[i].color === 'Green').sort((a, b) => a - b)
    const dungeon = green.shift()
    if (dungeon == null) throw new Error('dungeon == null')
    this.dungeon = dungeon
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
    this.auction = sorted.filter(id => !this.portfolio.includes(id) && this.dungeon !== id)
    this.auctionLength = playerCount + 5
  }
}
