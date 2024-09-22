import fs from 'fs-extra'
import path from 'path'
import { PlayerCount } from './types'

export class Config {
  port = 8080
  secure = false
  playerCount: PlayerCount = 3

  constructor () {
    const dirname = path.dirname(__filename)
    const configPath = path.join(dirname, '../config.json')
    const fileExists: boolean = fs.existsSync(configPath)
    if (fileExists) {
      const json = fs.readJSONSync(configPath)
      if (typeof json.port === 'number') this.port = json.port
      if (typeof json.secure === 'boolean') this.secure = json.secure
      if (typeof json.timeScale === 'number') this.playerCount = json.playerCount
    }
    console.log('port:', this.port)
    console.log('secure:', this.secure)
    console.log('playerCount:', this.playerCount)
  }
}
