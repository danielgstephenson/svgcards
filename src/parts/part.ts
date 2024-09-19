import Snap from 'snapsvg-cjs-ts'
import { Builder } from '../stage/builder'
import { Description } from '../stage/scribe'

export class Part {
  builder: Builder
  description: Description
  element: Snap.Element

  constructor (builder: Builder, description: Description) {
    this.builder = builder
    this.description = description
    const { file, x, y, rotation } = description
    const template = this.builder.templates.get(file)
    if (template == null) {
      throw new Error(`no template for ${description.file}`)
    }
    const startMatrix = template.element.transform().localMatrix.translate(x, y)
    this.element = template.element.clone()
    this.builder.stage.group.add(this.element)
    this.element.node.style.display = 'block'
    this.element.transform(startMatrix.toTransformString())
    this.element.transform(`${this.element.transform().local}r${rotation}`)
  }
}
