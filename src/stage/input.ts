import Snap from 'snapsvg-cjs-ts'
import { Part } from '../parts/part'
import { Stage } from './stage'
import { Card } from '../parts/card'
import { range } from '../math'

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
    const sideBarShare = 0.28
    const centerX = sideBarShare * width + 0.5 * (1 - sideBarShare) * width
    this.paper.zoomTo(0.3, 10, undefined, () => {
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
      const old = this.keyboard.get(event.key)
      this.keyboard.set(event.key, true)
      this.keyboardPan()
      this.keyboardZoom()
      if (old === true) {
        return true
      }
      const trimmed = event.key.trim()
      if (trimmed.length === 0) {
        return
      }
      const number = Number(event.key)
      const numeric = !isNaN(number) && isFinite(number)
      if (!numeric) {
        return
      }
      const n = number === 0 ? 10 : number
      if (n > 0) this.drawFromStack(n)
    })
    document.addEventListener('keyup', (event) => {
      this.keyboard.set(event.key, false)
    })

    const sideBarDiv = document.getElementById('sideBar') as HTMLDivElement
    const cardListDiv = document.getElementById('cardList') as HTMLDivElement
    cardListDiv.innerHTML = this.stage.setupMessage.cards.map(card => {
      const red = card.color === 'Red'
      const redClass = red ? 'cardListing red' : ''
      const color = this.stage.builder.colors.get(card.color)
      if (color == null) throw new Error(`Missing color ${card.color}`)
      const bonus = card.bonus != null && card.bonus !== ''
        ? `<div class="cardListingBonus">${card.bonus}</div>`
        : ''
      const time = Number(card.time)
      const timeRange = range(time)
      const eye = red ? 'hourglass-white' : 'hourglass'
      const eyes = timeRange.map(i => {
        return `<img class="cardListingEye" src="/assets/card/${eye}.svg">`
      })
      const eyesString = eyes.join('')
      return `
        <div class="cardListing ${redClass}" style="background: ${color};">
          <div class="cardListingRank">${card.rank}${eyesString}</div>
          <div class="cardListingPowers">
            <div class="cardListingBeginning cardListingPower">${card.beginning}</div>
            <div class="cardListingPower">${card.end}</div>
          </div>
        </div>
        ${bonus}
      `
    }).join('\n')
    const roundStructureDiv = document.getElementById('roundStructure') as HTMLDivElement
    roundStructureDiv.addEventListener('click', () => {
      sideBarDiv.classList.toggle('reverse')
    })
    cardListDiv.addEventListener('click', () => {
      sideBarDiv.classList.toggle('reverse')
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
      if (part.side === 'back') return
      const color = this.stage.builder.colors.get(part.description.color)
      if (color === undefined) throw new Error(`Missing color ${part.description.color}`)
      const a = this.detailDiv.innerHTML.replace(/\s+/g, '')
      const b = part.description.details.replace(/\s+/g, '')
      const aLetters = a.split('')
      const bLetters = b.split('')
      const same = bLetters.every((bLetter, i) => {
        const aLetter = aLetters[i]
        const same = bLetter === aLetter
        if (same) return true
        return false
      })
      if (same) return
      this.detailDiv.innerHTML = part.description.details
      this.detailDiv.style.backgroundColor = color
      const redColor = this.stage.builder.colors.get('Red')
      if (color === redColor) {
        this.detailDiv.classList.add('red')
      } else {
        this.detailDiv.classList.remove('red')
      }
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
    if (this.mouseOverParts.length === 0) {
      return
    }
    const part = this.mouseOverParts[0]
    if (part.type === 'board') {
      return
    }
    if (this.stage.input.selectedParts.includes(part)) {
      return
    }
    const origin = part.element.transform().string
    const stack = part.getStack()
    if (stack.length < 2 || stack.length < n) {
      return
    }
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
