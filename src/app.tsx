import {Logo} from './logo'
import {useEffect, useState} from "preact/hooks";
import {HowToPlay} from "./components/howToPlay_modal";

import {caves} from "./components/Caves";

const startMessage = () => (<p>Welcome to the game of wumpus!</p>)
const pickNumberAtRandom = (count: number) => Math.floor(Math.random() * count + 1);

const pickLocationsAtRandomExcept = (exceptions: number[], count: number) => {
    let candidates: number[] = [];
    let localExceptions = [...exceptions]
    for (let x = 0; x < count; x++) {
        let candidate;
        do {
            candidate = pickNumberAtRandom(20);
            console.log('numbers picked are', candidate)
        }
        while (localExceptions.includes(candidate))
        localExceptions = [...localExceptions, candidate]
        candidates.push(candidate)
    }

    return candidates;
}
const initialArrowCount = 5;
const initialBatLocations = pickLocationsAtRandomExcept([], 2)
console.log('initial bat locations', initialBatLocations)
const initialPitLocations = pickLocationsAtRandomExcept([...initialBatLocations], 2)
console.log('initial pit locations', initialPitLocations)
const initialWumpusLocation = pickLocationsAtRandomExcept([...initialBatLocations, ...initialPitLocations], 1)
console.log('initialwumpusLoation', initialWumpusLocation)
const initialPlayerLocation = pickLocationsAtRandomExcept([...initialBatLocations, ...initialPitLocations, ...initialWumpusLocation], 1)[0]
console.log('initial player location', initialPlayerLocation)

const Warning = (warningMessage: string) => (<div>{warningMessage}</div>)
const PitWarning = Warning('You feel a cold wind blowing from a nearby cavern.');
const BatWarning = Warning('You smell something terrible nearby.');
const WumpusWarning = Warning('You hear a rustling.')
const FellInPit = Warning('YYYIIIIEEEE . . . FELL IN PIT')
const BatSnatch = Warning('ZAP--SUPER BAT SNATCH! ELSEWHEREVILLE FOR YOU!');
const BumpedWumpus = Warning('...OOPS! BUMPED A WUMPUS!')
const WumpusGotYou = Warning('TSK TSK TSK- WUMPUS GOT YOU!')

const isHazardPresent = (hazardLocation: number[], playerMovingIn: number) => hazardLocation.includes(playerMovingIn)
const WumpusMoveTo = (playerLocation: number, tunnels: number[]) => {
    const moveToOptions = [...tunnels, playerLocation]
    return moveToOptions[Math.floor(Math.random() * moveToOptions.length)]
}

