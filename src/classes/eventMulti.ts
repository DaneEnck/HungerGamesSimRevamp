import Contestant from "./contestant";
import { Condition } from "./contestant";
import { weapon } from "./weapon";
import { item } from "./item";
import Group from "./group";
import type EventStruct from './eventStruct';

//events where two parties interact; all must be compatible with both Contestant and Group in all instances!
//TODO: add more events
//TODO: add item looting to non combat lethal events
let multiList: Array<Function> = [
    function(x: Contestant|Group, y: Contestant|Group):EventStruct{
        return {images:x.getImage().concat(y.getImage()),main: x.getName() + " fights " + y.getName(),combat:combat(x,y)};
    },
    function(x: Contestant|Group, y: Contestant|Group):EventStruct{
        let build = x.getName() + x.verbSwitchName(" spots "," spot ") + y.getName() + " from a distance. ";
        if (Math.random() < 0.5){
            build += x.getPronoun() + " " + x.verbSwitchPro("decides","decide") + " to retreat";
            return {images:x.getImage().concat(y.getImage()),main:build,combat:[]};
        } 
        else{
            build += x.getPronoun() + " " + x.verbSwitchPro("decides","decide") + " to attack!";
            return {images:x.getImage().concat(y.getImage()),main:build,combat:combat(x,y)};
        }
    },
    function(x: Contestant|Group, y: Contestant|Group):EventStruct{
        let randnum = Math.random();
        if(y.getItems().length == 0){
            return multiList[Math.floor(Math.random() * (multiList.length))](x,y);
        }
        if(randnum < 0.5){
            let randnum2 = Math.floor(Math.random() * y.getItems().length);
            x.addItem(y.getItems()[randnum2]);
            y.loseItem(randnum2);
            return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" steals "," steal ") + "supplies from " + y.getName(),combat:[]};
        }
        else{
            return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" tries "," try ") + " to steal supplies from " + y.getName() + ", but get caught!",combat:combat(y,x)};
        }
    },
    function(x: Contestant|Group, y: Contestant|Group):EventStruct{
        if(Math.random() < 0.5){
            if(y instanceof Contestant){
                y.downCond(99);
                return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" sneaks "," sneak ") + "up on " + y.getName() + " while " + y.getPronoun() + y.verbSwitchPro(" is "," are ") + " sleeping, and kill " + y.getObjpronoun() + " silently",combat:[]};
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
    function(x: Contestant|Group, y: Contestant|Group):EventStruct{
        if(Math.random() < 0.5){
            if(Math.random() < 0.75){
                return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" charges "," charge ") + "at " + y.getName() + ",but " + y.getPronoun() + y.verbSwitchPro(" runs "," run ") + " away!",combat:[]};
            }
            else{
                if (y instanceof Contestant){
                    y.downCond(1);
                    return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" charges "," charge ") + "at " + y.getName() + ". " + y.getPronoun() + y.verbSwitchPro(" tries "," try ") + "to run away, but " + y.getPronoun() + " trip and fall hard!",combat:combat(x,y)};
                }
                else{
                    let randcont = Math.floor(Math.random() * y.getConts().length);
                    y.getConts()[randcont].downCond(1);
                    return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" charges "," charge ") + "at " + y.getName() + ". They try to run away, but " + y.getConts()[randcont].getName() + " trips and falls hard!",combat:combat(x,y)};
                }
            }
        }
        else{
            return {images:x.getImage().concat(y.getImage()),main:x.getName() + x.verbSwitchName(" charges "," charge ") + "at " + y.getName() + ",but " + y.getPronoun() + y.verbSwitchPro(" stands "," stand ") + y.getPospronoun() + " ground!",combat:combat(x,y)};
        }
    }
]

export default multiList;

