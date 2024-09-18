import Rand from 'rand-seed'
import { SetupMessage } from '../messages/setupMessage'
import { Client } from './client'
import { Scribe, Description } from './scribe'

export class Tabletop {
  client: Client
  setupMessage: SetupMessage
  rand: Rand
  descriptions: Description[]
  colors = {
    Blue: '#68c3ffff',
    Red: '#ff9797ff',
    Green: '#8fff8eff',
    Purple: '#da97ffff',
    Yellow: '#ffffa3ff',
    None: 'white'
  }

  constructor (client: Client, setupMessage: SetupMessage) {
    this.client = client
    this.setupMessage = setupMessage
    this.rand = new Rand(setupMessage.seed)
    const scribe = new Scribe(this)
    this.descriptions = scribe.descriptions
  }

  setup (setupMessage: SetupMessage): void {
    //
  }

  shuffle <T> (array: T[]): T[] {
    return array
      .map(item => ({ value: item, priority: this.rand.next() }))
      .sort((a, b) => a.priority - b.priority)
      .map(x => x.value)
  }
}
