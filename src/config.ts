import fs from 'fs-extra'
import path from 'path'
import { PlayerCount } from './types'

export class Config {
  port = 5000
  secure = false
  playerCount: PlayerCount = 2

  constructor () {
    const dirname = path.dirname(__filename)
    const configPath = path.join(dirname, '../config.json')
    const fileExists: boolean = fs.existsSync(configPath)
    if (fileExists) {
      const json = fs.readJSONSync(configPath)
      if (typeof json.port === 'number') this.port = json.port
      if (typeof json.secure === 'boolean') this.secure = json.secure
      if (typeof json.playerCount === 'number') this.playerCount = json.playerCount
    }
    console.info('port:', this.port)
    console.info('secure:', this.secure)
    console.info('playerCount:', this.playerCount)
  }
}
