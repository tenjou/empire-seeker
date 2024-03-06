import { Entity } from "../entities/entity"
import "./ui/tooltip-view"
import { TooltipView } from "./ui/tooltip-view"

let tooltipElement: TooltipView = {} as TooltipView
let prevEntityTooltip: Entity | null = null

export function loadTooltip() {
    tooltipElement = document.querySelector("tooltip-view") as TooltipView
}

export function showEntityTooltip(entity: Entity | null) {
    if (prevEntityTooltip === entity) {
        return
    }

    prevEntityTooltip = entity

    if (!entity) {
        tooltipElement.classList.add("hide")
        return
    }

    tooltipElement.update(entity.type)
    tooltipElement.classList.remove("hide")
}
