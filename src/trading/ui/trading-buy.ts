import { getItemPrice, getSelectedTown } from "../../entities/town"
import { canFactionBuy } from "../../factions/factions"
import { getSelectedHero } from "../../hero/hero-controller"
import { InventoryItem, haveInventorySpace } from "../../inventory"
import { HTMLComponent } from "../../ui/dom"
import { buyFromTown } from "../town-trading"

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

export class TradingBuyElement extends HTMLComponent {
    constructor() {
        super(template)
    }

    update(item: InventoryItem) {
        const town = getSelectedTown()!
        const hero = getSelectedHero()

        const price = getItemPrice(town, item.itemId)
        const canAfford = canFactionBuy(hero.factionId, price)
        const canBuy = haveInventorySpace(hero.inventory, 1) && canAfford

        this.setText("#item-id", item.itemId)
        this.setText("#amount", item.amount)
        this.setText("#gold", price)

        const button = this.getElement("#action")
        button.innerText = "Buy"
        button.onclick = () => {
            buyFromTown(town, hero, item.itemId)
        }

        this.toggleClass("#gold", "color-red", !canAfford)
        this.toggleClass("#action", "disabled", !canBuy)
    }
}

customElements.define("trading-buy", TradingBuyElement)
