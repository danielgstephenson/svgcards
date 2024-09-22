import { Stage } from '../stage/stage'
import { Update } from './update'

export class ClientMessage {
  seed: string
  updates: Update[] = []
  step: number

  constructor (stage: Stage) {
    this.seed = stage.seed
    this.step = stage.client.step
    const movedParts = stage.parts.filter(part => part.moved)
    movedParts.forEach(part => {
      const update = new Update(part)
      this.updates.push(update)
      part.moved = false
    })
  }
}
