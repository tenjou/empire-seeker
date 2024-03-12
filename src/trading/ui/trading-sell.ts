import { Town, getItemPrice } from "../../entities/town"
import { canFactionBuy } from "../../factions/factions"
import { Hero } from "../../hero/hero"
import { InventoryItem, haveInventorySpace } from "../../inventory"
import { HTMLComponent } from "../../ui/dom"
import { sellToTown } from "../town-trading"

const template = document.createElement("template")
template.className = "flex px-1 my-1 align-center color-white"
template.innerHTML = html`
    <div id="item-id" class="flex-1 bold"></div>
    <div id="amount" class="flex-1"></div>
    <div class="flex flex-1">
        <div id="gold" class="mr-1"></div>
        <img src="/icons/gold.png" />
    </div>
    <button id="action" class="button button-white">Buy</button>
`

export class TradingSellElement extends HTMLComponent {
    constructor() {
        super(template)
    }

    update(town: Town, hero: Hero, item: InventoryItem) {
        const price = getItemPrice(town, item.itemId)
        const canAfford = canFactionBuy(town.factionId, price)
        const canBuy = haveInventorySpace(town.inventory, 1) && canAfford

        this.setText("#item-id", item.itemId)
        this.setText("#amount", item.amount)
        this.setText("#gold", price)

        const button = this.getElement("#action")
        button.innerText = "Sell"
        button.onclick = () => {
            sellToTown(town, hero, item.itemId)
        }

        this.toggleClass("#action", "disabled", !canBuy)
    }
}

customElements.define("trading-sell", TradingSellElement)
