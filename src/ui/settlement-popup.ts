import { HTMLComponent } from "./dom"

const template = document.createElement("template")
template.className = "popup color-gray"
template.innerHTML = html`
    <div class="font-small bold">Settlement</div>
    <div class="mb-1 pb-1 border-bottom"></div>
    <div>Leave</div>
`

export class SettlementPopup extends HTMLComponent {
    constructor() {
        super(template)
    }
}

customElements.define("settlement-popup", SettlementPopup)
