import { EmptyEntity, Entity, EntityEvent, subscribe, unsubscribe } from "../entities/entity"
import "./ui/tooltip-view"
import { TooltipView } from "./ui/tooltip-view"

let tooltipElement: TooltipView = {} as TooltipView
let prevEntity: Entity | null = null

export function loadTooltip() {
    tooltipElement = document.querySelector("tooltip-view") as TooltipView
}

export function showEntityTooltip(entity: Entity | null) {
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

function handleEntityEvent(_from: Entity, _to: Entity, event: EntityEvent) {
    if (event === "destroyed") {
        showEntityTooltip(null)
        return
    }

    tooltipElement.updateContent()
}
