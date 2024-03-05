import { InventoryItem } from "../inventory"
import { HTMLComponent } from "./dom"

const template = document.createElement("template")
template.className = "flex color-gray"
template.innerHTML = html`
    <div id="amount" class="pr-1"></div>
    <div id="name" class="bold color-white"></div>
`

export class InventoryItemElement extends HTMLComponent {
    constructor() {
        super(template)
    }

    update(item: InventoryItem) {
        this.setText("#amount", item.amount)
        this.setText("#name", item.itemId)
    }
}

customElements.define("inventory-item", InventoryItemElement)
