import React, { useCallback, useEffect } from 'react'
import './scoreBoardStyle.css';
import TWEEN from '@tweenjs/tween.js'
export const userGameData={missedBullet:150,totalTime:120,score:0,life:3,gameOver:false};
export const ScoreBoard=({score=0,missedBullet=userGameData.missedBullet,timeleft=0})=>{
     
    return( <div className='BoardStyle'>
    <span>Your Score : {score}</span>
    <span>Time left : {timeleft}</span>
    <span>Bullet Left : {missedBullet}</span>
</div>)
  
}