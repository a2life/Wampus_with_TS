import {Logo} from './logo'
import {useEffect, useState} from "preact/hooks";
import {HowToPlay} from "./components/howToPlay_modal";

import {caves} from "./components/Caves";
import {pickNumbersAtRandomExcept} from "./components/randomNumbers";
// todo multiroom shooting. currently only shoot to the first room
// todo implement random shooting.
// todo how to implement 'reject too crooked arrow path. ie.,  if k(2)=(k4), reject teh selection

enum gamePlay { on, won, lost}

enum action {move, shoot}

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
const GotTheWumpus = 'AHA! YOU GOT THE WUMPUS!'
const WumpusGotYou = 'TSK TSK TSK- WUMPUS GOT YOU!'
const AskForNextMove = 'Move to Another room or shoot an arrow?'
const ButtonLabelMoveTo = "Move to"
const ButtonLabelShoot = "Shoot Arrow"
const NotThatCrooked = "ARROWS AREN'T THAT CROOKED - TRY ANOTHER ROOM"
const ButtonLabelReset = "Start Over"
const GameWon = "HEE HEE HEE - THE WUMPUS'LL GETCHA NEXT TIME!!"
const GameLost = "HA HA HA - YOU LOSE!"


const isHazardPresent = (hazardLocation: number[], playerMovingIn: number) => hazardLocation.includes(playerMovingIn)
const selectNextRoomRandomely = (playerLocation: number, tunnels: number[]) => {
    const moveToOptions = [...tunnels, playerLocation]
    return moveToOptions[Math.floor(Math.random() * moveToOptions.length)]
}

export function App() {
    //  const initialBatLocations = pickNumbersAtRandomExcept([],2)
    const [gamePlaying, setGamePlaying] = useState(gamePlay.on);
    const [actionMode, setActionMode] = useState(action.move)
    const [arrowCount, setArrowCount] = useState(initialArrowCount);
    const [batLocations, setBatLocations] = useState([...initialBatLocations])
    const [pitLocations, setPitLocations] = useState([...initialPitLocations])
    const [playerLocation, setPlayerLocation] = useState(initialPlayerLocation)
    const [wumpusLocation, setWumpusLocation] = useState(initialWumpusLocation)
    const [Message, setMessage] = useState([startMessage]);
    const [arrowRange, setArrowRange] = useState(1);
    const addMessageLine = (message: string) => setMessage([...Message, () => <p>{message}</p>])
    const startOverHandler = () => {
        setMessage([startMessage])
        // if playerLoc == playerLoation, then useEffect-playerlocation will not trigger, so....
        const playerLoc = pickNumbersAtRandomExcept([playerLocation], 1)[0] //define playerLoc and wumpusLoc beforehand
               const wumpusLoc = pickNumbersAtRandomExcept([playerLoc], 1) //then use them for each set, as useState is asynchronous
        setPlayerLocation(playerLoc)
        setWumpusLocation(wumpusLoc)
        setPitLocations(pickNumbersAtRandomExcept([playerLoc, ...wumpusLoc], 2))
        setBatLocations(pickNumbersAtRandomExcept([playerLoc, ...wumpusLoc], 2))
        setArrowCount(initialArrowCount)
        setGamePlaying(gamePlay.on)

    }
    const MoveToHandler = (e: Event) => {
        const buttonLabel = (e.target as HTMLButtonElement).innerText;
        const moveToTarget = buttonLabel.split(' ')[2]
        let playerIsMovingTo = parseInt(moveToTarget)
        addMessageLine(`Moving to ${playerIsMovingTo}`)
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
            const isMovingTo = () => <p>taken to room {playerIsMovingTo}...</p>
            setMessage([...Message, wasMovingTo, batSnatch, isMovingTo])

        }

        return playerMoveTo(playerIsMovingTo)

    }
    const playerMoveTo = (cave: number) => {
        setPlayerLocation(cave)
    }

    const shootHandler = () => {
        const nodeList=document.querySelectorAll('.target-room')
        const moveToTarget=(nodeList[0] as HTMLInputElement).value
        //  console.log(buttonLabel.split(' ')[2])
        let ArrowIsGoingTo = parseInt(moveToTarget)
        const narrative = () => <p>Arrow went into {ArrowIsGoingTo}...</p>

        if (ArrowIsGoingTo === wumpusLocation[0]) {
            setMessage([...Message, narrative, () => <p>{GotTheWumpus}</p>])
            setGamePlaying(gamePlay.won);
        } else setMessage([...Message, narrative, () => <p>Missed</p>])
        setArrowCount(arrowCount - 1)

    }
    const adjustArrowRange = (e: Event) => {
        setArrowRange(parseInt((e.target as HTMLInputElement).value))
    }
    const targetSetter = (e: Event) => {
        const target = (e.target as HTMLSelectElement).value
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
    useEffect(() => {
        if (gamePlaying === gamePlay.won) {
            addMessageLine(GameWon)
        }
        if (gamePlaying === gamePlay.lost) {
            addMessageLine(GameLost)
        }

    }, [gamePlaying])


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
                {(gamePlaying === gamePlay.on) && (
                    <div>
                        <div class="row row-cols-auto mb-2">
                            {
                                caves[playerLocation].map((tunnel) => {
                                    return (
                                        <button class="btn btn-outline-success col"
                                                onClick={MoveToHandler}>{ButtonLabelMoveTo} {tunnel} </button>


                                    )

                                })
                            }
                        </div>
                        <div class="row row-cols-auto mb-4">

                            <button class="btn btn-outline-danger col"
                                    onClick={shootHandler}>{ButtonLabelShoot}
                                <span
                                    class="badge bg-secondary">{arrowCount}</span>
                            </button>


                            {Array(arrowRange).fill(0).map((j, index1) => (
                                <>
                                    <div class="col mt-2" style="font-size:1em"><i class="fas fa-arrow-right"></i></div>
                                    <select class="target-room form-select-sm col-md-1" aria-label="select arrow direction"
                                            onChange={targetSetter}>
                                        <option selected value="-1">Rm#</option>
                                        <option value="0">Random</option>


                                        {(index1 === 0) && caves[playerLocation].map((tunnel) => {
                                            return <option value={tunnel}>{tunnel}</option>
                                        })}

                                        {(index1 != 0) &&
                                        Array(20).fill(0).map((k, index) => {
                                            return <option value={index + 1}>{index + 1}</option>
                                        })
                                        }

                                    </select>
                                </>
                            ))}

                        </div>

                        <div class="row row-cols-auto mb-1">
                            <label for="range" class="h4 col">Arrow range : {arrowRange}</label>
                            <input type="range" min="1" max="5" class="col" value={arrowRange}
                                   onChange={adjustArrowRange}/>
                        </div>

                    </div>
                )
                }
                <button class="btn btn-secondary" onClick={startOverHandler}>{ButtonLabelReset}</button>

                <HowToPlay/>

            </div>

        </>
    )
}
