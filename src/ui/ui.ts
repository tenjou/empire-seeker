import { loadPopups } from "../popup"
import { loadTooltip } from "../tooltip/tooltip"
import { ActionView } from "./action-view"
import { getElement } from "./dom"
import { InfoView } from "./info-view"
import { InventoryView } from "./inventory-view"

let inventoryView: InventoryView
let actionView: ActionView

export function loadUI() {
    inventoryView = new InventoryView()
    actionView = new ActionView()

    const parent = document.getElementById("ui")!
    parent.appendChild(inventoryView)
    parent.appendChild(actionView)

    loadTooltip()
    loadPopups()

    const infoView = getElement<InfoView>("info-view")
    infoView.updateFaction()
}

export function updateInventoryUI() {
    inventoryView.update()
}

export function updateActionUI() {
    actionView.update()
}
