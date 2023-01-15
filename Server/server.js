import { Field } from "../Game/Field.js";
import { EventEmitter } from "events";
import { ServerError } from "./error.js";
import { Utils } from "./utils.js";
import WebSocket, { WebSocketServer } from "ws";
import {Server} from 'http';
import { GameStatusBuilder,GameStatus } from "../Game/GameStatus.js";
import * as Types from "../types.js";
//implemento la  logica del server socket che ho implementato nel caso di rooms

// /**
//  * @typedef GameStatus
//  * @prop {{1:WebSocket,2:WebSocket}} players
//  * @prop {boolean} started
//  * @prop {number} activePlayer
//  * @prop {boolean} gameOver
//  */

/**
 * @typedef ServerOptions
 * @prop {number} port
 * @prop {Server} server
 */
/**
 * @typedef Message
 * @prop {"turn"|"play"} type the message type
 * @prop {Record<string,any>} props the properties of the message
 * @description
 * nel caso di create il messaggio è
 *
 * PLAY {
 *  type:"play",
 *  props:{
 *  username:"nome"
 * }
 * }
 *
 * TURN {
 * type:"turn",
 * props:{
 * x:number,
 * y:number,
 * room:string,
 * username:username
 *  }
 * }
 *
 *
 */


//todo spostrare nexthandlerfactory in un altro file

const nextHandlerFactory =(/**@type {(ws:WebSocket,message:Record<string,string>)=>}*/sendMessage)=>{
  
  const nextHandler=(/**@type {Types.GameStatusMessage} */ newStatus,/**@type {GameStatus}*/gameStatus)=>{
    const players = gameStatus.players;
    players.forEach((player) => { 
        sendMessage(player,JSON.stringify(newStatus))
     })
  }

  return nextHandler
}

class GameServer extends EventEmitter {
  /**@type {WebSocketServer}*/_server;
  /**@type {Map<string,GameStatus>}*/ rooms = new Map();
  port;
  /**@type {Set<WebSocket>}*/queue = new Set(); // il queue per chi fa "play"

  constructor(/**@type {ServerOptions}*/ options) {
      super();
    this._options = options;
    this._init();
    this._handleConnections();
  }

  _init() {

    this._server = new WebSocketServer({port:this._options.port});

    this._server.on('listening',()=>{this.emit('listening')});
    this._server.on('connection',(ws)=>this.emit('connection',ws));

    this.on("play", (/**@type {WebSocket}*/ ws) => {
      //vedo se c'è già ws nel
      const alreadyInQueue = this.queue.has(ws);
      if (alreadyInQueue) {
        return this.emit(
          "error",
          new ServerError("client already in queue"),
          ws
        );
      }
      const username = Utils._createUsername();
      ws.username = username; // aggiungo questa proprietà
      this.queue.add(ws);
      if (this.queue.size == 2) {
        //prendo due elementi e creo una stanza
        this.createRoom();
        //TODO creo una stanza
      } else {
        //dico al client che deve aspettare in fila
        this.emit("enqueued", /**@type {WebSocket}*/ ws);
      }
    });

    this.on(
      "error",
      (/**@type {ServerError}*/ err, /**@type {WebSocket}*/ ws) => {
        this.sendMessage(ws, err.message);
      }
    );
    this.on("enqueued", (/**@type {WebSocket}*/ ws) => {
      const username= ws?.username?? 'username_non_definito'
      this.sendMessage(ws, { message: `you have been enqueued, your username is: ${username}` });
    });

    this.on('turn',this._turnHandler)

    this.on('next',nextHandlerFactory(this.sendMessage));
  }

  /**
   * @param {WebSocket} ws
   * @param {Record<string,string|number>} message
   */
  sendMessage(ws, message) {
    const json = JSON.stringify(message);
    ws.send(json);
  }

  createRoom() {
    const iteratePlayers = this.queue.values();
    const player1 = iteratePlayers.next().value;
    const player2 = iteratePlayers.next().value;

    if (!player1 || !player2) {
      console.log("player 1 or 2 is undefined");
      return;
    }

    const key = Utils._genkey(5);
    const gamestatus = this._initializeGame(player1,player2);
    this.rooms.set(key, gamestatus);
    const username1=player1?.username
    const username2=player2?.username
    this._addMetadata(player1, { room: key });
    this._addMetadata(player2, { room: key });
    [player1, player2].forEach((ws) =>
      this.sendMessage(ws, { message: `You joined the room ${key}, players: ${username1} vs ${username2}`, room: key , turn: gamestatus.activePlayer}) //il turno è di 1 o 2 
    );
    return key; //  quando creo il room, emetto anche a ciascuno dei
  }

  _handleMessages(ws,/**@type {Message} */ message) {
      const {type} = message;

      switch (type) {
        case "play":
            this.emit('play',ws); // esegui la logica del play
            break;
        case "turn":
          {
           this.emit('turn',ws,message);
          }
          break;
           
        default:
            break;
      }

        //i messaggi che posso fare sono di tipo join
  }

  _addMetadata(ws, /**@type {Record<string,any>}*/ data) {
    Object.entries(data).forEach(([key, value]) => {
      ws[key] = value; // tutte le proprietà che mi servono
    });
  }

  _handleConnections(){
    this.on('connection',(/**@type {WebSocket}*/ws)=>{
        ws.on('message',(data)=>{
            const jsonParsed = JSON.parse(data.toString());
            this._handleMessages(ws,jsonParsed);
        })

    })
  }

  _initializeGame(player1,player2){
    const game = new GameStatusBuilder()
    .setPlayers(player1,player2)
    .setStarted(true)
    .setGameOver(false)
    .createField()
    .setActivePlayer(1) //1 o 2 , players è una mappa con chiavi 1 e 2 
    .build();
    return game
    //associo a room una s
  }


  _turnHandler(ws,/**@type {Message}*/message){
      const {x,y,room,username}= {...message.props};
      if(Number.isNaN(x) || Number.isNaN(y) || !room || !username){
        return this.emit('error',new ServerError('props.x,props.y,props.room,props.username is required'),ws);
      }

      try {
        //prendo il gameStatus dai room
       /**@type {GameStatus} */ const gameStatus = this.rooms.get(room)
        if(!gameStatus){
          throw new Error(`no game status available for room ${room}`)
        }
        
        /**@type {Types.TurnProp} */ const turnProp = message.props
        /**@type {Types.GameStatusMessage}*/const newStatus = gameStatus.updateGameStatus(ws,turnProp);
        
        this.emit('next',newStatus,this.rooms.get(room)); //quello che ricevo è un newStatus che è un messaggio un room a cui a ciascun player mando il nuovo stato


        

      
      } catch (error) {
        this.sendMessage(ws,{message:error.message,error:true})
        console.error(error);
        //emetti i vari errori
      }
      //sono sicuro di avere tutti i parametri

  }

}

const server = new GameServer({port:5700});
server.on('listening',()=>{console.log('listening on por 5700')});