/*performs combat between two parties, either being a contestant or a group
every member takes one attack against a random member of the opposing party, dealing no or some damage (applied to cond)
each damage oppurtunity is decided by a randnum from 0 to 1. <0.4 misses (no damage), >0.9 is instantly lethal, in between deals varying damage levels
continues until all members of a party are dead
suriving party will take weapons & items from the defeated party when applicable
returns a multi-line string describing all damage done, living individuals, and items transfered

TODO: improve the combat rolls, lethal hits too frequent currently
*/
export function combat(x: Contestant|Group, y: Contestant|Group):string[]{
    let build:string[] = [];
    let randNum:number;
    let minibuild = "";
    if(x instanceof Contestant){
        build.push(x.getName() + " begins the fight " + x.getCondName());
    }
    else{
        for (let i = 0; i < x.getConts().length; i++){
            build.push(x.getConts()[i].getName() + " begins the fight " + x.getConts()[i].getCondName());
        }
    }
    if(y instanceof Contestant){
        build.push(y.getName() + " begins the fight " + y.getCondName());
    }
    else{
        for (let i = 0; i < y.getConts().length; i++){
            build.push(y.getConts()[i].getName() + " begins the fight " + y.getConts()[i].getCondName());
        }
    }



    //both contestants
    if(x instanceof Contestant && y instanceof Contestant){
        while(true){
            randNum = Math.random() + x.getWeapon().getHitAdd() - y.getWeapon().getBlockAdd();
            if(randNum < 0.4){
                build.push(x.getName() + " misses");
            }
            else{
                let minibuild:string = "";
                minibuild += x.getName() + " " + x.getWeapon().getHitVerb() + " " + y.getName() + " with " + x.getPospronoun() + " " + x.getWeapon().getName() + ", injuring " + y.getObjpronoun();
                if (randNum < 0.6 || x.getWeapon().getDamCap() == 1){
                    minibuild += " slightly\n";
                    y.downCond(1);
                }
                else if (randNum < 0.8 || x.getWeapon().getDamCap() == 2){
                    minibuild += " moderately\n";
                    y.downCond(2);
                }
                else if (randNum < 0.9 || x.getWeapon().getDamCap() == 3){
                    minibuild += " severely\n";
                    y.downCond(3);
                }
                else{
                    minibuild += " mortally\n";
                    y.setCond(Condition.DEAD);
                }
                build.push(minibuild);
            }
            if(y.getCond() == Condition.DEAD){
                build.push(y.getName() + " is dead!\n");
                if(x.newWeapon(y.getWeapon())){
                    build.push(x.getName() + " takes " + y.getName() + "'s " + y.getWeapon().getName() + "\n");
                }
                while(y.getItems().length > 0){
                    let tempitem:item = y.getItems().pop();
                    x.addItem(tempitem);
                    build.push( x.getName() + " takes a " + tempitem.getName() + " from " + y.getName() + "\n");
                }
                build.push(x.getName() + " ends the fight " + x.getCondName() + "\n");
                build.push(x.getName() + " wins the fight, and is " + x.getCondName());
                x.upKills(1);
                return build;
            }
            randNum = Math.random() + y.getWeapon().getHitAdd() - x.getWeapon().getBlockAdd();
            if(randNum < 0.4){
                build.push(y.getName() + " misses\n");
            }
            else{
                let minibuild:string = "";
                minibuild += y.getName() + " " + y.getWeapon().getHitVerb() + " " + x.getName() + " with " + y.getPospronoun() + " " + y.getWeapon().getName() + ", injuring " + x.getObjpronoun();
                if (randNum < 0.6 || y.getWeapon().getDamCap() == 1){
                    minibuild += " slightly\n";
                    x.downCond(1);
                }
                else if (randNum < 0.8 || y.getWeapon().getDamCap() == 2){
                    minibuild += " moderately\n";
                    x.downCond(2);
                }
                else if (randNum < 0.9 || y.getWeapon().getDamCap() == 3){
                    minibuild += " severely\n";
                    x.downCond(3);
                }
                else{
                    minibuild += " mortally\n";
                    x.setCond(Condition.DEAD);
                }
                build.push(minibuild);
            }
            if(x.getCond() == Condition.DEAD){
                build.push(x.getName() + " is dead!\n");
                y.upKills(1);
                if(y.newWeapon(x.getWeapon())){
                    build.push(y.getName() + " takes " + x.getName() + "'s " + x.getWeapon().getName() + "\n");
                }
                while(x.getItems().length > 0){
                    let tempitem:item = x.getItems().pop();
                    y.addItem(tempitem);
                    build.push(y.getName() + " takes a " + tempitem.getName() + " from " + x.getName() + "\n");
                }
                build.push(y.getName() + " ends the fight " + y.getCondName() + "\n");
                build.push(y.getName() + " wins the fight, and is " + y.getCondName() + "\n");
                return build;
            }
        }
    }



    //x is a contestant and y is a group
    else if (x instanceof Contestant && y instanceof Group){
        while(true){
            //x attacks
            let target:Contestant;
            do{
                target = y.getConts()[Math.floor(Math.random() * y.getConts().length)];
            }while(target.getCond() == Condition.DEAD)//attack living target
            randNum = Math.random() + x.getWeapon().getHitAdd() - target.getWeapon().getBlockAdd();
            if(randNum < 0.4){
                build.push(x.getName() + " misses\n");
            }
            else{
                let minibuild = "";
                minibuild += x.getName() + " " + x.getWeapon().getHitVerb() + " " + target.getName() + " with " + x.getPospronoun() + " " + x.getWeapon().getName() + ", injuring " + target.getObjpronoun();
                if (randNum < 0.6 || x.getWeapon().getDamCap() == 1){
                    minibuild += " slightly\n";
                    target.downCond(1);
                }
                else if (randNum < 0.8 || x.getWeapon().getDamCap() == 2){
                    minibuild += " moderately\n";
                    target.downCond(2);
                }
                else if (randNum < 0.9 || x.getWeapon().getDamCap() == 3){
                    minibuild += " severely\n";
                    target.downCond(3);
                }
                else{
                    minibuild += " mortally\n";
                    target.setCond(Condition.DEAD);
                }
                build.push(minibuild);
            }
            //check if target is dead
            if(target.getCond() == Condition.DEAD){
                x.upKills(1);
                build.push(target.getName() + " is dead!\n");
            }
            //check if entire group is dead
            for(let i = 0; i < y.getConts().length; i++){
                if(y.getConts()[i].getCond() != Condition.DEAD){
                    break;
                }
                if(i == y.getConts().length - 1){
                    //loot best weapon
                    let wepnum = -1;
                    for(let j = 0; j < y.getConts().length; j++){
                        if(x.newWeapon(y.getConts()[j].getWeapon())){
                            wepnum = j;
                        }
                    }
                    if(wepnum != -1){
                        build.push(x.getName() + " takes " + y.getConts()[wepnum].getName() + "'s " + y.getConts()[wepnum].getWeapon().getName() + "\n");
                    }
                    //take items
                    while(y.getItems().length > 0){
                        let tempitem:item = y.getItems().pop();
                        x.addItem(tempitem);
                        build.push(x.getName() + " takes a " + tempitem.getName() + " from " + y.getName() + "\n");
                    }
                    //health report & finish
                    build.push(x.getName() + " ends the fight " + x.getCondName() + "\n");
                    build.push(x.getName() + " wins the fight, and is " + x.getCondName() + "\n");
                    return build;
                }
            }
            //y (group) attacks
            for(let i = 0; i < y.getConts().length; i++){
                if(y.getConts()[i].getCond() != Condition.DEAD){
                    let attacker = y.getConts()[i];
                    randNum = Math.random() + attacker.getWeapon().getHitAdd() - x.getWeapon().getBlockAdd();
                    if(randNum < 0.4){
                        build.push(attacker.getName() + " misses\n");
                    }
                    else{
                        let minibuild = "";
                        minibuild += attacker.getName() + " " + attacker.getWeapon().getHitVerb() + " " + x.getName() + " with " + attacker.getPospronoun() + " " + attacker.getWeapon().getName() + ", injuring " + x.getObjpronoun();
                        if (randNum < 0.6 || attacker.getWeapon().getDamCap() == 1){
                            minibuild += " slightly\n";
                            x.downCond(1);
                        }
                        else if (randNum < 0.8 || attacker.getWeapon().getDamCap() == 2){
                            minibuild += " moderately\n";
                            x.downCond(2);
                        }
                        else if (randNum < 0.9 || attacker.getWeapon().getDamCap() == 3){
                            minibuild += " severely\n";
                            x.downCond(3);
                        }
                        else{
                            minibuild += " mortally\n";
                            x.setCond(Condition.DEAD);
                        }
                        build.push(minibuild);
                    }
                    //end combat if x is dead
                    if(x.getCond() == Condition.DEAD){
                        build.push(x.getName() + " is dead!\n");
                        attacker.upKills(1);
                        y.purge();
                        //check if someone loots weapon
                        for(let j = 0; j < y.getConts().length; j++){
                            if(y.getConts()[j].newWeapon(x.getWeapon())){
                                build.push(y.getName() + " take " + x.getName() + "'s " + x.getWeapon().getName() + "\n");
                                break;
                            }
                        }
                        //loot items
                        while(x.getItems().length > 0){
                            let tempitem:item = x.getItems().pop();
                            y.addItem(tempitem);
                            build.push(y.getName() + " take a " + tempitem.getName() + " from " + x.getName() + "\n");
                        }
                        //health report & finish
                        for(let j = 0; j < y.getConts().length; j++){
                            build.push(y.getConts()[j].getName() + " ends the fight " + y.getConts()[j].getCondName() + "\n");
                        }
                        let minibuild:string = y.getName() + " win the fight."
                        for(let j = 0;j < y.getConts().length; j++){
                            if (j != y.getConts().length-1){
                                minibuild += " " + y.getConts()[j].getName() + " is " + y.getConts()[j].getCondName() + ","; 
                            }
                            else{
                                minibuild += " and " + y.getConts()[j].getName() + " is " + y.getConts()[j].getCondName() + "\n";
                            }
                        }
                        build.push(minibuild);
                        return build;
                    }
                }
            }
        }
    }



    //x is a group and y is a contestant
    else if (x instanceof Group && y instanceof Contestant){
        while(true){
            //x (group) attacks
            for(let i = 0; i < x.getConts().length; i++){
                if(x.getConts()[i].getCond() != Condition.DEAD){
                    let attacker = x.getConts()[i];
                    randNum = Math.random() + attacker.getWeapon().getHitAdd() - y.getWeapon().getBlockAdd();
                    if(randNum < 0.4){
                        build.push(attacker.getName() + " misses\n");
                    }
                    else{
                        let minibuild = "";
                        minibuild += attacker.getName() + " " + attacker.getWeapon().getHitVerb() + " " + y.getName() + " with " + attacker.getPospronoun() + " " + attacker.getWeapon().getName() + ", injuring " + y.getObjpronoun();
                        if (randNum < 0.6 || attacker.getWeapon().getDamCap() == 1){
                            minibuild += " slightly\n";
                            y.downCond(1);
                        }
                        else if (randNum < 0.8 || attacker.getWeapon().getDamCap() == 2){
                            minibuild += " moderately\n";
                            y.downCond(2);
                        }
                        else if (randNum < 0.9 || attacker.getWeapon().getDamCap() == 3){
                            minibuild += " severely\n";
                            y.downCond(3);
                        }
                        else{
                            minibuild += " mortally\n";
                            y.setCond(Condition.DEAD);
                        }
                        build.push(minibuild);
                    }
                    //end combat if y is dead
                    if(y.getCond() == Condition.DEAD){
                        build.push(y.getName() + " is dead!\n");
                        attacker.upKills(1);
                        x.purge();
                        for(let j = 0; j < x.getConts().length; j++){
                            if(x.getConts()[j].newWeapon(y.getWeapon())){
                                build.push(x.getName() + " take " + y.getName() + "'s " + y.getWeapon().getName() + "\n");
                                break;
                            }
                        }
                        while(y.getItems().length > 0){
                            let tempitem:item = y.getItems().pop();
                            x.addItem(tempitem);
                            build.push(x.getName() + " take a " + tempitem.getName() + " from " + y.getName() + "\n");
                        }
                        for(let j = 0; j < x.getConts().length; j++){
                            build.push(x.getConts()[j].getName() + " ends the fight " + x.getConts()[j].getCondName() + "\n");
                        }
                        for(let j = 0; j < x.getConts().length; j++){
                            
                            if (j != x.getConts().length-1){
                                minibuild += " " + x.getConts()[j].getName() + " is " + x.getConts()[j].getCondName() + ","; 
                            }
                            else{
                                minibuild += " and " + x.getConts()[j].getName() + " is " + x.getConts()[j].getCondName() + "\n";
                            }
                        }
                        build.push(minibuild);
                        return build;
                    }
                }
            }
            //y (contestant) attacks
            let target:Contestant
            do{
                target = x.getConts()[Math.floor(Math.random() * x.getConts().length)];
            }while(target.getCond() == Condition.DEAD)
            randNum = Math.random() + y.getWeapon().getHitAdd() - target.getWeapon().getBlockAdd();
            if(randNum < 0.4){
                build.push( y.getName() + " misses\n");
            }
            else{
                let minibuild = "";
                minibuild += y.getName() + " " + y.getWeapon().getHitVerb() + " " + target.getName() + " with " + y.getPospronoun() + " " + y.getWeapon().getName() + ", injuring " + target.getObjpronoun();
                if (randNum < 0.6 || y.getWeapon().getDamCap() == 1){
                    minibuild += " slightly\n";
                    target.downCond(1);
                }
                else if (randNum < 0.8 || y.getWeapon().getDamCap() == 2){
                    minibuild += " moderately\n";
                    target.downCond(2);
                }
                else if (randNum < 0.9 || y.getWeapon().getDamCap() == 3){
                    minibuild += " severely\n";
                    target.downCond(3);
                }
                else{
                    minibuild += " mortally\n";
                    target.setCond(Condition.DEAD);
                }
                build.push(minibuild);
            }
            //check if target is dead
            if(target.getCond() == Condition.DEAD){
                build.push(target.getName() + " is dead!\n");
                y.upKills(1);
            }
            //check if all of x is dead
            for(let i = 0; i < x.getConts().length; i++){
                if(x.getConts()[i].getCond() != Condition.DEAD){
                    break;
                }
                if(i == x.getConts().length - 1){
                    //loot weapons
                    for(let j = 0; j < x.getConts().length; j++){
                        if(y.newWeapon(x.getConts()[j].getWeapon())){
                            build.push(y.getName() + " takes " + x.getConts()[j].getName() + "'s " + x.getConts()[j].getWeapon().getName() + "\n");
                            break;
                        }
                    }
                    //loot items
                    while(x.getItems().length > 0){
                        let tempitem:item = x.getItems().pop();
                        y.addItem(tempitem);
                        build.push(y.getName() + " takes a " + tempitem.getName() + " from " + x.getName() + "\n");
                    }
                    //health report & finish
                    build.push( y.getName() + " ends the fight " + y.getCondName() + "\n");
                    build.push( y.getName() + " wins the fight, and is " + y.getCondName() + "\n");
                    return build;
                }
            }
        }
    }



    //both are groups
    else if (x instanceof Group && y instanceof Group){
        while(true){
            //x (group) attacks
            for(let i = 0; i < x.getConts().length; i++){
                if(x.getConts()[i].getCond() != Condition.DEAD){
                    let attacker = x.getConts()[i];
                    let target:Contestant;
                    do{
                        target = y.getConts()[Math.floor(Math.random() * y.getConts().length)];
                    }while(target.getCond() == Condition.DEAD)
                    let randNum = Math.random() + attacker.getWeapon().getHitAdd() - target.getWeapon().getBlockAdd();
                    if(randNum < 0.4){
                        build.push(attacker.getName() + " misses\n");
                    }
                    else{
                        let minibuild = "";
                        minibuild += attacker.getName() + " " + attacker.getWeapon().getHitVerb() + " " + target.getName() + " with " + attacker.getPospronoun() + " " + attacker.getWeapon().getName() + ", injuring " + target.getObjpronoun();
                        if (randNum < 0.6 || attacker.getWeapon().getDamCap() == 1){
                            minibuild += " slightly\n";
                            target.downCond(1);
                        }
                        else if (randNum < 0.8 || attacker.getWeapon().getDamCap() == 2){
                            minibuild += " moderately\n";
                            target.downCond(2);
                        }
                        else if (randNum < 0.9 || attacker.getWeapon().getDamCap() == 3){
                            minibuild += " severely\n";
                            target.downCond(3);
                        }
                        else{
                            minibuild += " mortally\n";
                            target.setCond(Condition.DEAD);
                        }
                        build.push(minibuild);
                    }
                    //check if target is dead
                    if(target.getCond() == Condition.DEAD){
                        build.push(target.getName() + " is dead!\n");
                        attacker.upKills(1);
                    }
                    //check if all of y is dead
                    for(let j = 0; j < y.getConts().length; j++){
                        if(y.getConts()[j].getCond() != Condition.DEAD){
                            break;
                        }
                        if(j == y.getConts().length - 1){
                            x.purge();
                            //loot weapons
                            let tookweps:Array<number> = [];
                            for(let k = 0; k < x.getConts().length; k++){
                                let wepnum = -1;
                                for(let n = 0; n < y.getConts().length; n++){
                                    if(!tookweps.includes(n) && x.getConts()[k].newWeapon(y.getConts()[n].getWeapon())){//ensure same weapon isn't taken twice
                                        wepnum = n;
                                        break;
                                    }
                                }
                                if(wepnum != -1){//ensure best weapon is acquired
                                    build.push(x.getConts[k].getName() + " take " + y.getConts()[wepnum].getName() + "'s " + y.getConts()[wepnum].getWeapon().getName() + "\n");
                                    tookweps.push(wepnum);
                                }
                            }
                            //loot items
                            while(y.getItems().length > 0){
                                let tempitem:item = y.getItems().pop();
                                x.addItem(tempitem);
                                build.push(x.getName() + " take a " + tempitem.getName() + " from " + y.getName() + "\n");
                            }
                            //health report & finish
                            for(let g = 0; g < x.getConts().length;g++){
                                build.push( x.getConts()[g].getName() + " ends the fight " + x.getConts()[g].getCondName() + "\n");
                            }
                            for(let j = 0;j < x.getConts().length; j++){
                                let minibuild = "";
                                if (j != y.getConts().length-1){
                                    minibuild += " " + y.getConts()[j].getName() + " is " + y.getConts()[j].getCondName() + ","; 
                                }
                                else{
                                    minibuild += " and " + y.getConts()[j].getName() + " is " + y.getConts()[j].getCondName() + "\n";
                                }
                            }
                            build.push(minibuild);
                            return build;
                        }
                    }
                }
            }
            //y (group) attacks
            for(let i = 0; i < y.getConts().length; i++){
                if(y.getConts()[i].getCond() != Condition.DEAD){
                    let attacker = y.getConts()[i];
                    let target:Contestant
                    do{
                        target = x.getConts()[Math.floor(Math.random() * x.getConts().length)];
                    }while(target.getCond() == Condition.DEAD)
                    let randNum = Math.random() + attacker.getWeapon().getHitAdd() - target.getWeapon().getBlockAdd();
                    if(randNum < 0.4){
                        build.push(attacker.getName() + " misses\n");
                    }
                    else{
                        let minibuild = "";
                        minibuild += attacker.getName() + " " + attacker.getWeapon().getHitVerb() + " " + target.getName() + " with " + attacker.getPospronoun() + " " + attacker.getWeapon().getName() + ", injuring " + target.getObjpronoun();
                        if (randNum < 0.6 || attacker.getWeapon().getDamCap() == 1){
                            minibuild += " slightly\n";
                            target.downCond(1);
                        }
                        else if (randNum < 0.8 || attacker.getWeapon().getDamCap() == 2){
                            minibuild += " moderately\n";
                            target.downCond(2);
                        }
                        else if (randNum < 0.9 || attacker.getWeapon().getDamCap() == 3){
                            minibuild += " severely\n";
                            target.downCond(3);
                        }
                        else{
                            minibuild += " mortally\n";
                            target.setCond(Condition.DEAD);
                        }
                        build.push(minibuild);
                    }
                    //check if target is dead
                    if(target.getCond() == Condition.DEAD){
                        build.push(target.getName() + " is dead!\n");
                        attacker.upKills(1);
                    }
                    //check if all of x is dead
                    for(let j = 0; j < x.getConts().length; j++){
                        if(x.getConts()[j].getCond() != Condition.DEAD){
                            break;
                        }
                        if(j == x.getConts().length - 1){
                            y.purge();
                            //loot weapons
                            let tookweps:Array<number> = [];
                            for(let k = 0; k < y.getConts().length; k++){
                                let wepnum = -1;
                                for(let n = 0; n < x.getConts().length; n++){
                                    if(!tookweps.includes(n) && y.getConts()[k].newWeapon(x.getConts()[n].getWeapon())){
                                        wepnum = n;
                                        break;
                                    }
                                }
                                if(wepnum != -1){
                                    tookweps.push(wepnum);
                                    build.push(y.getConts()[k].getName() + " take " + x.getConts()[wepnum].getName() + "'s " + x.getConts()[wepnum].getWeapon().getName() + "\n");
                                }
                            }
                            //loot items
                            while(x.getItems().length > 0){
                                let tempitem:item = x.getItems().pop();
                                y.addItem(tempitem);
                                build.push(y.getName() + " take a " + tempitem.getName() + " from " + x.getName() + "\n");
                            }
                            //health report & finish
                            for(let g = 0; g < y.getConts().length; g++){
                                build.push(y.getConts()[g].getName() + " ends the fight " + y.getConts()[g].getCondName() + "\n");
                            }
                            for(let j = 0;j < y.getConts().length; j++){
                                let minibuild = "";
                                if (j != y.getConts().length-1){
                                    minibuild += " " + y.getConts()[j].getName() + " is " + y.getConts()[j].getCondName() + ","; 
                                }
                                else{
                                    minibuild += " and " + y.getConts()[j].getName() + " is " + y.getConts()[j].getCondName() + "\n";
                                }
                            }
                            build.push(minibuild);
                            return build;
                        }
                    }
                }
            }
        }
    }
    //i have no fucking clue why this needs to be here to work, you can see the other returns
    //i figured out the problem, hopefully i actually shouldnt need this here anymore
    build.push("IF YOU CAN SEE THIS, THE COMBAT LOOP IS FUCKED UP");
    build.push("IF YOU CAN SEE THIS, THE COMBAT LOOP IS FUCKED UP");
    return build;
}