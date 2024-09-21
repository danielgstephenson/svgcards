import { CardInfo } from '../cardInfo'
import { Builder } from '../stage/builder'
import { Description } from '../stage/scribe'
import { Part } from './part'

export class Card extends Part {
  cardInfo: CardInfo

  constructor (builder: Builder, description: Description) {
    super(builder, description)
    this.cardInfo = this.getCardInfo()
    this.addColor()
  }

  setupFront (): void {
    this.cardInfo = this.getCardInfo()
    this.addColor()
    this.addRank()
    this.addTime()
    this.addIcon()
  }

  addColor (): void {
    const color = this.builder.colors.get(this.cardInfo.color) ?? 'white'
    const rectElement = this.element.children()[1].children()[1]
    rectElement.attr({ fill: color })
  }

  addTime (): void {
    const hourglassFile = 'card/hourglass'
    const hourglassTemplate = this.builder.templates.get(hourglassFile)
    if (hourglassTemplate == null) throw new Error(`no template for ${hourglassFile}`)
    const y = -130
    if (this.description.time >= 1) {
      const hourglass = hourglassTemplate.element.clone()
      this.element.append(hourglass)
      hourglass.node.style.display = 'block'
      hourglass.transform(`t0,${y}`)
    }
    if (this.description.time >= 2) {
      const hourglass = hourglassTemplate.element.clone()
      this.element.append(hourglass)
      hourglass.node.style.display = 'block'
      hourglass.transform(`t35,${y}`)
    }
    if (this.description.time >= 3) {
      const hourglass = hourglassTemplate.element.clone()
      this.element.append(hourglass)
      hourglass.node.style.display = 'block'
      hourglass.transform(`t70,${y}`)
    }
  }

  addRank (): void {
    const group = this.builder.stage.group
    const rank = this.cardInfo.rank
    const centerX = 50
    const centerY = 1040
    const rankX = 0
    const rankY = -25
    const rankTextElement = group.text(centerX + rankX, centerY + rankY, rank)
    rankTextElement.attr({ fontSize: 70 })
    rankTextElement.attr({ textAnchor: 'middle' })
    rankTextElement.attr({ fontFamily: 'sans-serif' })
    rankTextElement.attr({ fontWeight: 'bold' })
    this.element.add(rankTextElement)
  }

  addIcon (): void {
    const iconFile = `icons/${this.cardInfo.icon}`
    const iconTemplate = this.builder.templates.get(iconFile)
    if (iconTemplate == null) throw new Error(`no template for ${iconFile}`)
    const icon = iconTemplate.element.clone()
    this.element.append(icon)
    icon.node.style.display = 'block'
    const scale = 0.15
    const centerX = 0.5 * scale * icon.getBBox().width
    icon.transform(`scale(${scale})${icon.transform().local}`)
    icon.transform(`t${-centerX},0${icon.transform().local}`)
    icon.transform(`t50,1020${icon.transform().local}`)
  }

  getCardInfo (): CardInfo {
    return this.builder.stage.setupMessage.cards[this.description.cardId]
  }
}
