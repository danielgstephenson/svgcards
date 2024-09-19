import 'snapsvg-cjs-ts'

declare module 'snapsvg-cjs-ts' {
  interface Paper {
    zpd: (options?: any, callbackFunc?: (nan: null, zpdelement: any) => void) => void
    zoomTo: (zoom: number, interval?: number, ease?: (num: number) => number, callbackFunction?: (nan: null, zpdelement: any) => void) => void
    panTo: (x: string | number, y: string | number, interval?: number, ease?: (num: number) => number, cb?: (nan: null, zpdelement: any) => void) => void
    rotate: (a: number, x?: number, y?: number, interval?: number, ease?: (num: number) => number, cb?: (nan: null, zpdelement: any) => void) => void
  }
}
