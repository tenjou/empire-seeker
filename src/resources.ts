import { canPlaceEntity } from "./entities/entity"
import { addTree } from "./entities/resource"
import { getState } from "./state"
import { randomNumber } from "./utils"

export function updateResourceSpawns() {
    const { ecology } = getState()

    if (ecology.treesToSpawn > 0) {
        for (let n = 0; n < ecology.treesToSpawn; n += 1) {
            retry: for (let nRetry = 0; nRetry < 10; nRetry += 1) {
                const gridX = randomNumber(0, 40 - 1)
                const gridY = randomNumber(0, 40 - 1)

                if (!canPlaceEntity(gridX, gridY)) {
                    continue retry
                }

                addTree(gridX, gridY)
                break retry
            }
        }

        ecology.treesToSpawn = 0
    }
}
