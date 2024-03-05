import wepList, { craftWeaponList } from "./weapon";
import { weapon } from "./weapon";
import itemList, { itemClone } from "./item";
import { item } from "./item";
import Group from "./group";
import { craftItemList } from "./item";
import type EventStruct from './eventStruct';
import { combat } from './eventFuncs';
import { consumWep } from "./weapon";
import { cloneConsumWep } from "./weapon";
import { consumWepList } from "./weapon";
import type Contestant from "./contestant";

//events used for individual groups
//TODO: add betrayal events
//TODO: add togglable romance events
let groupList: Array<Function> = [
    function(x: Group):EventStruct{
        let thewep:weapon = wepList[Math.floor(Math.random() * wepList.length)];
        for(let i = 0; i < x.getConts().length; i++){
            if(x.getConts()[i].newWeapon(thewep)){
                return {images:x.getImage(),main: x.getName() + " recieve a " + thewep.getName() + " from a sponsor. " + x.getConts()[i].getName() + " keeps it",combat:[]};
            }
        }
        return {images:x.getImage(),main:x.getName() + " recieve a " + thewep.getName() + " from a sponsor, but they all keep their current weapons",combat:[]};
    },
    function(x: Group):EventStruct{
        let thewep:consumWep = consumWepList[Math.floor(Math.random() * consumWepList.length)];
        //approximately order the contestants by the number of consum weapons they have, so the one with the least gets to check the new weapon first
        let consumwepOrderedArr:Contestant[] = [x.getConts()[0]];
        for(let i = 1; i < x.getConts().length; i++){
            if(x.getConts()[i].getConsumWeps().length <= consumwepOrderedArr[0].getConsumWeps().length){
                consumwepOrderedArr = [x.getConts()[i]].concat(consumwepOrderedArr);
            }
            else{
                consumwepOrderedArr.push(x.getConts()[i]);
            }
        }
        for(let i = 0; i < consumwepOrderedArr.length; i++){
            if(consumwepOrderedArr[i].newConsumWeapon(cloneConsumWep(thewep))){
                return {images:x.getImage(),main: x.getName() + " recieve a " + thewep.getName() + " from a sponsor. " + consumwepOrderedArr[i].getName() + " keeps it",combat:[]};
            }
        }
        return {images:x.getImage(),main:x.getName() + " recieve a " + thewep.getName() + " from a sponsor, but do not need it",combat:[]};
    },
    function(x: Group):EventStruct{
        let theitem:item = itemList[Math.floor(Math.random() * itemList.length)]
        x.addItem(itemClone(theitem));
        return {images:x.getImage(),main:x.getName() + " recieve a " + theitem.getName() + " from a sponsor",combat:[]};
    },
    function(x: Group):EventStruct{
        let randnum = Math.random();
        let build = x.getName() + " go hunting"
        if(randnum < 0.33){
            build += ", but do not find anything"
        }
        else if (randnum < 0.66){
            build += ". They spot a squirrel, but it runs off before anyone can get close";
        }
        else{
            build += ". They spot a squirrel and catch it successfully!";
            x.addItem(itemClone(craftItemList[0]));
        }
        return {images:x.getImage(),main:build,combat:[]};
    },
    function(x:Group):EventStruct{
        let randnum = Math.random();
        let build = x.getName() + " try to catch fish";
        if (randnum < 0.75){
            build += ", but fail"
        }
        else{
            let randcont = x.getConts()[Math.floor(Math.random() * x.getConts().length)];
            if (randcont.getWeapon().getName() == "fists"){
                build += ". Amazingly, " + randcont.getPronoun() + randcont.verbSwitchPro(" grabs "," grab ") + "one with " + randcont.getPospronoun() + " bare hands!";
            }
            else{
                build += ". Amazingly, " + randcont.getPronoun() + " " + randcont.getWeapon().getHitVerb() + " one with " + randcont.getPospronoun() + " " + randcont.getWeapon().getName() + "!";
            }
            x.addItem(itemClone(craftItemList[1]));
        }
        return {images:x.getImage(),main:build,combat:[]};
    },
    function(x:Group):EventStruct{
        x.addItem(itemClone(craftItemList[2]));
        return {images:x.getImage(),main:x.getName() + " find a fruit tree and collect some fruit",combat:[]};
    },
    function(x:Group):EventStruct{
        let tempnum = -1;
        let randcont:number;
        for(let i = 0; i < x.getConts().length; i++){
            if(x.getConts()[i].newWeapon(craftWeaponList[0])){
                tempnum = i;
                break;
            }
        }
        if(tempnum != -1){
            do{
                randcont = Math.floor(Math.random() * x.getConts().length);
            }while(tempnum == randcont)
            return {images:x.getImage(),main: x.getConts()[randcont].getName() + " crafts a wooden spear for " + x.getConts()[tempnum].getName(),combat:[]};
        }
        else{
            return groupList[Math.floor(Math.random() * groupList.length)](x);
        }
    },
    function(x:Group):EventStruct{
        return {images:x.getImage(),main: x.getName() + " build a fire",combat:[]};
    },
    function(x:Group):EventStruct{
        let randnum = Math.random();
        let randcont = Math.floor(Math.random() * x.getConts().length);
        let str:string;
        if(randnum < 0.5){
            str = x.getConts()[randcont].getName() + " climbs a tree to get a vantage point for " + x.getConts()[randcont].getPospronoun() + " group";
        }
        else if(randnum < 0.8){
            x.getConts()[randcont].downCond(2);
            str = x.getConts()[randcont].getName() + " climbs a tree to get a vantage point, but slips and falls, injuring " + x.getConts()[randcont].getObjpronoun() + "self";
        }
        else{
            let randcont2:number;
            x.getConts()[randcont].downCond(2);
            do{
                randcont2 = Math.floor(Math.random() * x.getConts().length);
            }while(randcont == randcont2)
            x.getConts()[randcont2].downCond(2);
            str = x.getConts()[randcont].getName() + " climbs a tree to get a vantage point, but slips and falls onto " + x.getConts()[randcont2].getName() + ", injuring them both";
        }
        return {images:x.getImage(),main:str,combat:[]};
    },
    function(x:Group):EventStruct{
        x.addItem(itemClone(craftItemList[3]));
        return {images:x.getImage(),main:x.getName() + " pick berries",combat:[]};
    }
]

//events used for individual groups that break up the group and/or cause infighting
//TODO: add more events
export let groupBetrayList: Array<Function> = [
    function(x: Group):EventStruct{
        let build:string;
        let randnum = Math.floor(Math.random() * x.getConts().length);
        let randcont = x.getConts()[randnum];
        if(x.getConts().length == 2){
            //1-randnum will be the index of the other contestant
            build = randcont.getName() + " has had enough of " + x.getConts()[1-randnum].getName() + " and attacks " + x.getConts()[1-randnum].getObjpronoun() + "!";
            return {images:x.getImage(),main:build,combat:combat(randcont,x.getConts()[1-randnum])};
        }
        else{
            x.loseMember(randnum);
            build = randcont.getName() + " has had enough of " + x.getName() + " and attacks them!";
            return {images:randcont.getImage().concat(x.getImage()),main:build,combat:combat(randcont,x)};
        }
    }
]

export default groupList;