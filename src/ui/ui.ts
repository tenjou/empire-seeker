import { Entity } from "../entities/entity"
import { FactionId } from "../factions/factions"
import { Hero } from "../hero/hero"
import { getSelectedHero } from "../hero/hero-controller"
import { getHoverEntity } from "../input"
import { loadPopups } from "../popup"
import { loadTooltip, updateTooltipContent } from "../tooltip/tooltip"
import { ActionView } from "./action-view"
import { InfoView } from "./info-view"
import { InventoryView } from "./inventory-view"

let inventoryView: InventoryView
let actionView: ActionView
let infoView: InfoView

export function loadUI() {
    inventoryView = new InventoryView()
    actionView = new ActionView()
    infoView = new InfoView()

    const parent = document.getElementById("ui")!
    parent.appendChild(inventoryView)
    parent.appendChild(actionView)
    parent.appendChild(infoView)

    loadTooltip()
    loadPopups()
}

export function updateHover(entity: Entity) {
    if (getHoverEntity() === entity) {
        updateTooltipContent()
    }
}

export function updateInventoryUI(hero: Hero) {
    if (getSelectedHero() === hero) {
        inventoryView.update()
    }
}

export function updateActionUI() {
    actionView.update()
}

export function updateFactionUI(factionId: FactionId) {
    if (factionId) {
        return
    }

    infoView.updateFaction()
}
