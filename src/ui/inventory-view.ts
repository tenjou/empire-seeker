import { HTMLComponent } from "./dom"
import "./inventory-item"

const template = document.createElement("template")
template.className = "absolute left bottom p-2 m-2 width-160px bg-black-blended color-white border-radius"
template.innerHTML = html`
    <div class="font-small bold">Inventory</div>
    <div class="mb-1 pb-1 border-bottom"></div>
    <div id="items" class="height-60px">
        <inventory-item></inventory-item>
    </div>
    <div id="space"></div>
`

export class InventoryView extends HTMLComponent {
    constructor() {
        super(template)
    }

    connectedCallback(): void {
        super.connectedCallback()

        // const { player } = getState()

        // subscribe(player, EmptyEntity, () => this.update())

        this.update()
    }

    update() {
        // const { player } = getState()
        // const inventory = player.inventory
        // const container = this.getElement("#items")
        // this.syncElementEntries("inventory-item", inventory.items.length, container)
        // for (let n = 0; n < inventory.items.length; n += 1) {
        //     const item = inventory.items[n]
        //     const element = container.children[n] as InventoryItemElement
        //     element.update(item)
        // }
        // this.setText("#space", `${inventory.spaceUsed} / ${inventory.spaceMax}`)
    }
}

customElements.define("inventory-view", InventoryView)
