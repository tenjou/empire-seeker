import { ItemId } from "../configs/item-configs"
import { Town, getItemPrice, getSelectedTown } from "../entities/town"
import { emit } from "../events"
import { removeFactionGold } from "../factions/factions"
import { Hero } from "../hero/hero"
import { addInventoryItem, removeInventoryItem } from "../inventory"
import { updateInventoryUI } from "../ui/ui"

export function buyFromTown(town: Town, hero: Hero, itemId: ItemId) {
    const price = getItemPrice(town, itemId)
    const amountBought = removeInventoryItem(town.inventory, itemId, 1)
    const totalCost = price * amountBought

    addInventoryItem(hero.inventory, itemId, amountBought)
    removeFactionGold(hero.factionId, totalCost)

    updateTradingUI(town)
    updateInventoryUI(hero)
}

export function updateTradingUI(town: Town) {
    if (town === getSelectedTown()) {
        emit("town-inventory")
    }
}
