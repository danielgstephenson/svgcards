import Rand from 'rand-seed'
import { SetupMessage } from '../messages/setupMessage'
import { Client } from '../client'
import { Scribe } from './scribe'
import { Builder } from './builder'
import Snap from 'snapsvg-cjs-ts'
import '../snap/snap.svg.zpd.js'
import { Part } from '../parts/part'

export class Stage {
  client: Client
  setupMessage: SetupMessage
  socketId: string
  paper: Snap.Paper
  group: Snap.Paper
  seed: string
  rand: Rand
  scribe: Scribe
  builder: Builder
  buildComplete = false
  multiSelect = false
  multiDrag = false
  selected: Part[] = []
  parts: Part[] = []
  moveTime = 1

  constructor (client: Client, setupMessage: SetupMessage) {
    this.client = client
    this.socketId = setupMessage.socketId
    this.paper = Snap('#mysvg')
    this.seed = setupMessage.seed
    this.rand = new Rand(this.seed)
    this.setupMessage = setupMessage
    this.group = this.paper.group()
    this.scribe = new Scribe(this)
    this.builder = new Builder(this)
    this.paper.zpd({ zoom: true, pan: false, drag: false })
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
  }

  shuffle <T> (array: T[]): T[] {
    return array
      .map(item => ({ value: item, priority: this.rand.next() }))
      .sort((a, b) => a.priority - b.priority)
      .map(x => x.value)
  }

  deselect (): void {
    this.selected.forEach(part => {
      if (part.selected !== undefined) {
        part.selected.node.style.display = 'none'
      }
      this.selected = []
    })
  }
}
