import { getSelectedTown } from "../../entities/town"
import { getSelectedHero } from "../../hero/hero-controller"
import { HTMLComponent } from "../../ui/dom"
import "./trading-buy"
import { TradingBuyElement } from "./trading-buy"
import "./trading-sell"
import { TradingSellElement } from "./trading-sell"

const template = document.createElement("template")
template.className = "popup color-gray"
template.innerHTML = html`
    <div class="mb-1 font-small bold">Trading</div>
    <div class="mb-2 pb-1 border-bottom"></div>

    <div class="category">Buy</div>
    <div id="buy-items" class="flex column my-1"></div>
    <div id="no-buy" class="flex align-center justify-center p-2 color-gray">No items</div>

    <div class="category">Sell</div>
    <div id="sell-items" class="flex column my-1"></div>
    <div id="no-sell" class="flex align-center justify-center p-2 color-gray">No items</div>
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

        const townItems = town.inventory.items
        const heroItems = hero.inventory.items

        const buyContainer = this.getElement("#buy-items")
        this.syncElementEntries("trading-buy", townItems.length, buyContainer)
        for (let n = 0; n < townItems.length; n += 1) {
            const item = townItems[n]
            ;(buyContainer.children[n] as TradingBuyElement).update(town, hero, item)
        }

        const sellContainer = this.getElement("#sell-items")
        this.syncElementEntries("trading-sell", heroItems.length, sellContainer)
        for (let n = 0; n < heroItems.length; n += 1) {
            const item = heroItems[n]
            ;(sellContainer.children[n] as TradingSellElement).update(town, hero, item)
        }

        this.toggleClass("#no-buy", "hide", !!townItems.length)
        this.toggleClass("#no-sell", "hide", !!heroItems.length)
    }
}

customElements.define("trading-popup", TradingPopup)
