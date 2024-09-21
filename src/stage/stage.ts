import Rand from 'rand-seed'
import { SetupMessage } from '../messages/setupMessage'
import { Client } from '../client'
import { Scribe } from './scribe'
import { Builder } from './builder'
import Snap from 'snapsvg-cjs-ts'
import '../snap/snap.svg.zpd.js'
import { Part } from '../parts/part'
import { Input } from './input'

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
  input: Input
  buildComplete = false
  parts: Part[] = []
  stacksOver: Part[] = []
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
    this.input = new Input(this)
  }

  shuffle <T> (array: T[]): T[] {
    return array
      .map(item => ({ value: item, priority: this.rand.next() }))
      .sort((a, b) => a.priority - b.priority)
      .map(x => x.value)
  }
}
