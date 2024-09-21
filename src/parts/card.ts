import { CardInfo } from '../cardInfo'
import { Builder } from '../stage/builder'
import { Description } from '../stage/scribe'
import { Part } from './part'
import { Template } from './template'

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
    const red = this.description.color === 'Red'
    const path = red ? 'card/hourglass-white' : 'card/hourglass'
    const template = this.builder.templates.get(path)
    if (template == null) throw new Error(`No template for ${path}`)
    const y = -120
    if (this.description.time >= 1) {
      const hourglass = template.element.clone()
      this.element.append(hourglass)
      hourglass.node.style.display = 'block'
      hourglass.transform(`t0,${y}`)
    }
    if (this.description.time >= 2) {
      const hourglass = template.element.clone()
      this.element.append(hourglass)
      hourglass.node.style.display = 'block'
      hourglass.transform(`t35,${y}`)
    }
    if (this.description.time >= 3) {
      const hourglass = template.element.clone()
      this.element.append(hourglass)
      hourglass.node.style.display = 'block'
      hourglass.transform(`t70,${y}`)
    }
  }

  addRank (): void {
    const group = this.builder.stage.group
    const rank = this.cardInfo.rank
    const centerX = 50
    const centerY = 1070
    const rankX = 0
    const rankY = -30
    const rankTextElement = group.text(centerX + rankX, centerY + rankY, rank)
    rankTextElement.attr({ fontSize: 70 })
    rankTextElement.attr({ textAnchor: 'middle' })
    rankTextElement.attr({ fontFamily: 'sans-serif' })
    rankTextElement.attr({ fontWeight: 'bold' })
    if (this.description.color === 'Red') rankTextElement.attr({ fill: 'white' })
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
    const centerX = 0.5 * scale * 512
    const y = 1070
    icon.transform(`scale(${scale})${icon.transform().local}`)
    icon.transform(`t${-centerX},0${icon.transform().local}`)
    icon.transform(`t50,${y}${icon.transform().local}`)
  }

  getCardInfo (): CardInfo {
    return this.builder.stage.setupMessage.cards[this.description.cardId]
  }

  getTemplate (path: string): Template {
    const template = this.builder.templates.get(path)
    if (template == null) throw new Error(`No template for ${path}`)
    return template
  }
}
