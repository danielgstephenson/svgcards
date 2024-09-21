import Snap from 'snapsvg-cjs-ts'
import { Part } from '../parts/part'
import { Stage } from './stage'
import { Card } from '../parts/card'

export class Input {
  stage: Stage
  paper: Snap.Paper
  multiSelect = false
  multiDrag = false
  keyboard = new Map<string, boolean>()
  mouseOverParts: Part[] = []
  selectedParts: Part[] = []
  detailDiv: HTMLDivElement

  constructor (stage: Stage) {
    this.stage = stage
    this.paper = stage.paper
    this.paper.zpd({ zoom: true, pan: false, drag: false })
    this.detailDiv = document.getElementById('detailDiv') as HTMLDivElement
    const width = document.documentElement.clientWidth
    const height = document.documentElement.clientHeight
    const sideBarShare = 0.29
    const centerX = sideBarShare * width + 0.5 * (1 - sideBarShare) * width
    this.paper.zoomTo(0.2, 10, undefined, () => {
      this.paper.panTo(centerX, height / 2)
    })
    this.paper.mousedown(event => {
      if (event.button === 2) this.paper.zpd({ pan: true })
      if (event.button === 0 && !this.multiSelect) this.deselect()
      this.multiSelect = false
    })
    this.paper.mouseup(event => {
      if (event.button === 2) this.paper.zpd({ pan: false })
    })
    document.addEventListener('keydown', (event) => {
      this.keyboard.set(event.key, true)
      this.keyboardPan()
      this.keyboardZoom()
      const n = Number(event.key) === 0 ? 10 : Number(event.key)
      if (isNaN(n)) return false
      if (n > 0) this.drawFromStack(n)
      console.log(2)
    })
    document.addEventListener('keyup', (event) => {
      this.keyboard.set(event.key, false)
    })
  }

  keyboardPan (): void {
    let xPan = 0
    let yPan = 0
    const panSpeed = 10
    if (this.isKeyDown('ArrowUp')) {
      yPan += panSpeed
    }
    if (this.isKeyDown('ArrowDown')) {
      yPan -= panSpeed
    }
    if (this.isKeyDown('ArrowRight')) {
      xPan -= panSpeed
    }
    if (this.isKeyDown('ArrowLeft')) {
      xPan += panSpeed
    }
    const panLength = Math.sqrt(xPan * xPan + yPan * yPan)
    const xPanSign = Math.sign(xPan) < 0 ? '-' : '+'
    const yPanSign = Math.sign(yPan) < 0 ? '-' : '+'
    const xPanString = `${xPanSign}${Math.abs(xPan)}`
    const yPanString = `${yPanSign}${Math.abs(yPan)}`
    if (panLength > 0) {
      this.paper.zpd({ pan: false })
      this.paper.panTo(`${xPanString}`, `${yPanString}`)
    }
  }

  keyboardZoom (): void {
    let zoomChange = 0
    if (this.isKeyDown('PageUp') || this.isKeyDown(',')) zoomChange -= 0.01
    if (this.isKeyDown('PageDown') || this.isKeyDown('.')) zoomChange += 0.01
    const matrix = this.paper.zpd('save') as SVGMatrix
    const oldZoom = matrix.a
    const newZoom = Math.max(0.01, oldZoom + zoomChange)
    if (Math.abs(zoomChange) > 0) {
      this.paper.zoomTo(newZoom, 1)
    }
    if (this.isKeyDown('/')) this.paper.zoomTo(0.2, 1)
  }

  isKeyDown (key: string): boolean {
    return this.keyboard.get(key) ?? false
  }

  mouseover (event: MouseEvent, part: Part): void {
    this.mouseOverParts.push(part)
    if (part instanceof Card) {
      this.detailDiv.innerHTML = part.description.details
    }
  }

  mouseout (event: MouseEvent, part: Part): void {
    this.mouseOverParts = this.mouseOverParts.filter(otherPart => otherPart !== part)
  }

  deselect (): void {
    this.selectedParts.forEach(part => {
      if (part.selected !== undefined) {
        part.selected.node.style.display = 'none'
      }
      this.selectedParts = []
    })
  }

  drawFromStack (n: number): void {
    if (this.mouseOverParts.length > 0) {
      const part = this.mouseOverParts[0]
      const origin = part.element.transform().string
      const stack = part.getStack()
      const draw = stack.slice(0, n)
      draw.forEach((drawPart, i) => {
        const x = 0
        const count = draw.length - i
        const yBase = 10 * (draw.length - 2)
        const yDown = 50 * count
        const y = -yBase + yDown
        drawPart.element.transform(`${origin}t${x},${y}`)
        drawPart.bringToTop()
        drawPart.select()
        drawPart.moved = true
      })
    }
  }
}
