import Contestant from "./contestant";
import Group from "./group";
import { item } from "./item";
import { Condition } from "./contestant";
import { weapon } from "./weapon";
import { consumWep } from "./weapon";

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
    for(let i = 0; i < contArrY.length; i++){
        for(let j = 0; j < contArrY[i].getConsumWeps().length; j++){
            let randmember = Math.floor(Math.random() * contArrX.length);
            contArrX[randmember].newConsumWeapon(contArrY[i].getConsumWeps()[j]);
            build.push(contArrX[randmember].getName() + contArrX[randmember].verbSwitchName(" takes "," take ") + "a " + contArrY[i].getConsumWeps()[j].getName() + " from " + contArrY[i].getName() + "\n");
        }
    }
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
function attack(contArrX:Contestant[], contArrY:Contestant[]):string[]{
    let tempbuild = [];
    for(let i = 0; i < contArrX.length; i++){
        if(contArrX[i].getCond() != Condition.DEAD){
            let attacker = contArrX[i];
            let target:Contestant;
            let attackWep:weapon|consumWep;
            let attackWepIndex:number = -1;
            //select best consumwep, if any
            if(attacker.getConsumWeps().length > 0){
                attackWep = attacker.getConsumWeps()[0]
                for(let j = 1; j < attacker.getConsumWeps().length; j++){
                    if(attacker.getConsumWeps()[j].getHitAdd() > attackWep.getHitAdd()){
                        attackWep = attacker.getConsumWeps()[j];
                        attackWepIndex = j;
                    }
                }
            }
            else{
                attackWep = attacker.getWeapon();
            }
            do{
                target = contArrY[Math.floor(Math.random() * contArrY.length)];
            }while(target.getCond() == Condition.DEAD)
            if(Math.random() < attackWep.getMisfireChance()){
                tempbuild = tempbuild.concat(attackWep.getMisfire()(attacker, target,attackWep));
            }
            let randNum = Math.random() + attackWep.getHitAdd() - target.getWeapon().getBlockAdd();
            if(randNum < 0.4){
                tempbuild.push(attacker.getName() + " misses\n");
            }
            else{
                let minibuild = "";
                minibuild += attacker.getName() + " " + attackWep.getHitVerb() + " " + target.getName();
                if (randNum < 0.6 || attackWep.getDamCap() == 1){
                    minibuild += " in the " + target.bodylight[Math.floor(Math.random() * target.bodylight.length)] 
                    + " with " + attacker.getPospronoun() + " " + attackWep.getName() + ", injuring " + target.getObjpronoun() + " slightly\n";
                    target.downCond(1);
                }
                else if (randNum < 0.8 || attackWep.getDamCap() == 2){
                    minibuild += " in the " + target.bodymed[Math.floor(Math.random() * target.bodymed.length)] 
                    + " with " + attacker.getPospronoun() + " " + attackWep.getName() + ", injuring " + target.getObjpronoun() + " moderately\n";
                    target.downCond(2);
                }
                else if (randNum < 0.9 || attackWep.getDamCap() == 3){
                    minibuild += " in the " + target.bodyheavy[Math.floor(Math.random() * target.bodyheavy.length)] 
                    + " with " + attacker.getPospronoun() + " " + attackWep.getName() + ", injuring " + target.getObjpronoun() + " severely\n";
                    target.downCond(3);
                }
                else{
                    minibuild += " in the " + target.bodyheavy[Math.floor(Math.random() * target.bodyheavy.length)] 
                    + " with " + attacker.getPospronoun() + " " + attackWep.getName() + ", killing " + target.getObjpronoun();" instantly\n";
                    target.setCond(Condition.DEAD);
                }
                tempbuild.push(minibuild);
            }
            if(attackWep instanceof consumWep){
                attackWep.downUses(1);
                if(attackWep.getUses() <= 0){
                    attacker.loseConsumWep(attackWepIndex);
                    tempbuild.push(attacker.getName() + " uses up " + attacker.getPospronoun() + " " + attackWep.getName() + "\n");
                }
            }
            //check if target is dead
            if(target.getCond() == Condition.DEAD){
                tempbuild.push(target.getName() + " is dead!\n");
                attacker.upKills(1);
            }
        }
    }
    return tempbuild;
}

//if y is all dead, x loots y and wins, returns a multi-line string describing the loot and the condition of all members
function checkCombatEnd(x:Contestant|Group, y:Contestant|Group, contArrX:Contestant[], contArrY:Contestant[]):string[]{
    let tempbuild = [];
    for(let j = 0; j < contArrY.length; j++){
        if(contArrY[j].getCond() != Condition.DEAD){
            break;
        }
        if(j == contArrY.length - 1){
            tempbuild = tempbuild.concat(loot(x,y));
            for(let g = 0; g < contArrX.length;g++){
                tempbuild.push(contArrX[g].getName() + " ends the fight " + contArrX[g].getCondName() + "\n");
            }
            tempbuild.push(x.getName() + x.verbSwitchName(" wins "," win ") + "the fight.");
            return tempbuild;
            
        }
    }
    return [];
}

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
    console.log(build)
    let arr1: string[], arr2: string[], first: boolean = true;
    //attacking loop
    while(true){
        //x attacks y
        build = build.concat(attack(contArrX,contArrY))
        //check if either party is dead, if so, return the combat end string
        arr1 = checkCombatEnd(x,y,contArrX,contArrY);
        arr2 = checkCombatEnd(y,x,contArrY,contArrX);
        if(arr1.length > 0 && arr2.length > 0){
            build.push("All combatants died!")
            return build;
        }
        else if(arr1.length > 0){
            build = build.concat(arr1);
            return build;
        }
        else if(arr2.length > 0){
            build = build.concat(arr2);
            return build;
        }
        //y attacks x
        build = build.concat(attack(contArrY,contArrX))
        //check if either party is dead, if so, return the combat end string
        arr1 = checkCombatEnd(x,y,contArrX,contArrY);
        arr2 = checkCombatEnd(y,x,contArrY,contArrX);
        if(arr1.length > 0 && arr2.length > 0){
            build.push("All combatants died!")
            return build;
        }
        else if(arr1.length > 0){
            build = build.concat(arr1);
            return build;
        }
        else if(arr2.length > 0){
            build = build.concat(arr2);
            return build;
        }
        first = false;
    }
    build.push("ERROR: combat loop exited without returning");
    return build;
}