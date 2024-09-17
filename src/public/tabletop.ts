import Rand from 'rand-seed'
import { SetupSummary } from '../summaries/setupSummary'
import { Client } from './client'

export class Tabletop {
  client: Client
  setupSummary: SetupSummary
  rand: Rand
  colors = {
    Blue: '#68c3ffff',
    Red: '#ff9797ff',
    Green: '#8fff8eff',
    Purple: '#da97ffff',
    Yellow: '#ffffa3ff',
    None: 'white'
  }

  constructor (client: Client, setupSummary: SetupSummary) {
    this.client = client
    this.setupSummary = setupSummary
    this.rand = new Rand(setupSummary.seed)
  }

  setup (setupSummary: SetupSummary): void {
    //
  }

  shuffle <T> (array: T[]): T[] {
    return array
      .map(item => ({ value: item, priority: this.rand.next() }))
      .sort((a, b) => a.priority - b.priority)
      .map(x => x.value)
  }
}
