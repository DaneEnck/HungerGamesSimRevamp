import Contestant from "./contestant";
import Group from "./group";
import type EventStruct from './eventStruct';
import { combat } from "./eventFuncs";
import { capitalize } from "./eventFuncs";

//events where two parties interact; all must be compatible with both Contestant and Group in all instances!
//TODO: add more events
//TODO: add item looting to non combat lethal events
let multiList: Array<Function> = [
    //party one sees party two, either attacks or retreats
    function(x: Contestant|Group, y: Contestant|Group):EventStruct{
        let build = x.getName() + x.verbSwitchName(" spots "," spot ") + y.getName() + " from a distance. ";
        if (Math.random() < 0.5){
            build += capitalize(x.getPronoun()) + " " + x.verbSwitchPro("decides","decide") + " to retreat";
            return {images:x.getImage().concat(y.getImage()),main:build,combat:[]};
        } 
        else{
            build += capitalize(x.getPronoun()) + " " + x.verbSwitchPro("decides","decide") + " to attack!";
            return {images:x.getImage().concat(y.getImage()),main:build,combat:combat(x,y)};
        }
    },
    //party one attempts to steal from party two
    function(x: Contestant|Group, y: Contestant|Group):EventStruct{
        let randnum = Math.random();
        if(y.getItems().length == 0){
            return multiList[Math.floor(Math.random() * (multiList.length))](x,y);
        }
        if(randnum < 0.5){
            let randnum2 = Math.floor(Math.random() * y.getItems().length);
            let lostItem = y.getItems()[randnum2];
            x.addItem(y.getItems()[randnum2]);
            y.loseItem(randnum2);
            return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" steals "," steal ") + "a " + lostItem.getName() + " from " + y.getName(),combat:[]};
        }
        else{
            return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" tries "," try ") + " to steal supplies from " + y.getName() + ", but get caught!",combat:combat(y,x)};
        }
    },
    //party one attempts to sneak attack party two
    function(x: Contestant|Group, y: Contestant|Group):EventStruct{
        if(Math.random() < 0.5){
            if(y instanceof Contestant){
                y.downCond(99);
                return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" sneaks "," sneak ") + "up on " + y.getName() + " while " + y.getPronoun() + y.verbSwitchPro(" is "," are ") + " sleeping, and kills " + y.getObjpronoun() + " silently",combat:[]};
            }
            else{
                let randnum = Math.floor(Math.random() * y.getConts().length);
                y.getConts()[randnum].downCond(99);
                return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" sneaks "," sneak ") + " up on " + y.getName() + " while they sleep, killing " + y.getConts()[randnum].getName() + " before " + y.getPronoun() + " can wake up. Everyone else is awoken, and they retaliate!",combat:combat(x,y)};
            }
        }
        else{
            return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" tries "," try ") + "to sneak up on " + y.getName() + ", but " + y.getPronoun() + y.verbSwitchPro(" is "," are ") + " woken up by the footsteps and" + y.verbSwitchPro(" fights "," fight ") + "back!",combat:combat(y,x)};
        }
    },
    //party one charges party two
    function(x: Contestant|Group, y: Contestant|Group):EventStruct{
        if(Math.random() < 0.5){
            if(Math.random() < 0.75){
                return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" charges "," charge ") + "at " + y.getName() + ", but " + y.getPronoun() + y.verbSwitchPro(" runs "," run ") + " away!",combat:[]};
            }
            else{
                if (y instanceof Contestant){
                    y.downCond(1);
                    return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" charges "," charge ") + "at " + y.getName() + ". " + capitalize(y.getPronoun()) + y.verbSwitchPro(" tries "," try ") + "to run away, but " + y.getPronoun() + " trip and fall hard!",combat:combat(x,y)};
                }
                else{
                    let randcont = Math.floor(Math.random() * y.getConts().length);
                    y.getConts()[randcont].downCond(1);
                    return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" charges "," charge ") + "at " + y.getName() + ". They try to run away, but " + y.getConts()[randcont].getName() + " trips and falls hard!",combat:combat(x,y)};
                }
            }
        }
        else{
            return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" charges "," charge ") + "at " + y.getName() + ", but " + y.getPronoun() + y.verbSwitchPro(" stands "," stand ") + y.getPospronoun() + " ground!",combat:combat(x,y)};
        }
    }
]

export default multiList;

