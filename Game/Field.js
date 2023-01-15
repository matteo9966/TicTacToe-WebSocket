/** 

*
*/
/**
 * current state of the field
 * 0 = none
 * 1 = player 1
 * 2 = player 2
 * 
 * [[0,0,0]
 *  [0,0,0]
 *  [0,0,0]
 * ]
 * diventa
 * [0,0,0,0,0,0,0,0]
 * dove index = width*row + col
 */

import { Types } from "../types.js";
export class Field { 
    constructor(){
        this.field = [0,0,0,0,0,0,0,0];
    }

    getCell(x,y){
        const index = 3*y + x; // appiattisco la matrice
        return this.field[index];
    }

    setCell(x,y,val){
        const index = 3*y+x;
        this.field[index]=val;
    }

    _checkWin(id){
      const wonDiags = this._checkDiags(id);
      const wonRows = this._checkRows(id);
      const wonCols = this._checkColumns(id);

      return wonCols || wonDiags || wonRows;
       
    }

    _checkRows = (id)=>{
        //check row
        //check each row
        const checkRow = (row)=>{
           return [0,1,2].every(cell=>this.getCell(cell,row)===id)
        }
        return [0,1,2].some(row=>checkRow(row));
    }

    _checkColumns = (id)=>{
        const checkColumn = (column)=>{
            return [0,1,2].every(cell=>this.getCell(column,cell)===id)
         }
         return [0,1,2].some(row=>checkColumn(row));

    }
    _checkDiags = (id)=>{
        const diagIndexes = [[0,4,8],[2,4,6]];
        const checkDiagonal=(/**@type {number[]}*/diagIndexes)=>{
           return diagIndexes.every(index=>this.field[index]===id);
        }

        return diagIndexes.some(indexes=>checkDiagonal(indexes));
    }



    checkGameOver(id){
        //tocca a uno, se ha vi
        const checkWin = this._checkWin(id); // vedo se ha vinto quello a cui tocca
        const checkDraw = this.field.every(cell=>cell!==0);
       /**@type {Types.UpdateStatus}*/ const status = {'over':checkDraw||checkWin,id:checkWin?id:0};
        return status; // se over è true controllo se il winner non è 0
        //controllo per il win di uno dei due id, controllo per il completamento
    }

    resetGame (){
        this.field = [0,0,0,0,0,0,0,0,0];
    }


}