import { range } from '../math'
import { PlayerCount, SetupMessage } from '../messages/setupMessage'
import { Deal } from './deal'
import { Stage } from './stage'

export class Scribe {
  stage: Stage
  setupMessage: SetupMessage
  descriptions: Description[]
  playerCount: PlayerCount
  deal: Deal
  tableWidth = 3700

  constructor (stage: Stage) {
    this.stage = stage
    this.setupMessage = stage.setupMessage
    this.playerCount = this.setupMessage.playerCount
    this.deal = new Deal(stage)
    this.descriptions = this.getDescriptions()
  }

  getDescriptions (): Description[] {
    const numBottomRowPlayers = Math.round(this.playerCount / 2)
    const numTopRowPlayers = this.playerCount - numBottomRowPlayers
    const topRowOrigins = this.getPortfolioOrigins(numTopRowPlayers, -1050)
    const bottomRowOrigins = this.getPortfolioOrigins(numBottomRowPlayers, 1050)
    const portfolioOrigins = topRowOrigins.concat(bottomRowOrigins)
    const portfolios = portfolioOrigins.map((origin, i) => this.describePortfolio(origin, i)).flat()
    const bank = this.describeBank(2000, 0)
    const market = this.describeMarket(-1950, 0)
    const center = this.describeCenter()
    const descriptions = [...portfolios, ...bank, ...market, ...center]
    descriptions.forEach(description => this.annotate(description))
    descriptions.sort(compareLayers)
    return descriptions
  }

  describeCenter (): Description[] {
    return this.deal.center.map((cardId, i) => {
      const offset = this.deal.center.length / 2 - 0.5
      return describe({
        file: 'card/front',
        x: 0 + (i - offset) * 150,
        y: 0,
        type: 'card',
        cardId
      })
    })
  }

  describePortfolio (origin: Point, player: number): Description[] {
    const x = origin[0]
    const y = origin[1]
    const sgn = Math.sign(y)
    const angle = sgn === -1 ? 180 : 0
    const tableauFile = sgn === 1 ? 'board/tableau-bottom' : 'board/tableau-top'
    const boards = [
      describe({ file: 'board/nametag', x, y: y + sgn * 750, type: 'board' }),
      describe({ file: 'board/screen', x, y: y + sgn * 500, type: 'screen', rotation: angle, player }),
      describe({ file: tableauFile, x, y: sgn === 1 ? y - sgn * 250 : y - sgn * 250, type: 'board' })
    ]
    const hand = this.deal.hand.map((handId, i) => {
      const space = 160
      return describe({
        file: 'card/front',
        x: x + (i - 2) * space,
        y: y + sgn * 500,
        type: 'card',
        cardId: handId
      })
    })
    const reserve = this.deal.reserve.map((reserveId, i) => {
      const space = 160
      return describe({
        file: 'card/front',
        x: x - 50 + (i - 3) * space,
        y: y - sgn * +25,
        type: 'card',
        cardId: reserveId
      })
    })
    const goldCounts = {
      2: { five: 6, ten: 2 },
      3: { five: 4, ten: 2 },
      4: { five: 2, ten: 2 }
    }
    const goldCount = goldCounts[this.playerCount]
    const gold = [
      ...describeRow('gold/5', x + 250, y + sgn * 275, 'bit', goldCount.five, 50 * (8 - this.playerCount)),
      ...describeRow('gold/10', x - 250, y + sgn * 275, 'bit', goldCount.ten, 100)
    ]
    const descriptions = [...boards, ...hand, ...reserve, ...gold]
    return descriptions
  }

