import { addTree } from "./entities/resource"
import { MapSize, canPlaceEntity } from "./map"
import { getState } from "./state"
import { randomNumber } from "./utils"

export function updateResourceSpawns() {
    const { ecology } = getState()

    if (ecology.treesToSpawn <= 0) {
        return
    }

    for (let n = 0; n < ecology.treesToSpawn; n += 1) {
        retry: for (let nRetry = 0; nRetry < 10; nRetry += 1) {
            const gridX = randomNumber(0, MapSize - 1)
            const gridY = randomNumber(0, MapSize - 1)

            if (!canPlaceEntity(gridX, gridY)) {
                continue retry
            }

            addTree(gridX, gridY)
            break retry
        }
    }

    ecology.treesToSpawn = 0
}