export function App() {
    //  const initialBatLocations = pickLocationsAtRandomExcept([],2)
    const [gamePlaying, setGamePlaying] = useState(true);
    const [arrowCount, setArrowCount] = useState(initialArrowCount);
    const [batLocations, setBatLocations] = useState([...initialBatLocations])
    const [pitLocations, setPitLocations] = useState([...initialPitLocations])
    const [playerLocation, setPlayerLocation] = useState(initialPlayerLocation)
    const [wumpusLocation, setWumpusLocation] = useState(initialWumpusLocation)

    const [Message, setMessage] = useState([startMessage]);

    const startOverHandler = () => {
        setMessage([startMessage])
        setPitLocations(pickLocationsAtRandomExcept([], 2))
        setBatLocations(pickLocationsAtRandomExcept([], 2))
        setWumpusLocation(pickLocationsAtRandomExcept([], 1))
        setPlayerLocation(pickLocationsAtRandomExcept([...pitLocations, ...batLocations, ...wumpusLocation], 1)[0])
        setArrowCount(initialArrowCount)
        setGamePlaying(true)

    }
    const MoveToHandler = (e: Event) => {
        const buttonLabel = (e.target as HTMLButtonElement).innerText;
        const moveToTarget = buttonLabel.split(' ')[2]
        //  console.log(buttonLabel.split(' ')[2])
        let playerIsMovingTo = parseInt(moveToTarget)
        const message = () => <p>Moving to {playerIsMovingTo}...</p>
        setMessage([...Message, message])
        //irritate wumpus if it is in the room
        // and set a new location for Wumpus.
        if (playerIsMovingTo === wumpusLocation[0]) {
            setWumpusLocation([WumpusMoveTo(playerIsMovingTo, caves[playerIsMovingTo])])
            // player is moving to room and tunnels that cave number has
        }
        if (batLocations.includes(playerIsMovingTo)) {
            const playerWasMovingto = playerIsMovingTo;
            const wasMovingTo = () => <p>Moving to {playerWasMovingto}</p>
            const batSnatch = () => <p>ZAP--SUPER BAT SNATCH! ELSEWHEREVILLE FOR YOU!'</p>
            const batLocationsLocal = [...batLocations]
            batLocationsLocal[batLocations.indexOf(playerWasMovingto)] = pickLocationsAtRandomExcept([...wumpusLocation, ...batLocations], 1)[0]
            setBatLocations([...batLocationsLocal])
            playerIsMovingTo = pickLocationsAtRandomExcept([...batLocations, ...wumpusLocation, playerLocation], 1)[0]
            setMessage([...Message, wasMovingTo, batSnatch, message])

        }

        return playerMoveTo(playerIsMovingTo)

    }
    const playerMoveTo = (cave: number) => {
        setPlayerLocation(cave)
    }


    useEffect(() => {
        let NewMessage = () => {
            if (isHazardPresent(wumpusLocation, playerLocation)) {
                setGamePlaying(false)
                return BumpedWumpus
            } else if (isHazardPresent(pitLocations, playerLocation)) {
                setGamePlaying(false)
                return FellInPit
            } else if (isHazardPresent(batLocations, playerLocation)) {
                //this should not happen. this hazard is taken care in moveHandler. setPlaylocation  creates infinate loop. why?
                setPlayerLocation(0)
                return BatSnatch
            }


            return (
                <div>You are in room <span class="badge bg-success">{playerLocation}</span>, there are tunnels
                    to room&nbsp;
                    <span class="badge bg-secondary">{caves[playerLocation][0]}</span>,&nbsp;
                    <span class="badge bg-secondary">{caves[playerLocation][1]}</span> and&nbsp;
                    <span class="badge bg-secondary">{caves[playerLocation][2]}</span>.
                    {batLocations.map((bat) => {
                        if (caves[playerLocation].includes(bat)) return BatWarning
                    })}
                    {pitLocations.map((pit) => {
                        if (caves[playerLocation].includes(pit)) return PitWarning
                    })}
                    {wumpusLocation.map((wumpus) => {
                        if (caves[playerLocation].includes(wumpus)) return WumpusWarning
                    })}
                    <p> What would you like to do next?</p></div>

            )
        }

        setMessage([...Message, NewMessage]);

    }, [playerLocation])
    useEffect(() => {
        const text = document.getElementById('history') as HTMLTextAreaElement
        text.scrollTop = text.scrollHeight
    }, [Message])

    return (
        <>
            <Logo/>


            <div class="container">
                <h1 class="display-2">Hunt the Wumpus!</h1>
                <div class="card  mb-4">
                    <div id="history" class="overflow-auto m-4 h4"

                         placeholder="This is where the history goes"
                         style="height:250px;"


                    >{Message.map((element, i) => element())}</div>
                </div>
                {
                    gamePlaying && caves[playerLocation].map((tunnel) => {
                        return (
                            <button class="btn btn-primary " onClick={MoveToHandler}>Move to {tunnel} </button>)
                    })
                }

                {gamePlaying &&

                <button class="btn btn-danger ">Shoot Arrow <span class="badge bg-secondary">{arrowCount}</span>
                </button>
                }
                <button class="btn btn-secondary" onClick={startOverHandler}>Start Over</button>
                <HowToPlay/>
            </div>

        </>
    )
}
