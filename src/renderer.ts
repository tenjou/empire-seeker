import { Texture, getTexture } from "./assets/texture"
import { EntityType } from "./entities/entity"
import { Hero } from "./hero/hero"
import { getHoverEntity } from "./input"
import { GridSize } from "./map"
import { getState } from "./state"
import { App } from "./types"

export interface Sprite {
    texture: Texture
    x: number
    y: number
    entity: Hero
}

const sprites: Sprite[] = []

const texturesMap: Record<number, Texture> = {}
const drawBuffer: Int32Array = new Int32Array(2048)
let numItems = 0

export function loadRenderer() {
    texturesMap[EntityType.Resource] = getTexture("tree")
    texturesMap[EntityType.Town] = getTexture("town")
}

export function render(app: App) {
    const { time } = getState()
    const { ctx } = app

    updateRenderer(app)

    for (let n = 0; n < numItems; n += 3) {
        const texture = texturesMap[drawBuffer[n]]
        const x = drawBuffer[n + 1]
        const y = drawBuffer[n + 2]
        ctx.drawImage(texture.img, x, y)
    }

    for (const sprite of sprites) {
        const entity = sprite.entity

        if (entity.state === "move-to-target") {
            const t = (time.curr - entity.actionStart) / (entity.actionEnd - entity.actionStart)
            if (t < 1) {
                sprite.x = (entity.gridX + (entity.targetGridX - entity.gridX) * t) * GridSize
                sprite.y = (entity.gridY + (entity.targetGridY - entity.gridY) * t) * GridSize
            }
        } else {
            sprite.x = entity.targetGridX * GridSize
            sprite.y = entity.targetGridY * GridSize
        }

        ctx.drawImage(sprite.texture.img, sprite.x, sprite.y)
    }

    const hoverEntity = getHoverEntity()
    if (hoverEntity) {
        const size = hoverEntity.type === EntityType.Town ? 2 : 1
        const startX = hoverEntity.gridX * GridSize - 2
        const startY = hoverEntity.gridY * GridSize - 2
        const endX = size * GridSize + 4
        const endY = size * GridSize + 4

        ctx.strokeStyle = "white"
        ctx.lineWidth = 2
        ctx.strokeRect(startX, startY, endX, endY)
    }
}

function updateRenderer(app: App) {
    const { resources, towns } = getState()

    numItems = 0

    const startX = Math.floor(app.camera.x / GridSize) - 1
    const startY = Math.floor(app.camera.y / GridSize) - 1
    const endX = Math.floor((app.camera.x + app.camera.width) / GridSize) + 1
    const endY = Math.floor((app.camera.y + app.camera.height) / GridSize) + 1

    for (const resource of resources) {
        if (resource.gridX < startX || resource.gridX > endX || resource.gridY < startY || resource.gridY > endY) {
            continue
        }

        drawBuffer[numItems] = resource.type
        drawBuffer[numItems + 1] = resource.gridX * GridSize
        drawBuffer[numItems + 2] = resource.gridY * GridSize
        numItems += 3
    }

    for (const town of towns) {
        if (town.gridX < startX || town.gridX > endX || town.gridY < startY || town.gridY > endY) {
            continue
        }

        drawBuffer[numItems] = town.type
        drawBuffer[numItems + 1] = town.gridX * GridSize
        drawBuffer[numItems + 2] = town.gridY * GridSize
        numItems += 3
    }
}

export function addSprite(hero: Hero) {
    sprites.push({
        texture: getTexture(`faction-${hero.factionId}`),
        x: hero.gridX * GridSize,
        y: hero.gridY * GridSize,
        entity: hero,
    })
}

export function removeSprite(hero: Hero) {
    const index = sprites.findIndex((entry) => entry.entity === hero)
    if (index === -1) {
        console.warn(`Failed to find entity's sprite:`, hero)
        return
    }

    sprites[index] = sprites[sprites.length - 1]
    sprites.pop()
}
