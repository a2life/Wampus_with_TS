import {Logo} from './logo'
import {useEffect, useState} from "preact/hooks";
import {HowToPlay} from "./components/howToPlay_modal";
import {caves} from "./components/Caves";
import {pickNumbersAtRandomExcept, selectNextRoomRandomely, choseRandomArrowPath} from "./components/randomNumbers";
//to do  add play with same setup option
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
const GotTheWumpus = 'AHA! YOU GOT THE WUMPUS!'
const WumpusGotYou = 'TSK TSK TSK- WUMPUS GOT YOU!'
const AskForNextMove = 'Move to Another room or shoot an arrow?'
const ButtonLabelMoveTo = "Move to"
const ButtonLabelShoot = "Shoot Arrow"
const KilledYourSelf="Ouch, you got hit by the arrow!"
const ButtonLabelReset = "Start Over"
const GameWon = "HEE HEE HEE - THE WUMPUS'LL GETCHA NEXT TIME!!"
const GameLost = "HA HA HA - YOU LOSE!"
const isHazardPresent = (hazardLocation: number[], playerMovingIn: number) => hazardLocation.includes(playerMovingIn)

export function App() {
    //  const initialBatLocations = pickNumbersAtRandomExcept([],2)
    const [gamePlaying, setGamePlaying] = useState(gamePlay.on);
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
        const roomList = document.querySelectorAll('.target-room')
        let hitOrMiss = 'miss'
        let arrowWas = 0
        let arrowNow = playerLocation
        let narratives = "Arrow went into"
        for (const element of roomList) {
            let targetRoom = parseInt((element as HTMLSelectElement).value)
            if ((targetRoom <= 0) || (!caves[arrowNow].includes(targetRoom))) {
                targetRoom = choseRandomArrowPath(arrowNow, arrowWas)
            }
            narratives = `${narratives} ${targetRoom}...`
            arrowWas = arrowNow
            arrowNow = targetRoom
            if (targetRoom === wumpusLocation[0]) {
                setMessage([...Message, () => <p>{narratives}</p>, () => <p>{GotTheWumpus}</p>])
                setGamePlaying(gamePlay.won);
                hitOrMiss = 'hit'
                return
            }
            if (targetRoom === playerLocation) {
                setMessage([...Message, () => <p>{narratives}</p>, () => <p>{KilledYourSelf}</p>])
                setGamePlaying(gamePlay.lost);
                hitOrMiss = 'hit'
                return
            }
        }

        if (hitOrMiss === 'miss') {
            setMessage([...Message, () => <p>{narratives}</p>, () => <p>Missed</p>])
            //Wumpus will move if this was not the last arrow
            if (arrowCount > 1) setWumpusLocation([selectNextRoomRandomely(wumpusLocation[0], caves[wumpusLocation[0]])])

            setArrowCount(arrowCount - 1)
        }
    }
    const adjustArrowRange = (e: Event) => {
        setArrowRange(parseInt((e.target as HTMLInputElement).value))
    }
    const targetSetter = (e: Event) => {
        const targetElement = e.target as HTMLSelectElement
        const target = targetElement.value
        const targetId = targetElement.dataset.id!

        console.log('dataset id is', targetId)
        // if target set is not the last one, clear the selections on remaining path
        for (let x = parseInt(targetId) + 1; x < arrowRange; x++) {
            const selectorString = `[data-id="${x}"]`
            const targetElement = document.querySelector(selectorString) as HTMLSelectElement
            targetElement.value = "0"
        }

        // then reset value to random if arrow is going back. -- arrow is not that crooked. only check up to k-2
        for (let start = 0; start < 2; start++) {
            if (parseInt(targetId) > start) {
                const arrowWas = document.querySelector(`[data-id="${parseInt(targetId) - (start + 1)}"]`) as HTMLSelectElement
                if (target === arrowWas.value) {
                    console.log('arrow is directed to go back')
                    // so reset to random choice
                    targetElement.value = "0"
                }
            }
        }

    }
    useEffect(() => {
        let NewMessage = () => {
            if (isHazardPresent(pitLocations, playerLocation)) {
                setGamePlaying(gamePlay.lost)
                addMessageLine(FellInPit)
                return (<div>{FellInPit}</div>)
            } else if (isHazardPresent(batLocations, playerLocation)) {
                //this should not happen.so if this happens, then we have a bug somehere.
                setPlayerLocation(0)
                addMessageLine('bumped bat again. program logic problem')
            }
            //no hazards, fell through to next code section


        }


    }, [playerLocation])
    useEffect(() => {
        let NewMessage = () => {
            if (isHazardPresent(wumpusLocation, playerLocation)) {
                setGamePlaying(gamePlay.lost)
                return (<div>
                    <div>{BumpedWumpus}</div>
                    <div>{WumpusGotYou}</div>
                </div>)
            } else return (

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
        setMessage([...Message, NewMessage])
    }, [playerLocation, wumpusLocation])
    useEffect(() => {
        const text = document.getElementById('history') as HTMLTextAreaElement
        text.scrollTop = text.scrollHeight
    }, [Message])
    useEffect(() => {
        if (arrowCount === 0) {setGamePlaying(gamePlay.lost)
        addMessageLine('Out of Arrows!')}
    }, [arrowCount])
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

                            </button>


                            {Array(arrowRange).fill(0).map((j, index1) => (
                                <>
                                    <div class="col mt-2" style="font-size:1em"><i class="fas fa-arrow-right"></i></div>
                                    <select class="target-room form-select-sm col-md-1"
                                            aria-label="select arrow direction"
                                            onChange={targetSetter}
                                            id={index1.toString()}
                                            data-id={index1.toString()}>
                                        <option selected value="-1">Rm#</option>
                                        <option value="0">?</option>


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

                            <button class="btn btn-outline-primary disabled col  ms-2 "
                            >Arrow remaining
                                <span
                                    class="badge bg-secondary">{arrowCount}</span>
                            </button>


                        </div>

                        <div class="row row-cols-auto mb-1">
                            <label for="range" class="h4 col">Arrow reach
                                : {arrowRange} room{arrowRange > 1 ? 's' : ''}</label>
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
