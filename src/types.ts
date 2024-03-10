export type Brand<T, FlavorT> = T & {
    _type?: FlavorT
}

export interface Camera {
    x: number
    y: number
    width: number
    height: number
}

export interface App {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    camera: Camera
}
