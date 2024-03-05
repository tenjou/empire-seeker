import { rand } from "./math/rand"

export const randomNumber = (min: number, max: number) => {
    return (rand() * (max - min + 1) + min) << 0
}

export const randomItem = <T>(array: T[] | readonly T[]) => {
    return array[randomNumber(0, array.length - 1)]
}

export const randomIndex = <T>(array: T[]) => {
    return randomNumber(0, array.length - 1)
}

export const popRandomIndex = <T>(array: T[]) => {
    const randomIndex = randomNumber(0, array.length - 1)
    const item = array[randomIndex]
    array[randomIndex] = array[array.length - 1]
    array.pop()

    return item
}

export const shuffle = <T>(array: T[]) => {
    for (let n = array.length - 1; n > 0; n -= 1) {
        const m = Math.floor(rand() * (n + 1))
        const temp = array[n]
        array[n] = array[m]
        array[m] = temp
    }

    return array
}

export const roll = (chance: number, dice = 100) => {
    return randomNumber(1, dice) <= chance
}

export const clamp = (value: number, min: number, max: number) => {
    if (value > max) {
        return max
    } else if (value < min) {
        return min
    }

    return value
}

export const assert = (expr: boolean, error: string) => {
    if (expr) {
        throw new Error(error)
    }
}

export const removeAtIndex = <T>(array: T[], index: number) => {
    array[index] = array[array.length - 1]
    array.pop()
}

export const findAndRemoveIndex = (array: number[], indexToRemove: number) => {
    const indexFound = array.indexOf(indexToRemove)
    if (indexFound === -1) {
        console.error(`Failed to removeIndex for array: ${JSON.stringify(array)}, with index: ${indexToRemove}`)
        return
    }

    array[indexFound] = array[array.length - 1]
    array.pop()
}

export const getTimeFromStr = (timeInSeconds: number) => {
    const seconds = timeInSeconds % 60
    const minutes = (timeInSeconds / 60) | 0
    const hours = (timeInSeconds / 3600) | 0

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`
    }

    return `${seconds}s`
}
