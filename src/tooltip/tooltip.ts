import "./ui/tooltip-view"
import { TooltipView } from "./ui/tooltip-view"

let tooltipElement: TooltipView = {} as TooltipView

export function loadTooltip() {
    tooltipElement = document.querySelector("tooltip-view") as TooltipView
}

export function updateEntityTooltip(gridX: number, gridY: number) {
    // hoverEntity = getEntityAt(gridX, gridY)
    // updateEntityTooltip(hoverEntity)
    // document.body.style.cursor = hoverEntity ? "pointer" : "auto"
}

export function showEntityTooltip(entity: EntityOld | null) {
    if (prevEntity === entity) {
        return
    }

    if (prevEntity) {
        unsubscribe(prevEntity, EmptyEntity)
    }

    prevEntity = entity

    if (!entity) {
        tooltipElement.classList.add("hide")
        return
    }

    subscribe(entity, EmptyEntity, handleEntityEvent)
    tooltipElement.update(entity)
    tooltipElement.classList.remove("hide")
}

function handleEntityEvent(_from: EntityOld, _to: EntityOld, event: EntityEvent) {
    if (event === "destroyed") {
        showEntityTooltip(null)
        return
    }

    tooltipElement.updateContent()
}
