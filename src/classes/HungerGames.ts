import Contestant from './contestant';
import { Condition } from './contestant';
import Group from './group';
import wepList from './weapon';
import soloList from './eventSolo';
import groupList from './eventGroup';
import multiList from './eventMulti';
import { item } from './item';
import itemList from './item';
import groupCreateList from './eventGroupCreate';
import { cornSoloList } from './eventCorn';
import { cornMultiList } from './eventCorn';
import type EventStruct from './eventStruct';

let endCounter = 3;

//returns an array of EventStructs, each representing a single event
export default function hungerGames(contestants:Array<Contestant|Group>,contCopy:Array<Contestant|Group>,numConts:number,day:number):EventStruct[]{
    let buildarr:EventStruct[] = []
    if(contCopy.length == 2){ //if two parties remain, force a multi event after 3 solo events
        endCounter--;
        if(endCounter <= 0){
            let eventint = Math.floor(Math.random()*multiList.length);
            buildarr.push(multiList[eventint](contCopy[0], contCopy[1]));
            return buildarr;
        }
    }
    for(let i = 0; i < contCopy.length; i++){//item usage loop
        let itemuse: item;
        let numargs: number;
        let str: string;
        let randint: number;
        //chance to interupt item usage w/ random multi event
        //TODO: figure out why this happens so much (something wrong or bad luck?)
        if(contCopy[i].getItems().length != 0 && contCopy.length >= 2 && Math.random() < 0.1){
            do{
                randint = Math.floor(Math.random()*contCopy.length);
            }while(randint == i);
            buildarr.push(multiList[Math.floor(Math.random()*multiList.length)](contCopy[i], contCopy[randint]));
            contCopy.splice(Math.max(randint,i),1);
            contCopy.splice(Math.min(randint,i),1);
            i--;
            if(randint < i){
                i--;
            }
            continue;
        }
        //check usage of all party's items
        for (let j = 0; j < (contCopy[i]).getItems().length; j++){
            itemuse = contCopy[i].getItems()[j];
            numargs = itemuse.getEvent().length;
            if(numargs == 2){
                str = itemuse.getEvent()(contCopy[i],itemuse);
            }
            else if(numargs == 3 && contCopy.length >= 2){
                do{
                randint = Math.floor(Math.random()*contCopy.length);
                }while(randint == i);
                str = itemuse.getEvent()(contCopy[i], contCopy[randint], itemuse);
            }
            else{
                buildarr.push({images:[],main:"Error: item " + itemuse.getName() + " has invalid number of arguments. or maybe theres too few contestants",combat:[]});
                break;
            }
            if(str != "false"){
                if(numargs == 2){
                    buildarr.push({images:contCopy[i].getImage(),main:str,combat:[]});
                    contCopy.splice(i,1);
                    i--;
                }
                else if(numargs == 3){
                    buildarr.push({images:contCopy[i].getImage().concat(contCopy[randint].getImage()),main:str,combat:[]});
                    contCopy.splice(Math.max(randint,i),1);
                    contCopy.splice(Math.min(randint,i),1);
                    i--;
                    if(randint < i){
                        i--;
                    }
                }
                else{
                    buildarr.push({images:[],main:"Error: invalid number of arguments on item " + itemuse.getName(),combat:[]})
                }
                if(itemuse.getUses() == 0){
                    contCopy[i].getItems().splice(j,1);
                }
                break;
            }
        }
    }
    while (contCopy.length > 0){ //event selection loop
        let randnum: number;
        let eventint: number;
        let randcont1: number;
        let randcont2: number;
        let randcont3: number;
        let temp: number;
        randnum = Math.random();
        if(day != 0){
            if(contCopy.length >= 3 && randnum < 0.33 && contCopy.length >= numConts / 2){//group creation
                randnum = Math.random();
                if(randnum < 0.5){//2 members
                    do{
                        randcont1 = Math.floor(Math.random()*contCopy.length);
                        randcont2 = Math.floor(Math.random()*contCopy.length); 
                    }while(randcont1 == randcont2);
                    contestants.push(groupCreateList[Math.floor(Math.random()*groupCreateList.length)]([contCopy[randcont1], contCopy[randcont2]]));
                    buildarr.push({images:contCopy[randcont1].getImage().concat(contCopy[randcont2].getImage()),main:contestants[contestants.length-1].getString(),combat:[]});
                    contCopy[randcont1].setIsInGroup(true);
                    contCopy[randcont2].setIsInGroup(true);
                    contCopy.splice(Math.max(randcont1,randcont2),1);
                    contCopy.splice(Math.min(randcont1,randcont2),1);
                }
                else{//3 members
                    do{
                        randcont1 = Math.floor(Math.random()*contCopy.length);
                        randcont2 = Math.floor(Math.random()*contCopy.length);
                        randcont3 = Math.floor(Math.random()*contCopy.length);
                    }while(randcont1 == randcont2 || randcont1 == randcont3 || randcont2 == randcont3);
                    let temparr = [randcont1, randcont2, randcont3];
                    contestants.push(groupCreateList[Math.floor(Math.random()*groupCreateList.length)]([contCopy[randcont1], contCopy[randcont2], contCopy[randcont3]]));
                    buildarr.push({images:contCopy[randcont1].getImage().concat(contCopy[randcont2].getImage().concat(contCopy[randcont3].getImage())),main:contestants[contestants.length-1].getString(),combat:[]});
                    while(temparr.length > 0){
                        contCopy[Math.max(...temparr)].setIsInGroup(true);
                        contCopy.splice(Math.max(...temparr),1);
                        temparr.splice(temparr.indexOf(Math.max(...temparr)),1);
                    }
                }
            }
            else if(contCopy.length == 1 || randnum < 0.5){ //solo event
                randcont1 = Math.floor(Math.random()*contCopy.length);
                if(contCopy[randcont1] instanceof Contestant){
                    eventint = Math.floor(Math.random()*soloList.length);
                    buildarr.push(soloList[eventint](contCopy[randcont1]));
                    contCopy.splice(randcont1,1);
                }
                else{
                    eventint = Math.floor(Math.random()*groupList.length);
                    buildarr.push(groupList[eventint](contCopy[randcont1]));
                    contCopy.splice(randcont1,1);
                }
            }
            else{//multi event
                eventint = Math.floor(Math.random()*multiList.length);
                do{
                    randcont1 = Math.floor(Math.random()*contCopy.length);
                    randcont2 = Math.floor(Math.random()*contCopy.length);
                }while(randcont1 == randcont2);//ensure different contestants are used
                buildarr.push(multiList[eventint](contCopy[randcont1], contCopy[randcont2]));
                contCopy.splice(Math.max(randcont1,randcont2),1);
                contCopy.splice(Math.min(randcont1,randcont2),1);
            }
        }
        else{//cornucopia
            if (contCopy.length == 1 || Math.random() < 0.66){
                randcont1 = Math.floor(Math.random()*contCopy.length);
                eventint = Math.floor(Math.random()*cornSoloList.length);
                buildarr.push(cornSoloList[eventint](contCopy[randcont1]));
                contCopy.splice(randcont1,1);
            }
            else{
                eventint = Math.floor(Math.random()*cornMultiList.length);
                do{
                    randcont1 = Math.floor(Math.random()*contCopy.length);
                    randcont2 = Math.floor(Math.random()*contCopy.length);
                }while(randcont1 == randcont2);//ensure different contestants are used
                buildarr.push(cornMultiList[eventint](contCopy[randcont1], contCopy[randcont2]));
                contCopy.splice(Math.max(randcont1,randcont2),1);
                contCopy.splice(Math.min(randcont1,randcont2),1);
            }
        }
    }
    console.log("\n");
    //delete groups with no living members or one living member
    for(let i = numConts; i < contestants.length; i++){
        let temp = contestants[i];
        if(temp instanceof Group){//should always be true, have to make my compiler happy
            temp.purge();
            //delete groups whose members are all dead OR who have merged into a larger group
            if(temp.getConts().length == 0 || temp.getIsInGroup()){
                contestants.splice(i,1);
                i--;
            }
            //delete group with one surviving member, adding said member back to the contestant pool
            else if(temp.getConts().length == 1){
                temp.getConts()[0].setIsInGroup(false);
                while(temp.getItems().length > 0 && temp.getConts()[0].getItems().length < 3){
                    temp.getConts()[0].getItems().push(temp.getItems()[0]);
                    temp.getItems().splice(0,1);
                }
                contestants.splice(i,1);
                i--;
            }
        }
    }
    //clear items & weapons from dead contestants
    for(let i = 0; i < numConts; i++){
        if(contestants[i].getCond() == Condition.DEAD){
            contestants[i].loseWeapon();
            while(contestants[i].getItems().length > 0){
                contestants[i].getItems().splice(0,1);
            }
        }
    }
    return buildarr;
}