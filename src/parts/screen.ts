import Snap from 'snapsvg-cjs-ts'
import { Builder } from '../stage/builder'
import { Description } from '../stage/scribe'
import { Part } from './part'
import { intersect } from '../snap/snaputils'

export class Screen extends Part {
  textbox: Snap.Element

  constructor (builder: Builder, description: Description) {
    super(builder, description)
    this.text = '75'
    this.textbox = this.getTextBox()
    this.updateCount()
    setInterval(() => this.updateCount(), 300)
  }

  getTextBox (): Snap.Element {
    const x = this.description.x - 920
    const y = this.description.y + 60
    const textbox = this.builder.stage.group.text(x, y, this.text)
    textbox.attr({
      'font-size': 150,
      'font-weight': 'bold',
      'text-anchor': 'middle',
      font: 'monospace',
      fill: 'blue',
      text: this.text
    })
    return textbox
  }

  updateCount (): void {
    this.text = `${this.getCount()}`
    this.textbox.attr({ text: this.text })
  }

  getCount (): number {
    const elements = this.stage.group.children()
    const parts: Part[] = []
    elements.forEach(element => {
      const part = element.data('part')
      if (part instanceof Part) parts.push(part)
    })
    const cards = parts.filter(part => part.type === 'card')
    const overlapCards = cards.filter(part => intersect(part.element, this.element))
    return overlapCards.length
  }
}
