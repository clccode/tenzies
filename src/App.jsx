import React, { useEffect, useState } from "react"
import Die from "./Die"
import Confetti from "react-confetti"
import {nanoid} from "nanoid"
import { useStopwatch } from "react-timer-hook"

export default function App() {
    const {
        seconds,
        minutes,
        pause,
        reset,
    } = useStopwatch({autoStart: true})
    const [dice, setDice] = useState(allNewDice())
    const [tenzies, setTenzies] = useState(false)
    const [rolls, setRolls] = useState(0)
    const [bestRoll, setBestRoll] = useState(JSON.parse(localStorage.getItem("bestRoll")) || "")
    const [bestTime, setBestTime] = useState(JSON.parse(localStorage.getItem("bestTime")) || "")
    // specify seconds display when there are less then 10 seconds elapsed
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
    // specify time display
    const timeDisplay = `${minutes}:${secondsDisplay}`
    // set button text depending on the state

    
    useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)
            if (!bestRoll) {
                setBestRoll(localStorage.setItem("bestRoll", JSON.stringify(rolls)))
            } else if (rolls < bestRoll) {
                setBestRoll(localStorage.setItem("bestRoll", JSON.stringify(rolls)))
            }
            if (!bestTime) {
                setBestTime(localStorage.setItem("bestTime", JSON.stringify({minutes, seconds})))
            } else if ({minutes, seconds} < bestTime) {
                setBestTime("bestTime", JSON.stringify({minutes, seconds}))
            }
        }
    }, [dice])
    
    useEffect(() => {
        tenzies && pause() // pause the clock when the game ends
    }, [tenzies])

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function rollDice() {
        if(!tenzies) {
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
            setRolls(prevRolls => prevRolls += 1)
        } else {
            setTenzies(false)
            setDice(allNewDice())
            setRolls(0)
            reset() // reset the clock
        }
    }
    
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }
    
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))
    
    return (
        <main>
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            <div className="scores">
                <h2 className="timer">⏱️ {timeDisplay}</h2>
                <h2 className="rolls">🎲 {rolls}</h2>
            </div>
            <div className="best-scores">
                <h2 className="best-time">Best ⏱️ {bestTime.minutes}:{bestTime.seconds}</h2>
                <h2 className="best-roll">Best 🎲 {bestRoll}</h2>
            </div>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <button 
                className="roll-dice" 
                onClick={rollDice}
            >
                {tenzies ? "New Game" :"Roll"}
            </button>
        </main>
    )
}