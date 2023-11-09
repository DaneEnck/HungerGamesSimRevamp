import Contestant from "./contestant";
import { Condition } from "./contestant";
import wepList, { craftWeaponList } from "./weapon";
import { weapon } from "./weapon";
import itemList, { itemClone } from "./item";
import { item } from "./item";
import { craftItemList } from "./item";
import type EventStruct from './eventStruct';
import { capitalize } from "./eventFuncs";

//events used for individual contestants
let soloList: Array<Function> = [
    //contestant recieves random weapon from sponsor
    function(x: Contestant):EventStruct{
        let thewep:weapon = wepList[Math.floor(Math.random() * wepList.length)];
        if(x.newWeapon(thewep)){
            return {images:x.getImage(),main: x.getName() + " recieves a " + thewep.getName() + " from a sponsor",combat:[]};
        }
        else{
            return {images:x.getImage(),main:x.getName() + " recieves a " + thewep.getName() + " from a sponsor, but keeps " + x.getPospronoun() + " current weapon",combat:[]};
        }
    },
    //contestant recieves random item from sponsor
    function(x: Contestant):EventStruct{
        let theitem:item = itemList[Math.floor(Math.random() * itemList.length)]
        x.addItem(itemClone(theitem));
        return {images:x.getImage(),main:x.getName() + " recieves a " + theitem.getName() + " from a sponsor",combat:[]};
    },
    //contestant attempts to hunt
    function(x: Contestant):EventStruct{
        let randnum = Math.random();
        let build = x.getName() + " goes hunting"
        if(randnum < 0.33){
            build += ", but does not find anything"
        }
        else if (randnum < 0.66){
            build += ". " + capitalize(x.getObjpronoun()) + " " + x.verbSwitchPro("spots","spot") + " a squirrel, but it runs off before " + x.getPronoun() + " can get close";
        }
        else{
            build += ". " + capitalize(x.getObjpronoun()) + " " + x.verbSwitchPro("spots","spot") + "a squirrel and catch it successfully!";
            x.addItem(itemClone(craftItemList[0]));
        }
        return {images:x.getImage(),main:build,combat:[]};
    },
    //contestant attempts to fish
    function(x:Contestant):EventStruct{
        let randnum = Math.random();
        let build = x.getName() + " tries to catch fish";
        if (randnum < 0.75){
            build += ", but fails"
        }
        else{
            if (x.getWeapon().getName() == "fists"){
                build += ". Amazingly, " + x.getPronoun() + x.verbSwitchPro(" grabs "," grab ") + "one with " + x.getPospronoun() + " bare hands!";
            }
            else{
                build += ". Amazingly, " + x.getPronoun() + " " + x.getWeapon().getHitVerb() + " one with " + x.getPospronoun() + " " + x.getWeapon().getName() + "!";
            }
            x.addItem(itemClone(craftItemList[1]));
        }
        return {images:x.getImage(),main:build,combat:[]};
    },
    //contestant questions their sanity
    function(x:Contestant):EventStruct{
        return {images:x.getImage(),main: x.getName() + " questions " + x.getPospronoun() + " sanity",combat:[]};
    },
    //contestant finds fruit tree
    function(x:Contestant):EventStruct{
        x.addItem(itemClone(craftItemList[2]));
        return {images:x.getImage(),main:x.getName() + " finds a fruit tree and collects some fruit",combat:[]};
    },
    //contestant crafts spear
    function(x:Contestant):EventStruct{
        if (x.newWeapon(craftWeaponList[0])){
            return {images:x.getImage(), main:x.getName() + " crafts a wooden spear",combat:[]};
        }
        else{
            return soloList[Math.floor(Math.random() * soloList.length)](x);
        }
    },
    //contestant builds a fire
    function(x:Contestant):EventStruct{
        return {images:x.getImage(),main: x.getName() + " builds a fire",combat:[]};
    },
    //contestant attempts to climb tree to look around
    function(x:Contestant):EventStruct{
        let randnum = Math.random()
        if(randnum < 0.5){
            return {images: x.getImage(),main:x.getName() + " climbs a tree to get a vantage point",combat:[]};
        }
        else if(randnum < 0.8){
            x.downCond(2);
            return {images: x.getImage(),main:x.getName() + " climbs a tree to get a vantage point, but slips and falls, injuring " + x.getObjpronoun() + "self",combat:[]};
        }
        else{
            x.downCond(99);
            return {images: x.getImage(),main:x.getName() + " climbs a tree to get a vantage point, but slips and falls, breaking " + x.getPospronoun() + " neck",combat:[]};   
        }
    },
    //contestant picks berries
    function(x:Contestant):EventStruct{
        x.addItem(itemClone(craftItemList[3]));
        return {images:x.getImage(),main: x.getName() + " picks some berries",combat:[]};
    }
]

export default soloList;
