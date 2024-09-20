import { CardInfo } from '../cardInfo'
import { Builder } from '../stage/builder'
import { Description } from '../stage/scribe'
import { Part } from './part'

export class Card extends Part {
  cardInfo: CardInfo

  constructor (builder: Builder, description: Description) {
    super(builder, description)
    this.cardInfo = this.builder.stage.setupMessage.cards[this.description.cardId]
    this.addColor()
    this.addRankText()
  }

  addColor (): void {
    const color = this.builder.colors.get(this.cardInfo.color) ?? 'white'
    const rectElement = this.element.children()[1].children()[1]
    rectElement.attr({ fill: color })
  }

  addRankText (): void {
    const group = this.builder.stage.group
    const rank = this.cardInfo.rank
    const rankX = 50
    const rankY = 1040
    const rankTextElement = group.text(rankX, rankY, rank)
    rankTextElement.attr({ fontSize: 80 })
    rankTextElement.attr({ textAnchor: 'middle' })
    rankTextElement.attr({ fontFamily: 'sans-serif' })
    rankTextElement.attr({ fontWeight: 'bold' })
    this.element.add(rankTextElement)
  }
}
