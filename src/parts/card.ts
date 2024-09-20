import { CardInfo } from '../cardInfo'
import { Builder } from '../stage/builder'
import { Description } from '../stage/scribe'
import { Part } from './part'

export class Card extends Part {
  cardInfo: CardInfo
  color: string

  constructor (builder: Builder, description: Description) {
    super(builder, description)
    this.cardInfo = this.builder.stage.setupMessage.cards[this.description.cardId]
    this.color = this.builder.colors.get(this.cardInfo.color) ?? 'white'
    const rectElement = this.element.children()[1].children()[1]
    rectElement.attr({ fill: this.color })
  }
}
