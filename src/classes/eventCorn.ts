import Contestant from "./contestant";
import wepList from "./weapon";
import itemList, { itemClone } from "./item";
import { combat } from "./eventFuncs";
import Group from "./group";
import type EventStruct from "./eventStruct";

//TODO: add more events

//solo events only used at start of game
export const cornSoloList:Array<Function> = [
    //contestant takes weapon from cornucopia
    function(x: Contestant):EventStruct{
        let randnum = Math.floor(Math.random() * wepList.length);
        let tempwep = wepList[randnum];
        x.newWeapon(tempwep);
        return {images:x.getImage(),main:x.getName() + " grabs a " + tempwep.getName() + " from the cornucopia",combat:[]};
    },
    //contestant takes item from cornucopia
    function(x: Contestant):EventStruct{
        let randnum = Math.floor(Math.random() * itemList.length);
        let tempitem = itemList[randnum];
        x.addItem(itemClone(tempitem));
        return {images:x.getImage(),main:x.getName() + " grabs a " + tempitem.getName() + " from the cornucopia",combat:[]};
    },
    //contestant runs away from cornucopia
    function(x: Contestant):EventStruct{
        return {images:x.getImage(),main: x.getName() + " runs away from the cornucopia",combat:[]};
    },
    //contestant hides in the cornucopia
    function(x: Contestant):EventStruct{
        return {images:x.getImage(),main: x.getName() + " hides in the cornucopia",combat:[]};
    },
    //contestant grabs a backpack
    function(x: Contestant):EventStruct{
        let build = x.getName() + " grabs a backpack from the cornucopia";
        let rand = Math.random()
        if (rand < 0.5){
            build += ", only to later find it's empty"
        }
        else{
            let theitem = itemList[Math.floor(Math.random() * itemList.length)]
            x.addItem(itemClone(theitem));
            build += ", it has a " + theitem.getName() + " inside";
        }
        return {images:x.getImage(),main: build,combat:[]}
    }
];

//multi events only used at start of game
export const cornMultiList:Array<Function> = [
    //two contestants fight over a weapon
    function(x: Contestant, y:Contestant):EventStruct{
        let tempwep = wepList[Math.floor(Math.random() * wepList.length)];
        let build = x.getName() + " and " + y.getName() + " both run for the same " + tempwep.getName() + ". ";
        if(Math.random() < 0.5){
            build += x.getName() + " is faster, grabbing it then turning to fight " + y.getName();
            x.newWeapon(tempwep);
            return {images:x.getImage().concat(y.getImage()),main:build,combat:combat(y,x)};
        }
        else{
            build += y.getName() + " is faster, grabbing it then turning to fight " + x.getName();
            y.newWeapon(tempwep);
            return {images:x.getImage().concat(y.getImage()),main:build,combat:combat(x,y)};
        }
    },
    //two contestants fistfight before reaching the cornucopia
    function(x: Contestant,y:Contestant):EventStruct{
        return {images:x.getImage().concat(y.getImage()),main: x.getName() + " and " + y.getName() + " bump into eachother before reaching the cornucopia, and get in a fistfight",combat:combat(x,y)};
    }
];

export const cornGroupList:Array<String> = [
    " leave the cornucopia together, having agreed to an alliance before the game began"
]