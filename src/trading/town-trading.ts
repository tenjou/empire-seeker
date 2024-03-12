import { ItemId } from "../configs/item-configs"
import { Town, getItemPrice, getSelectedTown } from "../entities/town"
import { emit } from "../events"
import { addFactionGold, removeFactionGold } from "../factions/factions"
import { Hero } from "../hero/hero"
import { addInventoryItem, removeInventoryItem } from "../inventory"
import { updateInventoryUI } from "../ui/ui"

export function buyFromTown(town: Town, hero: Hero, itemId: ItemId) {
    const price = getItemPrice(town, itemId)
    const amountBought = removeInventoryItem(town.inventory, itemId, 1)
    const totalCost = price * amountBought

    addFactionGold(town.factionId, totalCost)

    addInventoryItem(hero.inventory, itemId, amountBought)
    removeFactionGold(hero.factionId, totalCost)

    updateTradingUI(town)
    updateInventoryUI(hero)
}

export function sellToTown(town: Town, hero: Hero, itemId: ItemId) {
    const price = getItemPrice(town, itemId)
    const amountSold = removeInventoryItem(hero.inventory, itemId, 1)
    const totalCost = price * amountSold

    addFactionGold(hero.factionId, totalCost)

    addInventoryItem(town.inventory, itemId, amountSold)
    removeFactionGold(town.factionId, totalCost)

    updateTradingUI(town)
    updateInventoryUI(hero)
}

export function updateTradingUI(town: Town) {
    if (town === getSelectedTown()) {
        emit("town-inventory")
    }
}
