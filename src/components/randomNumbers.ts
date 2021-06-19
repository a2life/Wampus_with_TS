import {caves} from "./Caves";

const pickNumberAtRandom = (count: number) => Math.floor(Math.random() * count + 1);

export const pickNumbersAtRandomExcept = (exceptions: number[], count: number) => {
    let candidates: number[] = [];
    let localExceptions = [...exceptions]
    for (let x = 0; x < count; x++) {
        let candidate;
        do {
            candidate = pickNumberAtRandom(20);
            //console.log('numbers picked are', candidate)
        }
        while (localExceptions.includes(candidate))
        localExceptions = [...localExceptions, candidate]
        candidates.push(candidate)
    }

    return candidates;
}
export const selectNextRoomRandomely = (roomNum: number, tunnels: number[]) => { //select room including current room
    const moveToOptions = [...tunnels, roomNum]
    return moveToOptions[Math.floor(Math.random() * moveToOptions.length)]
}
export const choseRandomArrowPath = (location: number, except: number) => {
    let moveToOptions = [...caves[location]]
    moveToOptions = moveToOptions.filter(room => room !== except)
    return moveToOptions[Math.floor(Math.random() * moveToOptions.length)]
}
