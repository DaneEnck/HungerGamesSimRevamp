import Contestant from "./contestant";
import { Condition } from "./contestant";
import { weapon } from "./weapon";
import Group from "./group";

/*items can be acquired by contestants/groups throughout the game
what each individual item does is hard coded in the event field, stored as a function
every item function should be passed the contestant/group using it, and optionally another contestant/group
main game loop will check for number of args before passing
every item function should have a string return describing how the item was used, or return the string "false" if the item was not used
any items added to itemList can be accessed randomly
any items added to craftItemList should only be accessed by events which specifically call for them
*/
export class item{
    name: string;
    uses: number;
    event: Function;

    constructor(x:string,y:number,z:Function){
        this.name = x;
        this.uses = y;
        this.event = z;
    }

    getName():string{
        return this.name;
    }

    getUses():number{
        return this.uses;
    }

    getEvent():Function{
        return this.event;
    }

    upUses(x:number):void{
        this.uses += x;
    }

    downUses(x:number):void{
        this.uses -= x;
    }
    
}

//general items, can be given by sponsors or called specifically
let itemList:Array<item> = [
    new item("medkit",1,function(x:Contestant|Group,y:item):string{
        if(x instanceof Contestant){
            if(x.getCond() < 4){
                x.upCond(2);
                y.downUses(1);
                return x.getName() + " uses a medkit and is now " + x.getCondName();
            }
            return "false";
        }
        else{
            let tempnum:number = 0;
            let randnum;
            for(let i = 1; i < x.getConts().length; i++){
                if(x.getConts()[i].getCond() < x.getConts()[tempnum].getCond()){
                    tempnum = i;
                }
            }
            if(x.getConts()[tempnum].getCond() < 4){
                do{
                    randnum = Math.floor(Math.random() * x.getConts().length);
                }while(tempnum == randnum)
                x.getConts()[tempnum].upCond(2);
                y.downUses(1);
                return x.getConts()[randnum].getName() + " uses a medkit on " + x.getConts()[tempnum].getName() + ". " + x.getConts()[tempnum].getPronoun() + " is now " + x.getConts()[tempnum].getCondName();
            }
            return "false";
        }
    }),
    new item("bottle of clean water",1,function(x:Contestant|Group,y:item){
        if(x instanceof Contestant){
            if(x.getCond() < 4){
                x.upCond(1);
                y.downUses(1);
                return x.getName() + " drinks some of " + x.getPospronoun() + "water and is now " + x.getCondName();
            }
            return "false";
        }
        else{
            let tempnum:number = 0;
            for(let i = 1; i < x.getConts().length; i++){
                if(x.getConts()[i].getCond() < x.getConts()[tempnum].getCond()){
                    tempnum = i;
                }
            }
            if(x.getConts()[tempnum].getCond() < 4){
                x.getConts()[tempnum].upCond(1);
                y.downUses(1);
                return x.getConts()[tempnum].getName() + " drinks some of the group's water and is now " + x.getConts()[tempnum].getCondName();
            }
            return "false";
        }
    }),
    new item("food ration",1,function(x:Contestant|Group,y:item){
        if(x instanceof Contestant){
            if(x.getCond() < 4){
                x.upCond(1);
                y.downUses(1);
                return x.getName() + " eats some of " + x.getPospronoun() + " food ration and is now " + x.getCondName();
            }
            return "false";
        }
        else{
            let tempnum:number = 0;
            for(let i = 1; i < x.getConts().length; i++){
                if(x.getConts()[i].getCond() < x.getConts()[tempnum].getCond()){
                    tempnum = i;
                }
            }
            if(x.getConts()[tempnum].getCond() < 4){
                x.getConts()[tempnum].upCond(1);
                y.downUses(1);
                return x.getConts()[tempnum].getName() + " eats some of the group's fresh food and is now " + x.getConts()[tempnum].getCondName();
            }
            return "false";
        }
    })
]

//returns copy of given item with separate memory
export function itemClone(x:item):item{
    return new item(x.getName(),x.getUses(),x.getEvent());
}

export default itemList;

