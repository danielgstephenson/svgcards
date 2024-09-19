import Snap from 'snapsvg-cjs-ts'
import { Template } from '../parts/template'
import { Description, Scribe } from './scribe'
import { Stage } from './stage'
import { range, unique } from '../math'
import { Part } from '../parts/part'

export class Builder {
  stage: Stage
  scribe: Scribe
  descriptions: Description[]
  loadingDiv: HTMLDivElement
  templates = new Map<string, Template>()
  parts: Part[] = []

  colors = {
    Blue: '#68c3ffff',
    Red: '#ff9797ff',
    Green: '#8fff8eff',
    Purple: '#da97ffff',
    Yellow: '#ffffa3ff',
    None: 'white'
  }

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
        const part = new Part(this, description)
        this.parts.push(part)
      })
    })
    console.log('build')
    this.loadingDiv.style.display = 'none'
  }

  makeTemplates (): void {
    const descriptionFiles = unique(this.descriptions.map(description => description.file))
    const extraFiles = [
      'card/back', 'card/hidden', 'card/facedown', 'card/hourglass', 'card/gold',
      'board/screen-back', 'board/screen-hidden', 'board/screen-facedown',
      'board/ready-back', 'card/pawn', 'card/selected', 'gold/selected', 'gold/dollarSelected'
    ]
    const files = [...descriptionFiles, ...extraFiles]
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
