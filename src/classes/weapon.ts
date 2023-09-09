/*throughout the game contestants can acquire weapons, used within the combat function in eventMulti.ts
any weapons added to weaponList can be accessed in eventSolo and eventGroup
*/
export class weapon{
    name: string;
    hitverb: string;//present tense verb describing use of the weapon, ex slashes for a sword, stabs for a dagger, etc
    hitadd: number;//number between 0 and 1 inclusive. added to damage oppurtunity as described in eventMulti
    blockadd: number;//number between 0 and 1 inclusive. subtracted from opponent's damage oppurtunity when user is being attacked
    damcap: number;//integer. the maximum number of condition stages this weapon can reduce with a single hit. 
    //weapons capable of instant lethality should be given an arbritrary damcap, like -1

    constructor(w:string,x:number,y:number,z:string,a:number){
        this.name = w;
        this.hitadd = x;
        this.blockadd = y;
        this.hitverb = z;
        this.damcap = a;
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

}

let wepList:Array<weapon> = [
    new weapon("sword",0.25,0,"slashes",0),
    new weapon("spear",0.2,0.1,"stabs",0),
    new weapon("trident",0.25,0.1,"stabs",0),
    new weapon("sickle",0.2,0,"slices",0),
    new weapon("mace",0.2,0,"bashes",0),
    new weapon("pair of sais",0.2,0.05,"stabs",0),
    new weapon("shield",0.1,0.2,"bashes",2),
    new weapon("hatchet",0.2,0,"chops",0),
    new weapon("axe",0.25,0,"chops",0),
    new weapon("dagger",0.15,0,"stabs",0)
];

export default wepList;

export const craftWeaponList:Array<weapon> = [
    new weapon("wooden spear",0.1,0.05,"stabs",0),
    new weapon("wooden club",0.10,0,"bashes",3),
    new weapon("large rock",0.05,0,"bashes",2)
];