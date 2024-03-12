import { getSelectedTown } from "../../entities/town"
import { getSelectedHero } from "../../hero/hero-controller"
import { HTMLComponent } from "../../ui/dom"
import "./trading-buy"
import { TradingBuyElement } from "./trading-buy"

const template = document.createElement("template")
template.className = "popup color-gray"
template.innerHTML = html`
    <div class="mb-1 font-small bold">Trading</div>
    <div class="mb-2 pb-1 border-bottom"></div>
    <div class="category">Buy</div>
    <div id="buy-items" class="flex column"></div>
`

export class TradingPopup extends HTMLComponent {
    constructor() {
        super(template)
    }

    connectedCallback(): void {
        super.connectedCallback()

        this.subscribe("town-inventory", () => this.update())
        this.update()
    }

    update() {
        const town = getSelectedTown()!
        const hero = getSelectedHero()

        console.log("updated")

        const townItems = town.inventory.items
        const heroItems = hero.inventory.items

        const buyContainer = this.getElement("#buy-items")

        this.syncElementEntries("trading-buy", townItems.length, buyContainer)

        for (let n = 0; n < townItems.length; n += 1) {
            const item = townItems[n]
            ;(buyContainer.children[n] as TradingBuyElement).update(item)
        }
    }
}

customElements.define("trading-popup", TradingPopup)
