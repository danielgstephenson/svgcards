import Snap from 'snapsvg-cjs-ts'

export function intersect (a: Snap.Element, b: Snap.Element): boolean {
  return Snap.path.isBBoxIntersect(a.getBBox(), b.getBBox())
}
