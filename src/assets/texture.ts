export interface Texture {
    img: HTMLImageElement
    isLoading: boolean
}

const textures: Record<string, Texture> = {}

export const EmptyTexture: Texture = {
    img: new Image(),
    isLoading: false,
}

export function loadTexture(id: string, src: string) {
    const texture: Texture = {
        img: new Image(),
        isLoading: true,
    }

    texture.img.onload = () => {
        texture.isLoading = false
    }
    texture.img.src = src
    textures[id] = texture

    return texture
}

export function getTexture(id: string) {
    const texture = textures[id]
    if (!texture) {
        console.warn(`Could not find texture with id: ${id}`)
        return EmptyTexture
    }

    return texture
}
