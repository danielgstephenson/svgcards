import Snap from 'snapsvg-cjs-ts'
import { Builder } from '../stage/builder'
import { Description } from '../stage/scribe'
import { Stage } from '../stage/stage'
import { intersect } from '../snap/snaputils'
import { Input } from '../stage/input'

export class Part {
  builder: Builder
  stage: Stage
  input: Input
  description: Description
  type: string
  file: string
  element: Snap.Element
  backFile?: string
  hiddenFile?: string
  selectedFile?: string
  back?: Snap.Element
  hidden?: Snap.Element
  selected?: Snap.Element
  originalTransform: string
  mobile: boolean
  dragging = false
  moved = false
  index: number
  side = 'front'
  text = ''
  layer = 0

  constructor (builder: Builder, description: Description) {
    this.builder = builder
    this.stage = this.builder.stage
    this.input = this.stage.input
    this.description = description
    this.type = this.description.type
    this.file = this.description.file
    const { file, x, y, rotation, type } = this.description
    this.mobile = ['card', 'bit'].includes(type)
    const template = this.builder.templates.get(file)
    if (template == null) throw new Error(`no template for ${description.file}`)
    this.element = template.element.clone()
    this.stage.group.add(this.element)
    this.element.node.style.display = 'block'
    const startMatrix = template.element.transform().localMatrix.translate(x, y)
    this.element.transform(startMatrix.toTransformString())
    this.element.transform(`${this.element.transform().local}r${rotation}`)
    this.originalTransform = this.element.transform().local
    this.element.data('part', this)
    this.element.drag(this.onDragMove, this.onDragStart, this.onDragEnd, this, this, this)
    this.element.mouseover(event => this.input.mouseover(event, this))
    this.element.mouseout(event => this.input.mouseout(event, this))
    this.index = this.stage.parts.length
    this.stage.parts.push(this)
    this.setupFront()
    this.addSides()
  }

  getStack (): Part[] {
    const elements = this.stage.group.children()
    const parts: Part[] = []
    elements.forEach(element => {
      const part = element.data('part')
      if (part instanceof Part) parts.push(part)
    })
    const mobileParts = parts.filter(part => part.mobile)
    const overlapMobileParts = mobileParts.filter(part => intersect(part.element, this.element))
    return overlapMobileParts
  }

  onDragStart (x: number, y: number, event: MouseEvent): void {
    this.onClick(event)
    if (this.mobile && event.button === 0) {
      this.originalTransform = this.element.transform().local
      this.dragging = true
      this.moved = true
      this.bringToTop()
      this.input.selectedParts.forEach(part => {
        part.originalTransform = part.element.transform().local
        part.moved = true
        part.bringToTop()
      })
    }
  }

  onClick (event: MouseEvent): void {
    if (event.ctrlKey || event.button === 1 || this.type === 'screen') {
      this.flip()
    }
    if (event.button === 2 || event.shiftKey) {
      this.select()
    }
    this.input.multiSelect = this.input.selectedParts.includes(this)
  }

  select (): void {
    if (this.selected !== undefined) {
      this.selected.node.style.display = 'block'
      this.input.selectedParts.push(this)
    }
  }

  onDragMove (dx: number, dy: number, x: number, y: number, event: MouseEvent): void {
    if (this.mobile && event.button === 0 && this.dragging) {
      this.mouseTranslate(dx, dy)
      this.input.selectedParts.forEach(part => part.mouseTranslate(dx, dy))
    }
  }

  mouseTranslate (dx: number, dy: number): void {
    const globalToLocalMatrix = this.element.transform().diffMatrix.invert()
    globalToLocalMatrix.e = 0 // set translation in the x-direction to zero
    globalToLocalMatrix.f = 0 // set translation in the y-direction to zero
    const tdx = globalToLocalMatrix.x(dx, dy) // the tranformed dx
    const tdy = globalToLocalMatrix.y(dx, dy) // the transformd dy
    this.element.transform(`t${tdx},${tdy}${this.originalTransform}`)
    this.moved = true
  }

  onDragEnd (event: MouseEvent): void {
    if (this.mobile && this.dragging) {
      this.dragging = false
      this.moved = true
    }
  }

  setupFront (): void {}

  addSides (): void {
    this.setupSideFiles()
    if (this.hiddenFile !== undefined) {
      const hiddenTempate = this.builder.templates.get(this.hiddenFile)
      if (hiddenTempate == null) throw new Error(`missing template ${this.hiddenFile}`)
      this.hidden = hiddenTempate.element.clone()
      this.element.append(this.hidden)
      this.hidden.node.style.display = 'none'
      this.hidden.transform('')
    }
    if (this.backFile !== undefined) {
      const backTemplate = this.builder.templates.get(this.backFile)
      if (backTemplate == null) throw new Error(`missing template ${this.backFile}`)
      this.back = backTemplate.element.clone()
      this.element.append(this.back)
      this.back.node.style.display = 'none'
      this.back.transform('')
    }
    if (this.selectedFile !== undefined) {
      const selectedTemplate = this.builder.templates.get(this.selectedFile)
      if (selectedTemplate == null) throw new Error(`missing template ${this.selectedFile}`)
      this.selected = selectedTemplate.element.clone()
      this.element.append(this.selected)
      this.selected.node.style.display = 'none'
      this.selected.transform('')
    }
  }

  setupSideFiles (): void {
    if (this.type === 'card') {
      this.hiddenFile = 'card/hidden'
      this.backFile = 'card/back'
      this.selectedFile = 'card/selected'
    }
    if (this.type === 'screen') {
      this.hiddenFile = 'board/screen-hidden'
      this.backFile = 'board/screen-back'
    }
    if (this.type === 'bit') {
      this.selectedFile = 'gold/selected'
    }
  }

  flip (): void {
    if (this.hidden === undefined) return
    if (this.back === undefined) return
    const oldSide = this.side
    if (oldSide === 'back') this.setSide('front')
    if (oldSide === 'hidden') this.setSide('front')
    if (oldSide === 'front') this.setSide('hidden')
    this.moved = true
  }

  setSide (side: string): void {
    if (this.hidden === undefined) return
    if (this.back === undefined) return
    this.side = side
    if (side === 'hidden') {
      this.hidden.node.style.display = 'block'
      this.back.node.style.display = 'none'
    }
    if (side === 'back') {
      this.hidden.node.style.display = 'none'
      this.back.node.style.display = 'block'
    }
    if (side === 'front') {
      this.hidden.node.style.display = 'none'
      this.back.node.style.display = 'none'
    }
  }

  bringToTop (): void {
    this.stage.group.append(this.element)
    const screens = this.stage.parts.filter(part => part.type === 'screen')
    screens.forEach(screen => {
      this.stage.group.append(screen.element)
    })
  }
}
