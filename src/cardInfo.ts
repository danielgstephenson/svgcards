
import csvtojson from 'csvtojson'

export interface CardInfo {
  color: string
  rank: string
  time: string
  beginning: string
  end: string
  bonus: string
  title: string
  label1: string
  label2: string
  link1: string
  link2: string
  icon1: string
  icon2: string
  icon: string
}

export async function readCards (): Promise<CardInfo[]> {
  const cards = await csvtojson().fromFile('cards.csv')
  return cards as CardInfo[]
}
