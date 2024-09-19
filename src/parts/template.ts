import Snap from 'snapsvg-cjs-ts'
import { Builder } from '../stage/builder'

export class Template {
  builder: Builder
  element: Snap.Element

  constructor (builder: Builder, fragment: Snap.Fragment) {
    this.builder = builder
    this.element = fragment.select('g')
    this.builder.stage.paper.append(this.element)
    const width = this.element.getBBox().width
    const height = this.element.getBBox().height
    const startMatrix = this.element.transform().localMatrix.translate(-0.5 * width, -0.5 * height)
    this.element.transform(startMatrix.toTransformString())
    this.builder.stage.group.append(this.element)
    this.element.node.style.display = 'none'
  }
}
