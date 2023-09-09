import Contestant from "./contestant";
import Group from "./group";
import wepList, { craftWeaponList, weapon } from "./weapon";
import itemList, { item, craftItemList} from "./item";
import { combat } from "./eventMulti";
import type EventStruct from "./eventStruct";

//solo events only used at start of game
export const cornSoloList:Array<Function> = [
    function(x: Contestant):EventStruct{
        let randnum = Math.floor(Math.random() * wepList.length);
        let tempwep = wepList[randnum];
        x.newWeapon(tempwep);
        return {images:x.getImage(),main:x.getName() + " grabs a " + tempwep.getName() + " from the cornucopia",combat:[]};
    },
    function(x: Contestant):EventStruct{
        let randnum = Math.floor(Math.random() * itemList.length);
        let tempitem = itemList[randnum];
        x.addItem(tempitem);
        return {images:x.getImage(),main:x.getName() + " grabs a " + tempitem.getName() + " from the cornucopia",combat:[]};
    },
    function(x: Contestant):EventStruct{
        return {images:x.getImage(),main: x.getName() + " runs away from the cornucopia",combat:[]};
    }
];

//multi events only used at start of game
export const cornMultiList:Array<Function> = [
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
    function(x: Contestant,y:Contestant):EventStruct{
        return {images:x.getImage().concat(y.getImage()),main: x.getName() + " and " + y.getName() + " bump into eachother before reaching the cornucopia, and get in a fistfight",combat:combat(x,y)};
    }
];
