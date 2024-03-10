import { Hero, transitionStateTarget } from "./hero"

let selectedHero: Hero

export function moveSelectedHeroTo(gridX: number, gridY: number) {
    transitionStateTarget(selectedHero, gridX, gridY)
}

export function selectHero(hero: Hero) {
    selectedHero = hero
}

export function getSelectedHero() {
    return selectedHero
}
