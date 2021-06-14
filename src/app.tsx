import {Logo} from './logo'
import {useEffect, useState} from "preact/hooks";
import {HowToPlay} from "./components/howToPlay_modal";

import {caves} from "./components/Caves";
import {pickNumbersAtRandomExcept} from "./components/randomNumbers";

enum gamePlay { on, won, lost}


const startMessage = () => (<p>Welcome to the game of wumpus!</p>)

const initialArrowCount = 5;
const initialBatLocations = pickNumbersAtRandomExcept([], 2)
const initialPitLocations = pickNumbersAtRandomExcept([...initialBatLocations], 2)
const initialWumpusLocation = pickNumbersAtRandomExcept([...initialBatLocations, ...initialPitLocations], 1)
const initialPlayerLocation = pickNumbersAtRandomExcept([...initialBatLocations, ...initialPitLocations, ...initialWumpusLocation], 1)[0]

const PitWarning = 'You feel a cold wind blowing from a nearby cavern.';
const BatWarning = 'You smell something terrible nearby.';
const WumpusWarning = 'You hear a rustling.'
const FellInPit = 'YYYIIIIEEEE . . . FELL IN PIT'
const BatSnatch = 'ZAP--SUPER BAT SNATCH! ELSEWHEREVILLE FOR YOU!';
const BumpedWumpus = '...OOPS! BUMPED A WUMPUS!'
const WumpusGotYou = 'TSK TSK TSK- WUMPUS GOT YOU!'
const AskForNextMove = 'What would you like to do next?'
const ButtonLabelMoveTo = "Move to"
const ButtonLabelShoot = "Shoot Arrow"
const ButtonLabelReset = "Start Over"

const isHazardPresent = (hazardLocation: number[], playerMovingIn: number) => hazardLocation.includes(playerMovingIn)
const selectNextRoomRandomely = (playerLocation: number, tunnels: number[]) => {
    const moveToOptions = [...tunnels, playerLocation]
    return moveToOptions[Math.floor(Math.random() * moveToOptions.length)]
}

export function App() {
    //  const initialBatLocations = pickNumbersAtRandomExcept([],2)
    const [gamePlaying, setGamePlaying] = useState(gamePlay.on);
    const [arrowCount, setArrowCount] = useState(initialArrowCount);
    const [batLocations, setBatLocations] = useState([...initialBatLocations])
    const [pitLocations, setPitLocations] = useState([...initialPitLocations])
    const [playerLocation, setPlayerLocation] = useState(initialPlayerLocation)
    const [wumpusLocation, setWumpusLocation] = useState(initialWumpusLocation)
    const [Message, setMessage] = useState([startMessage]);

    const startOverHandler = () => {
        setMessage([startMessage])
        setPitLocations(pickNumbersAtRandomExcept([], 2))
        setBatLocations(pickNumbersAtRandomExcept([], 2))
        setWumpusLocation(pickNumbersAtRandomExcept([], 1))
        setPlayerLocation(pickNumbersAtRandomExcept([...pitLocations, ...batLocations, ...wumpusLocation], 1)[0])
        setArrowCount(initialArrowCount)
        setGamePlaying(gamePlay.on)

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
            setWumpusLocation([selectNextRoomRandomely(playerIsMovingTo, caves[playerIsMovingTo])])
            // player is moving to room . probability of wumpus moving is 75%. Will stay 25% of the time.
        }
        if (batLocations.includes(playerIsMovingTo)) {
            const playerWasMovingto = playerIsMovingTo;
            const wasMovingTo = () => <p>Moving to {playerWasMovingto}..</p>
            const batSnatch = () => <p>{BatSnatch}</p>
            const batLocationsLocal = [...batLocations]
            batLocationsLocal[batLocations.indexOf(playerWasMovingto)] =
                pickNumbersAtRandomExcept([...wumpusLocation, ...batLocations], 1)[0]
            setBatLocations([...batLocationsLocal])
            playerIsMovingTo = pickNumbersAtRandomExcept([...batLocations, ...wumpusLocation, playerLocation], 1)[0]
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
                setGamePlaying(gamePlay.lost)
                return (<div>
                    <div>{BumpedWumpus}</div>
                    <div>{WumpusGotYou}</div>
                </div>)
            } else if (isHazardPresent(pitLocations, playerLocation)) {
                setGamePlaying(gamePlay.lost)
                return (<div>{FellInPit}</div>)
            } else if (isHazardPresent(batLocations, playerLocation)) {
                //this should not happen.so if this happens, then we have a bug somehere.
                setPlayerLocation(0)
                return (<div>{BatSnatch}</div>)
            }
            //no hazards, fell through to next code section

            return (
                <div>You are in room <span class="badge bg-success">{playerLocation}</span>, there are tunnels
                    to room&nbsp;
                    <span class="badge bg-secondary">{caves[playerLocation][0]}</span>,&nbsp;
                    <span class="badge bg-secondary">{caves[playerLocation][1]}</span> and&nbsp;
                    <span class="badge bg-secondary">{caves[playerLocation][2]}</span>.
                    {batLocations.map((bat) => {
                        if (caves[playerLocation].includes(bat)) return (<p>{BatWarning}</p>)
                    })}
                    {pitLocations.map((pit) => {
                        if (caves[playerLocation].includes(pit)) return (<p>{PitWarning}</p>)
                    })}
                    {wumpusLocation.map((wumpus) => {
                        //if (caves[playerLocation].includes(wumpus))  return WumpusWarning
                        if (caves[playerLocation].includes(wumpus)) return (<p>{WumpusWarning}</p>)

                    })}
                    <p>{AskForNextMove}</p></div>

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
                         style="height:250px;"
                    >{Message.map((element, i) => element())}</div>
                </div>
                {
                    (gamePlaying === gamePlay.on) && caves[playerLocation].map((tunnel) => {
                        return (
                            <button class="btn btn-primary "
                                    onClick={MoveToHandler}>{ButtonLabelMoveTo} {tunnel} </button>)
                    })
                }

                {(gamePlaying === gamePlay.on) &&
                <button class="btn btn-danger ">{ButtonLabelShoot}<span class="badge bg-secondary">{arrowCount}</span>
                </button>
                }
                <button class="btn btn-secondary" onClick={startOverHandler}>{ButtonLabelReset}</button>
                <HowToPlay/>
            </div>

        </>
    )
}
