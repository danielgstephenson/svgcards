import Snap from 'snapsvg-cjs-ts'
import { Template } from '../parts/template'
import { Description, Scribe } from './scribe'
import { Stage } from './stage'
import { range, unique } from '../math'
import { Part } from '../parts/part'
import { Card } from '../parts/card'
import { NameTag } from '../parts/nametag'
import { Screen } from '../parts/screen'

export class Builder {
  stage: Stage
  scribe: Scribe
  descriptions: Description[]
  loadingDiv: HTMLDivElement
  templates = new Map<string, Template>()

  colors = new Map<string, string>([
    ['Blue', '#68c3ffff'],
    ['Red', '#c00000ff'],
    ['Green', '#8fff8eff'],
    ['Purple', '#da97ffff'],
    ['Yellow', '#ffffa3ff'],
    ['None', 'white']
  ])

  constructor (stage: Stage) {
    this.loadingDiv = document.getElementById('loadingDiv') as HTMLDivElement
    this.stage = stage
    this.scribe = this.stage.scribe
    this.descriptions = this.stage.scribe.descriptions
    this.makeTemplates()
  }

  build (): void {
    this.descriptions.forEach(description => {
      range(description.clones + 1).forEach(i => {
        this.buildPart(description)
      })
    })
    console.log('build')
    this.stage.setupMessage.updates.forEach(update => {
      this.stage.client.updatePart(update)
    })
    this.stage.buildComplete = true
    setTimeout(() => {
      this.loadingDiv.style.display = 'none'
      this.stage.moveTime = 100
    }, 300)
  }

  buildPart (description: Description): Part {
    if (description.type === 'card') {
      return new Card(this, description)
    }
    if (description.file === 'board/nametag') {
      return new NameTag(this, description)
    }
    if (description.file === 'board/screen') {
      return new Screen(this, description)
    }
    return new Part(this, description)
  }

  makeTemplates (): void {
    const descriptionFiles = this.descriptions.map(description => description.file)
    const iconFiles = this.stage.setupMessage.cards.map(cardInfo => `icons/${cardInfo.icon}`)
    const extraFiles = [
      'card/back', 'card/hidden', 'card/hourglass', 'card/hourglass-white',
      'board/screen-back', 'board/screen-hidden', 'card/gold',
      'board/ready-back', 'card/pawn', 'card/selected', 'gold/selected', 'gold/dollarSelected'
    ]
    const files = unique([...descriptionFiles, ...iconFiles, ...extraFiles])
    files.forEach(file => {
      const path = `assets/${file}.svg`
      Snap.load(path, (fragment: Snap.Fragment) => {
        const template = new Template(this, fragment)
        this.templates.set(file, template)
        if (this.templates.size === files.length) {
          this.build()
        }
      })
    })
  }
}
