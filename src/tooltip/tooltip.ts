import { Entity } from "../entities/entity"
import "./ui/tooltip-view"
import { TooltipView } from "./ui/tooltip-view"

let tooltipElement: TooltipView = {} as TooltipView
let prevEntity: Entity | null = null

export function loadTooltip() {
    tooltipElement = document.querySelector("tooltip-view") as TooltipView
}

export function updateEntityTooltip(entity: Entity | null) {
    if (prevEntity === entity) {
        return
    }

    prevEntity = entity

    if (!entity) {
        tooltipElement.classList.add("hide")
        return
    }

    tooltipElement.update(entity)
    tooltipElement.classList.remove("hide")
}

// function handleEntityEvent(_from: EntityOld, _to: EntityOld, event: EntityEvent) {
//     if (event === "destroyed") {
//         showEntityTooltip(null)
//         return
//     }

//     tooltipElement.updateContent()
// }
