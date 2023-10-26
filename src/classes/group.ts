import Contestant from './contestant';
import { Condition } from './contestant';
import { weapon } from './weapon';
import { item } from './item';

export default class Group{
    ppl: Contestant[];
    items: item[];
    creationString: string = "";
    isInGroup:boolean;

    //when group is created, combine all individuals' items into one array then delete all items from individuals
    constructor(thePpl: Array<Contestant|Group>, theItems: item[], theString: string){
        let newarr: Contestant[] = [];
        for(let i = 0; i < thePpl.length; i++){
            let temp = thePpl[i];
            if(temp instanceof Group){
                for (let j = 0; j < temp.getConts().length; j++){
                    newarr.push(temp.getConts()[j]);
                }
            }
            else{
                newarr.push(temp);
            }
        }
        this.ppl = newarr;
        this.items = theItems;
        this.creationString = theString;
        this.isInGroup = false;
    }

    isGroup(): boolean{
        return true
    }

    getName():string{
        if (this.ppl.length <= 1){
            return this.ppl[0].getName();
        }
        else if(this.ppl.length == 2){
            return this.ppl[0].getName() + " and " + this.ppl[1].getName();
        }
        else{
            let build:string = "";
            for(let i = 0; i < this.ppl.length - 1; i++){
                build += this.ppl[i].getName() + ", ";
            }
            build += "and " + this.ppl[this.ppl.length - 1].getName();
            return build;
        }
    }

    getConts():Contestant[]{
        return this.ppl;
    }

    getItems():item[]{
        return this.items;
    }

    addItem(x: item):void{
        this.items.push(x);
    }

    loseItem(x: number):boolean{
        if(this.items.length > 0){
            this.items.splice(x,1);
            return true;
        }
        return false;
    }

    newMember(x:Contestant):void{
        this.ppl.push(x);
    }

    loseMember(y: number):void{
        this.ppl[y].setIsInGroup(false);
        this.ppl.splice(y,1);
    }
    
    setString(x:string):void{
        this.creationString = x;
    }

    getString():string{
        return this.creationString;
    }

    setIsInGroup(x:boolean):void{
        this.isInGroup = x;
    }
    
    getIsInGroup():boolean{
        return this.isInGroup;
    }

    purge():void{
        //remove dead members of group
        for(let j = 0; j < this.ppl.length; j++){
            if(this.ppl[j].getCond() == 0){
                this.ppl.splice(j,1);
                j--;
            }
        }
    }

    //polymorphic, selects verb based on pronoun (used for subject-verb agreement)
    verbSwitchPro(x:string,y:string):string{
        return y;
    }

    //polymorphic, selects verb based on if called on (used for subject-verb agreement)
    verbSwitchName(x:string,y:string):string{
        return y;
    }

    getPronoun():string{
        return "they";
    }

    getObjpronoun():string{
        return "them";
    }

    getPospronoun():string{
        return "their";
    }

    //returns array of images of all members of group
    getImage():string[]{
        let temparr:string[] = [];
        for(let i = 0; i < this.ppl.length; i++){
            temparr.push(this.ppl[i].getImage()[0]);
        }
        return temparr;
    }

    //none of these should be used
    //TODO: improve type checking so these aren't needed
    getCond():Condition{console.log("ERROR: getCond called on group"); return Condition.HEALTHY;}
    loseWeapon(){console.log("ERROR: loseWeapon called on group")}
}
