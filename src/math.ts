export function range (n: number): number[] {
  return [...Array(n).keys()]
}

export function unique<T> (array: T[]): T[] {
  const s = new Set(array)
  return [...s]
}
