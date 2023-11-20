import Contestant from "./contestant";
import Group from "./group";
import { item } from "./item";
import { Condition } from "./contestant";

//capitalizes first letter of a string
export function capitalize(x:string):string{
    return x.charAt(0).toUpperCase() + x.slice(1);
}

//loots all items from y and gives them to x, returning a multi-line string describing the loot (to be used in the combat field of eventstruct)
export function loot(x:Contestant|Group, y:Contestant|Group):string[]{
    let build:string[] = [];
    let tookweps:Array<number> = [];
    let contArrX:Contestant[] = [];
    let contArrY:Contestant[] = [];
    if (x instanceof Contestant){
        contArrX = [x];
    }
    else{
        contArrX = x.getConts();
    }
    if (y instanceof Contestant){
        contArrY = [y];
    }
    else{
        contArrY = y.getConts();
    }
    for(let k = 0; k < contArrX.length; k++){
        let wepnum = -1;
        for(let n = 0; n < contArrY.length; n++){
            if(!tookweps.includes(n) && contArrX[k].newWeapon(contArrY[n].getWeapon())){//ensure same weapon isn't taken twice
                wepnum = n;
                break;
            }
        }
        if(wepnum != -1){//ensure best weapon is acquired
            build.push(contArrX[k].getName() + " takes " + contArrY[wepnum].getName() + "'s " + contArrY[wepnum].getWeapon().getName() + "\n");
            tookweps.push(wepnum);
        }
    }
    //loot items
    while(y.getItems().length > 0){
        let tempitem:item = y.getItems().pop();
        x.addItem(tempitem);
        build.push(x.getName() + x.verbSwitchName(" takes "," take ") + "a " + tempitem.getName() + " from " + y.getName() + "\n");
    }
    build.push(x.getName() + x.verbSwitchName(" takes "," take ") + "all of " + y.getName() + "'s items\n");
    return build;
}

/*performs combat between two parties, either being a contestant or a group
every member takes one attack against a random member of the opposing party, dealing no or some damage (applied to cond)
each damage oppurtunity is decided by a randnum from 0 to 1. <0.4 misses (no damage), >0.9 is instantly lethal, in between deals varying damage levels
continues until all members of a party are dead
suriving party will take weapons & items from the defeated party when applicable
returns a multi-line string describing all damage done, living individuals, and items transfered
the final line is just the winner of the fight

This function could probably be condensed further by using recursion to swap the attacker/defender instead of having two loops
but quite frankly, that will likely take longer to implement than it would save me development time 

TODO: improve the combat rolls, lethal hits too frequent currently
*/
export function combat(x: Contestant|Group, y: Contestant|Group):string[]{
    let build:string[] = [];
    //placing both parties into an array, whether they are a contestant or a group, allows for a single loop without type checking
    let contArrX:Contestant[] = [];
    let contArrY:Contestant[] = [];
    if(x instanceof Contestant){
        build.push(x.getName() + " begins the fight " + x.getCondName());
        contArrX = [x];
    }
    else{
        for (let i = 0; i < x.getConts().length; i++){
            build.push(x.getConts()[i].getName() + " begins the fight " + x.getConts()[i].getCondName());
        }
        contArrX = x.getConts();
    }
    if(y instanceof Contestant){
        build.push(y.getName() + " begins the fight " + y.getCondName());
        contArrY = [y];
    }
    else{
        for (let i = 0; i < y.getConts().length; i++){
            build.push(y.getConts()[i].getName() + " begins the fight " + y.getConts()[i].getCondName());
        }
        contArrY = y.getConts();
    }
    while(true){
        //x attacks
        for(let i = 0; i < contArrX.length; i++){
            if(contArrX[i].getCond() != Condition.DEAD){
                let attacker = contArrX[i];
                let target:Contestant;
                do{
                    target = contArrY[Math.floor(Math.random() * contArrY.length)];
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
                for(let j = 0; j < contArrY.length; j++){
                    if(contArrY[j].getCond() != Condition.DEAD){
                        break;
                    }
                    if(j == contArrY.length - 1){
                        //loot weapons
                        let tookweps:Array<number> = [];
                        for(let k = 0; k < contArrX.length; k++){
                            let wepnum = -1;
                            for(let n = 0; n < contArrY.length; n++){
                                if(!tookweps.includes(n) && contArrX[k].newWeapon(contArrY[n].getWeapon())){//ensure same weapon isn't taken twice
                                    wepnum = n;
                                    break;
                                }
                            }
                            if(wepnum != -1){//ensure best weapon is acquired
                                build.push(contArrX[k].getName() + " takes " + contArrY[wepnum].getName() + "'s " + contArrY[wepnum].getWeapon().getName() + "\n");
                                tookweps.push(wepnum);
                            }
                        }
                        //loot items
                        while(y.getItems().length > 0){
                            let tempitem:item = y.getItems().pop();
                            x.addItem(tempitem);
                            build.push(x.getName() + x.verbSwitchName(" takes "," take ") + "a " + tempitem.getName() + " from " + y.getName() + "\n");
                        }
                        //health report & finish
                        for(let g = 0; g < contArrX.length;g++){
                            build.push( contArrX[g].getName() + " ends the fight " + contArrX[g].getCondName() + "\n");
                        }
                        build.push(x.getName() + x.verbSwitchName(" wins "," win ") + "the fight.");
                        return build;
                    }
                }
            }
        }
        //y attacks
        for(let i = 0; i < contArrY.length; i++){
            if(contArrY[i].getCond() != Condition.DEAD){
                let attacker = contArrY[i];
                let target:Contestant
                do{
                    target = contArrX[Math.floor(Math.random() * contArrX.length)];
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
                for(let j = 0; j < contArrX.length; j++){
                    if(contArrX[j].getCond() != Condition.DEAD){
                        break;
                    }
                    if(j == contArrX.length - 1){
                        //loot weapons
                        let tookweps:Array<number> = [];
                        for(let k = 0; k < contArrY.length; k++){
                            let wepnum = -1;
                            for(let n = 0; n < contArrX.length; n++){
                                if(!tookweps.includes(n) && contArrY[k].newWeapon(contArrX[n].getWeapon())){
                                    wepnum = n;
                                    break;
                                }
                            }
                            if(wepnum != -1){
                                tookweps.push(wepnum);
                                build.push(contArrY[k].getName() + " take " + contArrX[wepnum].getName() + "'s " + contArrX[wepnum].getWeapon().getName() + "\n");
                            }
                        }
                        //loot items
                        while(x.getItems().length > 0){
                            let tempitem:item = x.getItems().pop();
                            y.addItem(tempitem);
                            build.push(y.getName() + " take a " + tempitem.getName() + " from " + x.getName() + "\n");
                        }
                        //health report & finish
                        for(let g = 0; g < contArrY.length; g++){
                            build.push(contArrY[g].getName() + " ends the fight " + contArrY[g].getCondName() + "\n");
                        }
                        build.push(y.getName() + y.verbSwitchName(" wins ", " win ") + "the fight.");
                        return build;
                    }
                }
            }
        }
    }
    build.push("ERROR: combat loop exited without returning");
    return build;
}