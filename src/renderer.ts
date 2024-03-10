import { Texture, getTexture } from "./assets/texture"
import { EntityType } from "./entities/entity"
import { Hero } from "./hero/hero"
import { GridSize, MapSize } from "./map"
import { getState } from "./state"
import { App } from "./types"

export interface Sprite {
    texture: Texture
    x: number
    y: number
    entity: Hero
}

const sprites: Sprite[] = []

export function render(app: App) {
    const { data, time } = getState()

    const startX = Math.floor(app.camera.x / GridSize)
    const startY = Math.floor(app.camera.y / GridSize)
    const endX = Math.floor((app.camera.x + app.camera.width) / GridSize)
    const endY = Math.floor((app.camera.y + app.camera.height) / GridSize)

    const treeTexture = getTexture("tree")
    const townTexture = getTexture("town")

    for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
            const index = (x + y * MapSize) * 2
            const entityId = data[index]
            if (!entityId) {
                continue
            }

            const entityType = data[index]
            const posX = x * GridSize
            const posY = y * GridSize

            if (entityType === EntityType.Resource) {
                app.ctx.drawImage(treeTexture.img, posX, posY)
            } else {
                app.ctx.drawImage(townTexture.img, posX, posY)
            }
        }
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

        app.ctx.drawImage(sprite.texture.img, sprite.x, sprite.y)
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
