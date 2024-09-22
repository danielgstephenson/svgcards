import { Part } from '../parts/part'

export class Update {
  socketId: string
  index = 0
  side = 'front'
  local = ''
  text = ''
  step = 0

  constructor (part: Part) {
    this.socketId = part.stage.socketId
    this.index = part.index
    this.side = part.side
    this.local = part.element.transform().local
    this.text = part.text
  }
}
