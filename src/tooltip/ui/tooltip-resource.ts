import { Resource } from "../../entities/entity"
import { HTMLComponent } from "../../ui/dom"

const template = document.createElement("template")
template.className = "flex column font-smaller color-gray"
template.innerHTML = html`
    <div class="flex">
        item_id:
        <div id="item-id" class="ml-2 color-white"></div>
    </div>
    <div class="flex">
        amount:
        <div id="amount" class="ml-2 color-white"></div>
    </div>
`

export class TooltipResourceElement extends HTMLComponent {
    constructor() {
        super(template)
    }

    connectedCallback(): void {
        super.connectedCallback()
    }

    update(resource: Resource) {
        this.setText("#item-id", resource.itemId)
        this.setText("#amount", resource.amount)
    }
}

customElements.define("tooltip-resource", TooltipResourceElement)
