import { getEntityTypeAt, EntityType, Entity, getEntityAt } from "./entities/entity"
import { getResourceAt } from "./entities/resource"
import { getTownAt } from "./entities/town"
import { MapWidth, MapHeight, GridSize } from "./map"
import { updateEntityTooltip } from "./tooltip/tooltip"
import { App } from "./types"
import { getElement } from "./ui/dom"
import { InfoView } from "./ui/info-view"

let hoverEntity: Entity | null
let isHolding = false
let isDragging = false
let draggingAccumulator = 0

export function loadInput(app: App) {
    const camera = app.camera

    window.addEventListener("mousedown", (event) => {
        if (event.button === 0) {
            isHolding = true
        }
    })

    window.addEventListener("mouseup", (event) => {
        if (event.button === 0) {
            isHolding = false
        }

        if (isDragging && event.button === 0) {
            isDragging = false
            draggingAccumulator = 0
            return
        }

        // const { player } = getState()

        // const posX = event.clientX + app.camera.x
        // const posY = event.clientY + app.camera.y
        // const gridX = (posX / GridSize) | 0
        // const gridY = (posY / GridSize) | 0

        // const target = getEntityAt(gridX, gridY)
        // if (target) {
        //     transitionAiState(player, "move-to-target", target)
        // } else {
        //     targetEntity.x = gridX * GridSize
        //     targetEntity.y = gridY * GridSize
        //     transitionAiState(player, "move-to-target", targetEntity, true)
        // }
    })

    window.addEventListener("mousemove", (event) => {
        if (isHolding) {
            draggingAccumulator += Math.abs(event.movementX) + Math.abs(event.movementY)
            camera.x -= event.movementX
            camera.y -= event.movementY

            if (camera.x < 0) {
                camera.x = 0
            } else if (camera.x + camera.width >= MapWidth) {
                camera.x = MapWidth - camera.width
            }

            if (camera.y < 0) {
                camera.y = 0
            } else if (camera.y + camera.height >= MapHeight) {
                camera.y = MapHeight - camera.height
            }

            if (draggingAccumulator >= 5) {
                isDragging = true
                return
            }
        }

        const posX = event.clientX + app.camera.x
        const posY = event.clientY + app.camera.y
        const gridX = (posX / GridSize) | 0
        const gridY = (posY / GridSize) | 0
        getElement<InfoView>("info-view").updateCoords(gridX, gridY)

        hoverEntity = getEntityAt(gridX, gridY)
        document.body.style.cursor = hoverEntity ? "pointer" : "auto"

        updateEntityTooltip(hoverEntity)
    })
}

export function getHoverEntity() {
    return hoverEntity
}