//items which only appear when events call for a particular item (should not be accessed randomly)
export const craftItemList:Array<item> = [
    //0 meat 1 fish 2 fruit 3 berries
    new item("meat",1,function(x:Contestant|Group,y:item){
        if(x instanceof Contestant){
            if(x.getCond() < 4){
                x.upCond(1);
                y.downUses(1);
                return x.getName() + " eats some meat and is now " + x.getCondName();
            }
            return "false";
        }
        else{
            let tempnum:number = 0;
            for(let i = 1; i < x.getConts().length; i++){
                if(x.getConts()[i].getCond() < x.getConts()[tempnum].getCond()){
                    tempnum = i;
                }
            }
            if(x.getConts()[tempnum].getCond() < 4){
                x.getConts()[tempnum].upCond(1);
                y.downUses(1);
                return x.getConts()[tempnum].getName() + " eats some meat and is now " + x.getConts()[tempnum].getCondName();
            }
            return "false";
        }
    }),
    new item("fish",1,function(x:Contestant|Group,y:item){
        if(x instanceof Contestant){
            if(x.getCond() < 4){
                x.upCond(1);
                y.downUses(1);
                return x.getName() + " eats some fish and is now " + x.getCondName();
            }
            return "false";
        }
        else{
            let tempnum:number = 0;
            for(let i = 1; i < x.getConts().length; i++){
                if(x.getConts()[i].getCond() < x.getConts()[tempnum].getCond()){
                    tempnum = i;
                }
            }
            if(x.getConts()[tempnum].getCond() < 4){
                x.getConts()[tempnum].upCond(1);
                y.downUses(1);
                return x.getConts()[tempnum].getName() + " eats some fish and is now " + x.getConts()[tempnum].getCondName();
            }
            return "false";
        }
    }),
    new item("fruit",1,function(x:Contestant|Group,y:item){
        if(x instanceof Contestant){
            if(x.getCond() < 4){
                x.upCond(1);
                y.downUses(1);
                return x.getName() + " eats some fruit and is now " + x.getCondName();
            }
            return "false";
        }
        else{
            let tempnum:number = 0;
            for(let i = 1; i < x.getConts().length; i++){
                if(x.getConts()[i].getCond() < x.getConts()[tempnum].getCond()){
                    tempnum = i;
                }
            }
            if(x.getConts()[tempnum].getCond() < 4){
                x.getConts()[tempnum].upCond(1);
                y.downUses(1);
                return x.getConts()[tempnum].getName() + " eats some fruit and is now " + x.getConts()[tempnum].getCondName();
            }
            return "false";
        }
    }),
    new item("berries",1,function(x:Contestant|Group,y:item){
        if(x instanceof Contestant){
            if(x.getCond() < 4){
                y.downUses(1);
                let randnum = Math.random();
                if (randnum < 0.6){
                    x.upCond(1);
                    return x.getName() + " eats some berries and is now " + x.getCondName();
                }
                else if (randnum < 0.9){
                    x.downCond(1);
                    return x.getName() + " eats some berries, but they're poisonous! " + x.getPronoun() + x.verbSwitchPro(" is "," are ") + " now " + x.getCondName();
                }
                else{
                    x.downCond(99); //lol
                    return x.getName() + " eats some berries, but they're extremely poisonous, killing " + x.getObjpronoun() + " instantly!";
                }
            }
            return "false";
        }
        else{
            let tempnum:number = 0;
            for(let i = 1; i < x.getConts().length; i++){
                if(x.getConts()[i].getCond() < x.getConts()[tempnum].getCond()){
                    tempnum = i;
                }
            }
            if(x.getConts()[tempnum].getCond() < 4){
                y.downUses(1);
                let randnum = Math.random();
                if (randnum < 0.6){
                    x.getConts()[tempnum].upCond(1);
                    return x.getConts()[tempnum].getName() + " eats some berries and is now " + x.getConts()[tempnum].getCondName();
                }
                else if (randnum < 0.9){
                    x.getConts()[tempnum].downCond(1);
                    return x.getConts()[tempnum].getName() + " eats some berries, but they're poisonous! " + x.getConts()[tempnum].getPronoun() + x.getConts()[tempnum].verbSwitchPro(" is "," are ") + " now " + x.getConts()[tempnum].getCondName();
                }
                else{
                    x.getConts()[tempnum].downCond(99); //lol
                    return x.getConts()[tempnum].getName() + " eats some berries, but they're extremely poisonous, killing " + x.getConts()[tempnum].getObjpronoun() + " instantly!";
                }
            }
            return "false";
        }
    })
];