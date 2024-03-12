export type ItemId = "wood" | "grain"

export interface ItemConfig {
    itemId: ItemId
    cost: number
}

export const ItemConfigs: Record<ItemId, ItemConfig> = {
    wood: {
        itemId: "wood",
        cost: 60,
    },
    grain: {
        itemId: "grain",
        cost: 15,
    },
}
