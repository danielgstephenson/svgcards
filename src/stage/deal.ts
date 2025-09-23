import { Stage } from './stage'

export class Deal {
  portfolio: number[]
  hand: number[]
  reserve: number[]
  center: number[]
  market: number[]
  dungeon: number

  constructor (stage: Stage) {
    const setupMessage = stage.setupMessage
    const playerCount = stage.setupMessage.playerCount
    const cards = setupMessage.cards
    console.info('cards', cards)
    const ids = [...cards.keys()]
    const guaranteedRanks: number[] = [6, 10, 12, 13, 14, 16, 17, 18, 19, 20]
    console.info('guaranteedRanks', guaranteedRanks)
    const excludedRanks: number[] = []
    console.info('excludedRanks', excludedRanks)
    const guaranteedIndices = guaranteedRanks.map((rank) => rank - 1)
    const excludedIndices = excludedRanks.map((rank) => rank - 1)
    const shuffleable = ids.filter(i => i !== 4 && i !== 7 && i !== 0 && !guaranteedIndices.includes(i) && !excludedIndices.includes(i))
    this.printRanks('shuffleable', shuffleable)
    console.info('shuffleable.length', shuffleable.length)
    const shuffled = stage.shuffle(shuffleable)
    const dealCount = 13 + playerCount - guaranteedIndices.length
    console.info('dealCount', dealCount)
    const sliced = shuffled.slice(0, dealCount)
    this.printRanks('sliced', sliced)
    console.info('sliced.length', sliced.length)
    if (sliced.length !== dealCount) {
      throw new Error('No enough dealt cards')
    }
    const combined = [...guaranteedIndices, ...sliced]
    const dealt = stage.shuffle(combined)
    this.printRanks('dealt', dealt)
    const sorted = [...dealt].sort((a, b) => a - b)
    this.printRanks('sorted', sorted)
    const market1 = sorted.shift()
    if (market1 == null) throw new Error('market1 == null')
    const market = [market1]
    this.market = market
    const green = sorted.filter(i => cards[i].color === 'Green').sort((a, b) => a - b)
    const yellow = sorted.filter(i => cards[i].color === 'Yellow').sort((a, b) => a - b)
    const dungeon = green.shift() ?? yellow.shift()
    if (dungeon == null) throw new Error('dungeon == null')
    this.dungeon = dungeon
    const red = sorted.filter(i => cards[i].color === 'Red').sort((a, b) => a - b)
    const portfolioCounts = {
      2: { green: 1, red: 4, yellow: 3 },
      3: { green: 1, red: 4, yellow: 3 },
      4: { green: 1, red: 4, yellow: 3 },
      5: { green: 1, red: 4, yellow: 3 }
    }
    const portfolioCount = portfolioCounts[playerCount]
    const portfolioGreen = green.slice(0, portfolioCount.green)
    const portfolioRed = red.slice(0, portfolioCount.red)
    const portfolioYellow = yellow.slice(0, portfolioCount.yellow)
    this.portfolio = [4, 7, ...portfolioGreen, ...portfolioRed, ...portfolioYellow]
    const PORTFOLIO_SIZE = 10
    if (this.portfolio.length < PORTFOLIO_SIZE) {
      const remaining = sorted.filter(id => !this.portfolio.includes(id) && this.dungeon !== id)
      const missing = PORTFOLIO_SIZE - this.portfolio.length
      const more = remaining.slice(0, missing)
      this.portfolio.push(...more)
    }
    this.portfolio.sort((a, b) => a - b)
    this.printRanks('this.portfolio', this.portfolio)
    const HAND_SIZE = 5
    this.hand = this.portfolio.slice(0, HAND_SIZE)
    this.printRanks('this.hand', this.hand)
    this.reserve = this.portfolio.slice(HAND_SIZE)
    this.printRanks('this.reserve', this.reserve)
    const palatial = sorted.filter(id => !this.portfolio.includes(id) && this.dungeon !== id)
    // const market2 = palatial.shift()
    // if (market2 == null) throw new Error('market2 == null')
    // this.market.push(market2)
    this.center = palatial
    const remaining = [...cards.keys()].filter(id => {
      const result =
        !this.portfolio.includes(id) &&
        !this.center.includes(id) &&
        this.dungeon !== id &&
        !this.market.includes(id) && id !== 0
      return result
    })
    this.printRanks('remaining', remaining)
  }

  printRanks (label: string, ids: number[]): void {
    const ranks = ids.map(id => id + 1)
    console.info(label, ranks)
  }
}
