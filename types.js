/**
 * @typedef TurnProp
 * @prop {number} x
 * @prop {number} y
 * @prop {string} room
 * @prop {string} username
 * {
 * x:number,
 * y:number,
 * room:string,
 * username:username
 *  }
 */

/**
 * @typedef GameStatusMessage
 * @prop {boolean} gameOver
 * @prop {boolean} winnerId
 * @prop {1|2} activePlayer
 * @prop {number[]} field
 */

/**
 * @typedef UpdateStatus 
 * @prop {boolean} over stato di game over 
 * @prop {0|1|2} id id del vincitore , se 0 non è nessuno il vincitore
 */



export const Types = {}