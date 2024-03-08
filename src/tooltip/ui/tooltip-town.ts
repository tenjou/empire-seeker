import { Town } from "../../entities/town"
import { FactionType } from "../../factions/factions"
import { HTMLComponent } from "../../ui/dom"

const template = document.createElement("template")
template.className = "flex column font-smaller color-gray"
template.innerHTML = html`
    <div class="flex">
        faction:
        <div id="faction" class="ml-2 color-white"></div>
    </div>
`

export class TooltipTownElement extends HTMLComponent {
    constructor() {
        super(template)
    }

    update(town: Town) {
        this.setText("#faction", FactionType[town.factionType])
    }
}

customElements.define("tooltip-town", TooltipTownElement)
