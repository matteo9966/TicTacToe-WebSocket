import { Field } from "./Field.js";
import { strict as assert } from 'node:assert';

const rowTests=()=>{
    const field = new Field();
    field.field=[1,1,1,0,0,0,0,0,0];
    let result = field._checkRows(1);
    assert.ok(result,'should be true but got false')
    // console.log(result)
    
    field.field=[1,0,1,1,1,0,0,0,0];
    result = field._checkRows(1);
    assert.ok(!result,'got true should be false')
    
    
    field.field=[0,0,0,1,1,1,0,0,0];
    result = field._checkRows(1);
    assert.ok(result,'got false,expected true, input: '+field.field)
    
    field.field=[0,0,0,0,0,0,0,0,0];
    result = field._checkRows(1);
    assert.ok(!result,'got true,expected false, input: '+field.field)
    

     
}

const columnsTest=()=>{
    const field = new Field();
    field.field =[1,0,0,1,0,0,1,0,0];
    let result = field._checkColumns(1);
    assert.ok(result,'expected true, got false,input: '+field.field)
    field.field =[1,0,0,0,0,0,1,0,0];
     result = field._checkColumns(1);
    assert.ok(!result,'expected false, got true,input: '+field.field)

}

const checkDiags = ()=>{
    const field = new Field();
   
    field.field =[1,0,0,0,1,0,0,0,1];
    let result = field._checkDiags(1);
    assert.ok(result,'expected true'+result);

}

rowTests();
columnsTest();
checkDiags();