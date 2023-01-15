import { Field } from "./Field.js";
import { WebSocket } from "ws";
import * as Types from '../types.js';

export class GameStatus{
    constructor(player1,player2,gameOver,started,field,activePlayer){
       /**@type {Map<1|2,WebSocket>}*/this.players = new Map([[1,player1],[2,player2]])
       this._gameOver=gameOver;
       this._started=started;
       /**@type {Field}*/this._field=field;
       /**@type {1|2}*/this._activePlayer=activePlayer;
       //todo ogni giocatore deve avere un id che è 1 o 2 per ciascun room
       //id di player1 può essere 1 
       //id di player2 può essere 2 
    }

  
    updateGameStatus(/**@type {WebSocket} */player,/**@type {Types.TurnProp} */ turn){
        const username = player?.username;
        if(this._gameOver){
            throw new Error(`game over, start a new game`);
        }
        if(!this.isActivePlayer(player)){
            throw new Error(`${username} is not the current active user`)
        }
        if(!this.isValidMove(turn.x,turn.y)){
            throw new Error(`${turn.username} chose an invalid move`)
        }

        //la mossa è valida aggiorniamo lo stato del gioco
        const userId = this.activePlayer;

        this._field.setCell(turn.x,turn.y,userId);
        const status = this._field.checkGameOver(userId)
        
        if(status.over){
            this._gameOver=status.over;
            this.resetGame(); // il reset game deve svuotare il field, lasciare lo stato di gameover,
            
        }else{
            //non è over
            const nextPlayer = this.activePlayer === 1 ? 2 : 1 ; // il numero successivo
            this.setActivePlayer(nextPlayer);
        }
        
        //genero un oggetto bello corposo con lo stato 
        const gameStatus = this.getGameStatus(status);
        return gameStatus

    }

    isActivePlayer(/**@type {WebSocket} */player){
        const activePlayer = this.players.get(this.activePlayer) 
        if(player === activePlayer){
            return true
        }
        return false;
    }

    /**
     * @description the x y coordinates of the move
     * @param {number} x 
     * @param {number} y 
     */
    isValidMove(x,y){
        const fieldValue = this._field.getCell(x,y);
        if(fieldValue===0){
            return true
        }
        return false;
    }


    setActivePlayer(/**@type {1|2}*/player){
       this.activePlayer = player; 
    }
    
    resetGame(){
        //todo implement reset game
        this._field.resetGame();
        this._started=false;
        this._activePlayer=0; //!gestire la logica del nuovo active player 
    
    }

    get activePlayer(){
        return this._activePlayer 
    }

    set activePlayer(player){
        this._activePlayer = player
    }

    getGameStatus(/**@type {Types.UpdateStatus}*/updateStatus){
       /**@type {Types.GameStatusMessage} */ const message = {
          activePlayer:this.activePlayer,
          field:this._field.field,
          gameOver:this._gameOver,
          winnerId:updateStatus.id
       } 
       console.log(message);
       return message
        //restituisco un oggetto che mi da lo stato corrente del gioco in modo da restituirlo dopo l'update
    }

    startNewGame(/**@type {1|2}*/activePlayer){
        this.resetGame();
        this.activePlayer=activePlayer
        this._started=true;
    }




}

export class GameStatusBuilder{
    //build restituisce una istanza di gameStatus
    player1;
    player2;
    gameOver;
    started;
    field;

    setPlayers(player1,player2){
        this.player1=player1;
        this.player2=player2;
        return this
    }
    setStarted(started){
        this.started=started;
        return this
    }
    setGameOver(gameOver){
        this.gameOver=gameOver;
        return this
    }
     
    setActivePlayer(/**@type {1|2}*/activePlayer){
        this.activePlayer=activePlayer;
        return this
    }

    createField(){
        this.field = new Field();
        return this
    }

    build(){
       return new GameStatus(this.player1,this.player2,this.gameOver,this.started,this.field,this.activePlayer)
    }

}