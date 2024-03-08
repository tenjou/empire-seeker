import { Village } from "../../entities/village"
import { FactionType } from "../../factions/factions"
import { HTMLComponent } from "../../ui/dom"

const template = document.createElement("template")
template.className = "flex column font-smaller color-gray"
template.innerHTML = html`
    <div class="flex">
        faction:
        <div id="faction" class="ml-2 color-white"></div>
    </div>

    <div class="flex">
        tier:
        <div id="tier" class="ml-2 color-white"></div>
    </div>

    <div class="flex">
        population:
        <div id="population" class="ml-2 color-white"></div>
    </div>

    <div class="flex">
        stockpile:
        <div id="stockpile" class="ml-2 color-white"></div>
    </div>
`

export class TooltipVillageElement extends HTMLComponent {
    constructor() {
        super(template)
    }

    update(village: Village) {
        this.setText("#faction", FactionType[village.factionType])
        this.setText("#tier", village.tier)
        this.setText("#population", village.population)
        this.setText("#stockpile", village.inventory.spaceUsed)
    }
}

customElements.define("tooltip-village", TooltipVillageElement)
