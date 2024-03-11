import { openPopup } from "../popup"
import { HTMLComponent } from "./dom"

const template = document.createElement("template")
template.className = "popup color-gray"
template.innerHTML = html`
    <div class="font-small bold">Settlement</div>
    <div class="mb-1 pb-1 border-bottom"></div>
    <button id="trading" class="button button-white">Trading</div>
`

export class SettlementPopup extends HTMLComponent {
    constructor() {
        super(template)
    }

    connectedCallback(): void {
        super.connectedCallback()

        this.getElement("#trading").onclick = () => {
            openPopup("trading-popup")
        }
    }
}

customElements.define("settlement-popup", SettlementPopup)
