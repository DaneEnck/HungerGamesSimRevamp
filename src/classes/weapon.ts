import Contestant from "./contestant";

/*throughout the game contestants can acquire weapons, used within the combat function in eventMulti.ts
any weapons added to weaponList can be accessed in eventSolo and eventGroup
*/
export class weapon{
    name: string;
    hitverb: string;//present tense verb describing use of the weapon, ex slashes for a sword, stabs for a dagger, etc
    hitadd: number;//number between 0 and 1 inclusive. added to damage oppurtunity as described in eventMulti
    blockadd: number;//number between 0 and 1 inclusive. subtracted from opponent's damage oppurtunity when user is being attacked
    damcap: number;//integer. the maximum number of condition stages this weapon can reduce with a single hit. 
    //weapons capable of instant lethality should be given an arbritrary damcap, like 0
    misfireChance: number;//number between 0 and 1 inclusive. the chance that the weapon will misfire when used. if the weapon cannot misfire, this should be 0
    misfire: Function;//function that returns a string array. if the weapon misfires, this function is called to describe the misfire. if the weapon cannot misfire, this should be {}
    //misfire functions should take the user, the target, and the weapon as arguments, and return a string array
    

    //default function value should only be used for weapons that cannot misfire!
    constructor(w:string,x:number,y:number,z:string,a:number, c:number, f:Function = function():string[]{return [""]}){
        this.name = w;
        this.hitadd = x;
        this.blockadd = y;
        this.hitverb = z;
        this.damcap = a;
        this.misfireChance = c;
        this.misfire = f;
    }

    getName():string{
        return this.name;
    }

    getHitVerb():string{
        return this.hitverb
    }

    getHitAdd():number{
        return this.hitadd;
    }

    getBlockAdd():number{
        return this.blockadd;
    }

    getDamCap():number{
        return this.damcap;
    }

    getMisfireChance():number{
        return this.misfireChance;
    }

    getMisfire():Function{
        return this.misfire;
    }

}

export class consumWep extends weapon{
    uses:number;
    constructor(w:string,x:number,y:number,z:string,a:number,b:number,c:number,f:Function = function():string[]{return [""]}){
        super(w,x,y,z,a,c,f);
        this.uses = b;
    }

    getUses():number{
        return this.uses;
    }

    downUses(x:number){
        this.uses -= x;
    }
}

export function cloneConsumWep(x:consumWep):consumWep{
    return new consumWep(x.getName(),x.getHitAdd(),x.getBlockAdd(),x.getHitVerb(),x.getDamCap(),x.getUses(),x.getMisfireChance(),x.getMisfire());
}

//(name, hitchance, blockchance, hitverb, damcap, misfirechance, misfirefunction (optional if chance = 0))
let wepList:Array<weapon> = [
    new weapon("sword",0.25,0,"slashes",0,0),
    new weapon("spear",0.2,0.1,"stabs",0,0),
    new weapon("trident",0.25,0.1,"stabs",0,0),
    new weapon("sickle",0.2,0,"slices",0,0),
    new weapon("mace",0.2,0,"bashes",0,0),
    new weapon("pair of sais",0.2,0.05,"stabs",0,0),
    new weapon("shield",0.1,0.2,"bashes",2,0),
    new weapon("hatchet",0.2,0,"chops",0,0),
    new weapon("axe",0.25,0,"chops",0,0),
    new weapon("dagger",0.15,0,"stabs",0,0),
    new weapon("bow",0.2,0,"shoots",0,0)
];

export default wepList;

export const consumWepList:Array<consumWep> = [
    new consumWep("explosive", 0.6, 0, "explodes", 0, 1,0.2,function(x:Contestant,y:Contestant,z:consumWep):string[]{
        if(Math.random() < 0.5){
            x.downCond(99);
            return [x.getName() + " tries to throw " + x.getPospronoun() + " explosive at " + y.getName() + ", but it explodes in " + x.getPospronoun() + " hands, killing " + x.getObjpronoun() + " instantly!"];
        }
        else{
            x.downCond(2);
            y.downCond(2);
            return [x.getName() + " tries to throw " + x.getPospronoun() + " explosive at " + y.getName() + ", but it lands short and explodes, injuring both of them moderately!"];
        }
    })
]

export const craftWeaponList:Array<weapon> = [
    new weapon("wooden spear",0.1,0.05,"stabs",0,0),
    new weapon("wooden club",0.10,0,"bashes",3,0),
    new weapon("large rock",0.05,0,"bashes",2,0)
];