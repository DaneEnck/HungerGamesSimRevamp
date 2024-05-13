//all these imports are my own classes
import wepList, { craftWeaponList } from "./weapon";
import { weapon } from "./weapon";
import itemList, { itemClone } from "./item";
import { item } from "./item";
import Group from "./group";
import { craftItemList } from "./item";
import type EventStruct from './eventStruct';
import { combat } from './eventFuncs';
import Contestant from "./contestant";
//CHANGE BACK TYPE IN PACKAGE.JSON TO MODULE ONCE THIS PROJECT IS DONE!!!!!!!!!!!

//setup node terminal reading
const readline = require('node:readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


/*
rl.question('Enter event JSON string: ', (j: string) => {
    let testCont = new Contestant("Test Contestant", "he", "him", "his", "himself");
    interpInit(j, testCont, null);
    rl.close();
});
*/

//typecheck function for json object, equivalent to Exp
function isExp(o : any): boolean{   
    return "expId" in o && "body" in o;
}

let globalCombatToggle = false; //global variable, temporary solution, find a better way to make sure combat happens at the end later

function interpInit(j : string, p1 : Contestant|Group, p2 : Contestant|Group|null):EventStruct{
    let obj = JSON.parse(j);
    let id = obj.eventId;
    let hold = interp(obj.body, p1, p2);
    if(typeof hold === "string"){
        if(p2 === null){
            return {images: p1.getImage(), main: hold, combat: []};
        }
        else if(globalCombatToggle){
            globalCombatToggle = false;
            return {images: p1.getImage().concat(p2.getImage()), main: hold, combat: combat(p1,p2)};
        }
        else{
            return {images: p1.getImage().concat(p2.getImage()), main: hold, combat: []};
        }
    }
    else{
        throw new Error("Invalid type return: interp must end with string");
    }
}

function typeError(s: string){
    throw new Error("Invalid type return in interp for exp " + s);
}


/*exp definitions (manually enforced):
name of object value - type of value

proc: (Listof Exp)
str: string
giveWep: body-string (name of wep), target
giveItem: body-string (name of item), target
loseWep: target
loseItem: target
health: body-number, target
upKill: target
combat: none
cond: <exp, exp>*, exp
randbool: body-number, mod-number
selectCont: body-exp, num-number, target, must be passed group
*/

//TODO: support consumWeps
function interp(obj : any, p1 : Contestant|Group, p2 : Contestant|Group|null):string|boolean|number{
    let id:string;
    let target:Contestant|Group;
    let isP1Target:boolean = false;
    //return basic types
    if(typeof obj === "number" || typeof obj === "string" || typeof obj === "boolean"){
        return obj;
    }

    //make sure object has the right properties
    if(isExp(obj)){
        //expression type
        id = obj.expId;
    }
    else{
        throw new Error("Invalid expression format");
    }
    //determine target
    if(obj.expId !== "str" && obj.expId !== "randbool" && obj.expId != "    groupbool" && obj.expId !== "cond" && obj.expId !== "proc" && obj.expId !== "combat"){
        if(p2 === null || obj.target === 1){
            target = p1;
            isP1Target = true;
        }
        else if(obj.target === 2){
            target = p2;
            isP1Target = false;
        }
        else{
            throw new Error("Invalid target value");
        }
    }
    //interp based on expression id
    switch(id){
        case "proc":
            let build = "";
            //iterate through list of exps
            for(let i = 0; i < obj.body.length; i++){
                let hold = interp(obj.body[i], p1, p2);
                if(typeof hold === "string"){
                    //add all string returns onto a single string
                    build += hold;
                    //TODO: check if everyone in p1 is dead or everyone in p2 is dead, if so, break for loop
                }
                else{
                    typeError("proc");
                }
            }
            return build; 

        case "giveWep"://TODO: expand exp to include success and fail str?
            let thewep: weapon;
            //select a random weapon
            if (obj.body == "random" || obj.body == ""){
                thewep = wepList[Math.floor(Math.random() * wepList.length)];
            }
            //search both weapon lists for name in body
            else{
                for (let i = 0; i < wepList.length; i++){
                    if (wepList[i].getName() == obj.body){
                        thewep = wepList[i];
                        break;
                    }
                }
                for (let i = 0; i < craftWeaponList.length; i++){
                    if (craftWeaponList[i].getName() == obj.body){
                        thewep = craftWeaponList[i];
                        break;
                    }
                }
                if (!thewep){
                    throw new Error("Weapon not found");
                }
            }
            if(target instanceof Group){
                //attempt to give weapon to each member
                for(let i = 0; i < target.getConts().length; i++){
                    //attempt to give weapon, returns true if kept
                    if(target.getConts()[i].newWeapon(thewep)){
                        return "";
                    }
                }
                return "";
            }
            else{
                target.newWeapon(thewep);
                return "";
            }

        case "giveItem":
            let theitem: item;
            if (obj.body == "random" || obj.body == ""){
                theitem = itemList[Math.floor(Math.random() * itemList.length)];
            }
            else{
                for (let i = 0; i < itemList.length; i++){
                    if (itemList[i].getName() == obj.body){
                        theitem = itemList[i];
                        break;
                    }
                }
                for (let i = 0; i < craftItemList.length; i++){
                    if (craftItemList[i].getName() == obj.body){
                        theitem = craftItemList[i];
                        break;
                    }
                }
                if (!theitem){
                    throw new Error("Item not found");
                }
            }
            target.addItem(itemClone(theitem));
            return "";

        case "loseWep":
            //all member of group lose weapon
            if(target instanceof Group){
                for(let i = 0; i < target.getConts().length; i++){
                    target.getConts()[i].loseWeapon();
                }
                return "";
            }
            else{
                target.loseWeapon();
                return "";
            }
        
        case "loseItem":
            //lose random item
            if(target.getItems().length > 0){
                target.loseItem(Math.floor(Math.random() * target.getItems().length));
            }
            return "";

        case "health":
            //everything i did here is kind of dumb. i don't know why i have seperate functions for up and down health
            let num = obj.body;
            if (num < 0){
                if(target instanceof Group){
                    //apply to all members of group
                    for(let i = 0; i < target.getConts().length; i++){
                        target.getConts()[i].downCond(num*-1);
                    }
                }
                else{
                    target.downCond(num*-1);
                }
            }
            else{
                if(target instanceof Group){
                    for(let i = 0; i < target.getConts().length; i++){
                        target.getConts()[i].upCond(num);
                    }
                }
                else{
                    target.upCond(num);
                }
            }
            return "";

        case "upKill":
            if(target instanceof Group){
                //give kill credit to random member
                target.getConts()[Math.floor(Math.random() * target.getConts().length)].upKills(1);
            }
            else{
                target.upKills(1);
            }
            return "";

        case "combat":
            globalCombatToggle = true;
            return "";

        case "cond":
            //validate cond statement is odd length
            if(obj.body.length % 2 != 1){
                throw new Error("Invalid cond statement");
            }
            let bool;
            for(let i = 0; i < obj.body.length-1; i+=2){
                //interp conditional expression
                bool = interp(obj.body[i], p1, p2);
                if(typeof bool != "boolean"){
                    typeError("cond");
                }
                else{
                    if(bool){
                        //if conditional returned true, interp next exp
                        return interp(obj.body[i+1], p1, p2);
                    }
                }
            }
            //reached if no conditionals are true
            return interp(obj.body[obj.body.length-1], p1, p2);

        case "randbool":
            let thresh = obj.body;
            let mod = obj.mod;
            //i dont know why i did this
            if(typeof mod === "string" || typeof mod === "boolean" || typeof thresh !== "number"){
                throw new Error("Invalid randbool statement");
            }
            else if (typeof mod === "number"){
                if(Math.random() < thresh + mod){
                    return true;
                }
                else{
                    return false;
                }
            }
            else{
                throw new Error("Invalid randbool statement");
            }

        case "groupbool":
            return target instanceof Group;
        
        case "selectCont":
            if(target instanceof Group){
                if(obj.num >= target.getConts().length){
                    throw new Error("Invalid selectCont statement: selected contestant out of group size");
                }
                if(isP1Target){
                    return interp(obj.body, target.getConts()[obj.num], p2);
                }
                else{
                    return interp(obj.body, p1, target.getConts()[obj.num]);
                }
            }
            else{
                throw new Error("Invalid selectCont statement: target is not a group");
            }

        
        case "str": //this also handles all the custom escape sequences
            let ind:number
            let str = obj.body;
            //todo split each escape into its own loop
            while(true){
                //name
                ind = str.indexOf("/n1")
                if(ind != -1){
                    str = str.slice(0,ind) + p1.getName() + str.slice(ind+3,str.length)
                    continue
                }
                ind = str.indexOf("/n2")
                if(ind != -1){
                    str = str.slice(0,ind) + p2.getName() + str.slice(ind+3,str.length)
                    continue
                }
                //pronoun (he they)
                ind = str.indexOf("/p1")
                if(ind != -1){
                    str = str.slice(0,ind) + p1.getPronoun() + str.slice(ind+3,str.length)
                    continue
                }
                ind = str.indexOf("/p2")
                if(ind != -1){
                    str = str.slice(0,ind) + p2.getPronoun() + str.slice(ind+3,str.length)
                    continue
                }
                //object pronoun (him them)
                ind = str.indexOf("/op1")
                if(ind != -1){
                    str = str.slice(0,ind) + p1.getObjpronoun() + str.slice(ind+4,str.length)
                    continue
                }
                ind = str.indexOf("/op2")
                if(ind != -1){
                    str = str.slice(0,ind) + p2.getObjpronoun() + str.slice(ind+4,str.length)
                    continue
                }
                //possessive pronoun (his their)
                ind = str.indexOf("/pp1")
                if(ind != -1){
                    str = str.slice(0,ind) + p1.getPospronoun() + str.slice(ind+4,str.length)
                    continue
                }
                ind = str.indexOf("/pp2")
                if(ind != -1){
                    str = str.slice(0,ind) + p2.getPospronoun() + str.slice(ind+4,str.length)
                    continue
                }
                //weapon name
                ind = str.indexOf("/wn1")
                if(ind != -1){
                    if(p1 instanceof Contestant){
                        str = str.slice(0,ind) + p1.getWeapon().getName() + str.slice(ind+4,str.length)
                    }
                    else{
                        str = str.slice(0,ind) + p1.getConts()[Math.floor(Math.random() * p1.getConts().length)].getWeapon() + str.slice(ind+4,str.length)
                    }
                    continue
                }
                ind = str.indexOf("/wn2")
                if(ind != -1){
                    if(p2 instanceof Contestant){
                        str = str.slice(0,ind) + p2.getWeapon().getName() + str.slice(ind+4,str.length)
                    }
                    else{
                        str = str.slice(0,ind) + p2.getConts()[Math.floor(Math.random() * p2.getConts().length)].getWeapon() + str.slice(ind+4,str.length)
                    }
                    continue
                }
                //item name
                ind = str.indexOf("/in1")
                if(ind != -1){
                    str = str.slice(0,ind) + p1.getItems()[Math.floor(Math.random() * p1.getItems().length)] + str.slice(ind+4,str.length);
                    continue;
                }
                ind = str.indexOf("/in2")
                if(ind != -1){
                    str = str.slice(0,ind) + p2.getItems()[Math.floor(Math.random() * p2.getItems().length)] + str.slice(ind+4,str.length)
                    continue;
                }
                //verb switching : /vsp11walk/vsp12walks/vsp13 and /vsn11walk/vsn12walks/vsn13 (pro/name)
                ind = str.indexOf("/vsp11")
                if(ind != -1){
                    str = str.slice(0,ind) + p1.verbSwitchPro(str.slice(ind+6,str.indexOf("/vsp12")),str.slice(str.indexOf("/vsp12")+6,str.indexOf("/vsp13"))) + str.slice(str.indexOf("/vsp13")+6,str.length)
                    continue;
                }
                ind = str.indexOf("/vsn11")
                if(ind != -1){
                    str = str.slice(0,ind) + p1.verbSwitchName(str.slice(ind+6,str.indexOf("/vsn12")),str.slice(str.indexOf("/vsn12")+6,str.indexOf("/vsn13"))) + str.slice(str.indexOf("/vsn13")+6,str.length)
                    continue;
                }
                ind = str.indexOf("/vsp21")
                if(ind != -1){
                    str = str.slice(0,ind) + p2.verbSwitchPro(str.slice(ind+6,str.indexOf("/vsp22")),str.slice(str.indexOf("/vsp22")+6,str.indexOf("/vsp23"))) + str.slice(str.indexOf("/vsp23")+6,str.length)
                    continue;
                }
                ind = str.indexOf("/vsn21")
                if(ind != -1){
                    str = str.slice(0,ind) + p2.verbSwitchName(str.slice(ind+6,str.indexOf("/vsn22")),str.slice(str.indexOf("/vsn22")+6,str.indexOf("/vsn23"))) + str.slice(str.indexOf("/vsn23")+6,str.length)
                    continue;
                }
                break;
            }
            return str;
            
    }
}

let testcont1 = new Contestant("Test Contestant 1", "he", "him", "his", "Default.png");
let testcont2 = new Contestant("Test Contestant 2", "they", "them", "their", "Default.png");
let testcont3 = new Contestant("Test Contestant 3", "they", "them", "their", "Default.png");
let testcont4 = new Contestant("Test Contestant 4", "it", "it", "its", "Default.png");
let testcont5 = new Contestant("Test Contestant 5", "he", "him", "his", "Default.png");
let testcont6 = new Contestant("Test Contestant 6", "she", "her", "her", "Default.png");
let testgroup1 = new Group([testcont5, testcont6], [], "");
let testgroup2 = new Group([testcont3, testcont4], [], "");

//escape sequence tests
/*
console.log(interpInit(`{"eventId": "solo", "body": {"expId": "str", "body": 
"/n1 /p1 /op1 /pp1 /wn1 /n2 /p2 /op2 /pp2 /wn2 /p1 /p1 /p1"}}`, testcont1,testcont2).main);
console.log(interpInit(`{"eventId": "solo", "body": {"expId": "str", "body": 
"/p1 /vsp11walks/vsp12walk/vsp13 /pp1 dog | /n2 /vsn21walks/vsn22walk/vsn23 /pp2 dog"}}`, testcont1,testgroup1).main);
*/

//console.log(interpInit('{"eventId": "solo", "body": {"expId":"str", "body": "hi"}}', testcont1, null).main);

//test wep
/*
interpInit('{"eventId": "solo", "body": {"expId": "giveWep", "body": "random", "target": 1}}', testcont1, null)
console.log(testcont1.getWeapon().getName());
*/

//test combat
/*
console.log(interpInit(`{"eventId": "multi", "body": {"expId": "proc", "body": [{"expId":"combat","body":""},
            {"expId":"str","body":"they fightin!!"}]}}`, testgroup1, testgroup2))
            */

//a bit more complex
/*
console.log(interpInit(`{"eventId": "solo", "body": {"expId": "cond", "body": [{"expId":"randbool", "body":0.5, "mod":0}, 
            {"expId":"proc", "body":[{"expId":"giveWep", "body":"random", "target":1}, {"expId":"str", "body":"lucky!!!"}]}, 
            {"expId":"proc", "body":[{"expId":"health", "body":-99, "target":1}, {"expId":"str", "body":"unlucky!!!"}]}]}}`, testcont1, testcont2))
console.log(testcont1.getWeapon().getName());
console.log(testcont1.getCond());
*/ 

//console.log(interpInit(`{"eventId": "group", "body": {"expId":"selectCont","num":0,"target":1,"body":
//{"expId":"proc","body":[{"expId":"giveWep","body":"random","target":1},{"expId":"str","body":"/n1 gets a weapon"}]}}} `, testgroup1, null))
//console.log(testcont5.getWeapon().getName());



//console.log(interpInit(`{"eventId": "solo", "body": {"expId": "proc", "body": [{"expId": "giveWep", "body": "wooden spear", "target": 1}, {"expId": "str", "body": "/n1 /"}]}}`, testcont1, null))

//console.log(interpInit(`{"eventId": "multi", "body":{"expId":"cond", "body":[{"expId":"groupbool","body":"void","target":1},{"expId":"str","body":"Group detected"},{"expId":"str","body":"Contestant dectected"}]}}`, testgroup1, null))

/*
console.log(interpInit(`{"eventId": "multi", "body": {"expId":"proc","body":
            [{"expId":"str","body":"/n1 /vsn11spots/vsn12spot/vsn13 /n2 from a distance. "},{"expId":"cond", "body":
            [{"expId":"randbool", "body":0.5, "mod":0},{"expId":"str", "body":"/n1 /vsp11decides/vsp12decide/vsp13 to retreat"},
            {"expId":"proc", "body":[{"expId":"combat", "body":""},{"expId":"str", "body":
            "/n /vsp11decides/vsp12decide/vsp13 to attack!"}]}]}]}}`, testcont1, testcont2));
            */

process.exit();