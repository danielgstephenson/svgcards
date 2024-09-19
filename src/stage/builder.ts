import Snap from 'snapsvg-cjs-ts'
import { Template } from '../parts/template'
import { Description, Scribe } from './scribe'
import { Stage } from './stage'

export class Builder {
  stage: Stage
  scribe: Scribe
  descriptions: Description[]
  templates: Template[] = []
  loadingDiv: HTMLDivElement

  colors = {
    Blue: '#68c3ffff',
    Red: '#ff9797ff',
    Green: '#8fff8eff',
    Purple: '#da97ffff',
    Yellow: '#ffffa3ff',
    None: 'white'
  }

  constructor (stage: Stage) {
    this.loadingDiv = document.getElementById('loading') as HTMLDivElement
    this.stage = stage
    this.scribe = this.stage.scribe
    this.descriptions = this.stage.scribe.descriptions
    this.makeTemplates()
  }

  build (): void {
    // this.loadingDiv.style.display = 'none'
    console.log('build')
  }

  makeTemplates (): void {
    const files = this.descriptions.map(description => description.file)
    files.forEach(file => {
      const path = `assets/${file}.svg`
      Snap.load(path, (fragment: Snap.Fragment) => {
        const template = new Template(this, fragment)
        this.stage.builder.templates.push(template)
        if (this.stage.builder.templates.length === this.descriptions.length) {
          this.build()
        }
      })
    })
  }
}