  describeBank (x: number, y: number): Description[] {
    return [
      describe({ file: 'gold/1', x: x - 280, y: y - 120, type: 'bit', clones: 150 }),
      describe({ file: 'gold/1', x: x - 280, y: y + 120, type: 'bit', clones: 150 }),
      describe({ file: 'gold/5', x: x - 120, y: y - 120, type: 'bit', clones: 35 }),
      describe({ file: 'gold/5', x: x - 120, y: y + 120, type: 'bit', clones: 35 }),
      describe({ file: 'gold/10', x: x + 60, y: y - 120, type: 'bit', clones: 30 }),
      describe({ file: 'gold/10', x: x + 60, y: y + 120, type: 'bit', clones: 30 }),
      describe({ file: 'gold/25', x: x + 260, y: y - 120, type: 'bit', clones: 15 }),
      describe({ file: 'gold/25', x: x + 260, y: y + 120, type: 'bit', clones: 15 }),
      describe({ file: 'card/front', x: x - 450, y: y - 120, type: 'card', cardId: 1, clones: 50 }),
      describe({ file: 'card/front', x: x - 450, y: y + 120, type: 'card', cardId: 1, clones: 50 }),
      describe({ file: 'board/stack1', x: x - 280, y: y - 120, type: 'stack' }),
      describe({ file: 'board/stack1', x: x - 280, y: y + 120, type: 'stack' }),
      describe({ file: 'board/stack5', x: x - 120, y: y - 120, type: 'stack' }),
      describe({ file: 'board/stack5', x: x - 120, y: y + 120, type: 'stack' }),
      describe({ file: 'board/stack10', x: x + 60, y: y - 120, type: 'stack' }),
      describe({ file: 'board/stack10', x: x + 60, y: y + 120, type: 'stack' }),
      describe({ file: 'board/stack25', x: x + 260, y: y - 120, type: 'stack' }),
      describe({ file: 'board/stack25', x: x + 260, y: y + 120, type: 'stack' })
    ]
  }

  describeMarket (x: number, y: number): Description[] {
    return [
      describe({ file: 'board/court', x, y: 0, type: 'board' }),
      describe({ file: 'card/front', x: x - 250, y: y - 150, type: 'card', cardId: this.deal.market }),
      describe({ file: 'card/front', x: x - 250, y: y + 150, type: 'card', cardId: this.deal.exile })
    ]
  }

  annotate (description: Description): void {
    if (description.type === 'card') {
      const cardInfo = this.setupMessage.cards[description.cardId]
      description.time = Number(cardInfo.time)
      description.color = cardInfo.color
      const bonusText = cardInfo.bonus === '' ? '' : `<strong>Bonus</strong>: ${cardInfo.bonus}<br><br>`
      description.details = `
        <h1>Size: ${cardInfo.rank}</h1>
        <h2>${cardInfo.title}</h2><br>
        Color: ${cardInfo.color}<br>
        Unrest: ${cardInfo.time}<br><br>
        <hr style="border: 1px solid black; margin-bottom: 10px;"/>
        <h3>Powers</h3><br>
        ${cardInfo.beginning}<br><br>
        ${cardInfo.end}<br><br>
        ${bonusText}
      `
    }
  }

  getPortfolioOrigins (n: number, y: number): Point[] {
    return range(n).map(i => {
      const alpha = (i + 1) / (n + 1)
      const x = -this.tableWidth * alpha + this.tableWidth * (1 - alpha)
      return [x, y]
    })
  }
}

function describeRow (
  file: string,
  x: number,
  y: number,
  type: string,
  n: number,
  length: number,
  side?: string
): Description[] {
  return range(n).map(i => {
    const alpha = n > 1 ? i / (n - 1) : 0
    const myX = (x - 0.5 * length) * (1 - alpha) + (x + 0.5 * length) * alpha
    return describe({ file, x: myX, y, type, side })
  })
}

function compareLayers (a: Description, b: Description): number {
  const aLayer = getLayer(a)
  const bLayer = getLayer(b)
  return aLayer - bLayer
}

function getLayer (description: Description): number {
  switch (description.type) {
    case 'board': return 1
    case 'card': return 2
    case 'bit': return 3
    case 'screen': return 4
    default: return 0
  }
}

function describe (options: PartialDescription): Description {
  const defaults = {
    x: 0,
    y: 0,
    type: 'bit',
    clones: 0,
    cardId: 0,
    rotation: 0,
    side: 'front',
    player: 1,
    time: 0,
    color: 'green',
    details: ''
  }
  return Object.assign(defaults, options)
}

export interface Description {
  file: string
  x: number
  y: number
  type: string
  clones: number
  cardId: number
  rotation: number
  side: string
  player: number
  time: number
  color: string
  details: string
}

interface PartialDescription {
  file: string
  x?: number
  y?: number
  type?: string
  clones?: number
  cardId?: number
  rotation?: number
  side?: string
  player?: number
  time?: number
  color?: string
  details?: string
}

type Point = [number, number]
