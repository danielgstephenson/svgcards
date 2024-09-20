import { Stage } from '../stage/stage'
import { Update } from './update'

export class ClientMessage {
  seed: string
  updates: Update[] = []

  constructor (stage: Stage) {
    this.seed = stage.seed
    const movedParts = stage.parts.filter(part => part.moved)
    movedParts.forEach(part => {
      const update = new Update(part)
      this.updates.push(update)
      part.moved = false
    })
  }
}
