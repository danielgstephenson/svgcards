import Snap from 'snapsvg-cjs-ts'
import { Builder } from '../stage/builder'
import { Description } from '../stage/scribe'

export class Part {
  builder: Builder
  description: Description
  element: Snap.Element
  selected?: Snap.Element
  back?: Snap.Element
  hidden?: Snap.Element
  originalTransform: string
  mobile: boolean
  dragging = false
  moved = false

  constructor (builder: Builder, description: Description) {
    this.builder = builder
    this.description = description
    const { file, x, y, rotation, type } = this.description
    this.mobile = ['card', 'bit'].includes(type)
    const template = this.builder.templates.get(file)
    if (template == null) throw new Error(`no template for ${description.file}`)
    this.element = template.element.clone()
    this.builder.stage.group.add(this.element)
    this.element.node.style.display = 'block'
    const startMatrix = template.element.transform().localMatrix.translate(x, y)
    this.element.transform(startMatrix.toTransformString())
    this.element.transform(`${this.element.transform().local}r${rotation}`)
    this.originalTransform = this.element.transform().local
    this.element.data('part', this)
    this.element.drag(this.onDragMove, this.onDragStart, this.onDragEnd, this, this, this)
    this.builder.parts.push(this)
  }

  onDragStart (x: number, y: number, event: MouseEvent): void {
    if (this.mobile) {
      this.dragging = true
      this.moved = true
      this.originalTransform = this.element.transform().local
    }
  }

  onDragMove (dx: number, dy: number, x: number, y: number, event: MouseEvent): void {
    if (this.mobile) {
      this.moved = true
      const globalToLocalMatrix = this.element.transform().diffMatrix.invert()
      globalToLocalMatrix.e = 0 // set translation in the x-direction to zero
      globalToLocalMatrix.f = 0 // set translation in the y-direction to zero
      const tdx = globalToLocalMatrix.x(dx, dy) // the tranformed dx
      const tdy = globalToLocalMatrix.y(dx, dy) // the transformd dy
      this.element.transform(`t${tdx},${tdy}${this.originalTransform}`)
    }
  }

  onDragEnd (event: MouseEvent): void {
    if (this.mobile) {
      this.dragging = false
      this.moved = true
    }
  }
}
