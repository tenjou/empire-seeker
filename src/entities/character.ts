import { haveInventorySpace, sellInventory } from "../inventory"
import { AiState, Character, Entity, EntityEvent, EntityType, emit, findEntity, setMoveTo, subscribe, unsubscribe } from "./entity"
import { extractResource } from "./resource"

export function transitionAiState(character: Character, newState: AiState, target: Entity | null = null) {
    if (character.state === newState && character.target === target) {
        return
    }

    character.state = newState
    character.tActionStart = 0
    character.tActionEnd = 0

    if (character.target !== target) {
        if (character.target) {
            unsubscribe(character.target, character)
        }

        character.target = target

        if (character.target) {
            subscribe(character.target, character, handleEntityEvent)
        }
    }

    if (target && newState === "move-to-target") {
        setMoveTo(character, target.x, target.y)
    }

    emit(character, "state-updated")
}

export function updateCharacterAi(character: Character, tCurr: number) {
    switch (character.state) {
        case "idle": {
            if (character.type === EntityType.Npc) {
                transitionAiState(character, "search-wood")
            }
            return
        }

        case "search-wood": {
            const forest = findEntity(EntityType.Resource, character.x, character.y, true)
            if (!forest) {
                if (character.inventorySpace > 0) {
                    transitionAiState(character, "return-town")
                } else {
                    transitionAiState(character, "idle")
                }
                return
            }

            transitionAiState(character, "move-to-target", forest)
            break
        }

        case "move-to-target": {
            if (character.tActionEnd <= tCurr) {
                character.x = character.endX
                character.y = character.endY

                if (character.target) {
                    switch (character.target.type) {
                        case EntityType.Resource:
                            transitionAiState(character, "gather-resource", character.target)
                            return

                        case EntityType.Town:
                            transitionAiState(character, "sell")
                            return
                    }
                } else {
                    transitionAiState(character, "idle")
                    return
                }
            }

            const t = (tCurr - character.tActionStart) / (character.tActionEnd - character.tActionStart)
            character.x = character.startX + (character.endX - character.startX) * t
            character.y = character.startY + (character.endY - character.startY) * t
            break
        }

        case "gather-resource": {
            if (character.tActionEnd === 0) {
                character.tActionEnd = tCurr + 2000
                return
            }

            if (character.tActionEnd <= tCurr) {
                character.tActionEnd = 0

                extractResource(character, character.target)

                if (!haveInventorySpace(character, 1)) {
                    transitionAiState(character, "return-town")
                }
            }
            break
        }

        case "return-town": {
            const nearestTown = findEntity(EntityType.Town, character.x, character.y)
            if (!nearestTown) {
                console.warn(`Could not find a town`)
                transitionAiState(character, "idle")
                return
            }

            transitionAiState(character, "move-to-target", nearestTown)
            return
        }

        case "sell": {
            sellInventory(character)
            transitionAiState(character, "search-wood")
            break
        }
    }
}

function handleEntityEvent(_from: Entity, to: Entity, event: EntityEvent) {
    switch (event) {
        case "destroyed":
            transitionAiState(to as Character, "search-wood")
            break
    }
}