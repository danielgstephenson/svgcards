import Snap from 'snapsvg-cjs-ts'
import { Builder } from '../stage/builder'
import { Description } from '../stage/scribe'
import { Part } from './part'

export class NameTag extends Part {
  textbox: Snap.Element

  constructor (builder: Builder, description: Description) {
    super(builder, description)
    this.text = 'Name Tag'
    this.textbox = this.builder.stage.group.text(this.element.getBBox().width / 2, 760, this.text)
    this.textbox.attr({ 'font-size': 100, 'text-anchor': 'middle', fill: 'black' })
    this.element.add(this.textbox)
  }

  updateText (text: string): void {
    this.text = text
    this.textbox.attr({ text: this.text })
  }

  onClick (event: MouseEvent): void {
    super.onClick(event)
    const name = window.prompt('Please enter your name:')
    if (name != null) {
      this.updateText(name)
      this.moved = true
    }
  }
}
