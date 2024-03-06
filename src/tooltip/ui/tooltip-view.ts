import { EntityType } from "../../entities/entity"
import { HTMLComponent } from "../../ui/dom"

const template = document.createElement("template")
template.className = "absolute top left p-2 m-2 bg-black-blended border-radius color-white font-smaller hide"
template.innerHTML = html``

export class TooltipView extends HTMLComponent {
    constructor() {
        super(template)
    }

    connectedCallback(): void {
        super.connectedCallback()
    }

    update(type: EntityType) {
        this.setText("", EntityType[type])
    }
}

customElements.define("tooltip-view", TooltipView)
