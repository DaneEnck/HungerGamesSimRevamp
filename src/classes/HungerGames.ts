import Contestant from './contestant';
import { Condition } from './contestant';
import Group from './group';
import soloList from './eventSolo';
import groupList from './eventGroup';
import multiList from './eventMulti';
import { item } from './item';
import { groupCreateMain } from './eventGroup';
import { groupCreateList } from './eventGroup';
import { cornGroupList } from './eventCorn';
import { cornSoloList } from './eventCorn';
import { cornMultiList } from './eventCorn';
import type EventStruct from './eventStruct';
import { groupBetrayList } from './eventGroup';
import { cloneConsumWep, consumWepList } from './weapon';

let endCounter = 3;

let DEBUG_LOG_EVENTS = false;

//returns an array of EventStructs, each representing a single event
export default function hungerGames(parties:Array<Contestant|Group>,partyCopy:Array<Contestant|Group>,numConts:number,day:number):EventStruct[]{
    let buildarr:EventStruct[] = []
    if(partyCopy.length == 2){ //if two parties remain, force a multi event after 3 solo events
        endCounter--;
        if(endCounter <= 0){
            let eventint = Math.floor(Math.random()*multiList.length);
            buildarr.push(multiList[eventint](partyCopy[0], partyCopy[1]));
            return buildarr;
        }
    }
    for(let i = 0; i < partyCopy.length; i++){//item usage loop
        let itemuse: item;
        let numargs: number;
        let tempEvent: EventStruct;
        let randint: number;
        //chance to interupt item usage w/ random multi event
        //TODO: figure out why this happens so much (something wrong or bad luck?)
        if(partyCopy[i].getItems().length != 0 && partyCopy.length >= 2 && Math.random() < 0.1){
            do{
                randint = Math.floor(Math.random()*partyCopy.length);
            }while(randint == i);
            buildarr.push(multiList[Math.floor(Math.random()*multiList.length)](partyCopy[i], partyCopy[randint]));
            partyCopy.splice(Math.max(randint,i),1);
            partyCopy.splice(Math.min(randint,i),1);
            i--;
            if(randint < i){
                i--;
            }
            continue;
        }
        //check usage of all party's items
        for (let j = 0; j < (partyCopy[i]).getItems().length; j++){
            itemuse = partyCopy[i].getItems()[j];
            numargs = itemuse.getEvent().length;
            //self targetting item
            if(numargs == 2){
                tempEvent = itemuse.getEvent()(partyCopy[i],itemuse);
            }
            //targetting another contestant
            else if(numargs == 3 && partyCopy.length >= 2){
                do{
                randint = Math.floor(Math.random()*partyCopy.length);
                }while(randint == i);
                tempEvent = itemuse.getEvent()(partyCopy[i], partyCopy[randint], itemuse);
            }
            //failsafe
            else{
                buildarr.push({images:[],main:"Error: item " + itemuse.getName() + " has invalid number of arguments. or maybe theres too few contestants",combat:[]});
                break;
            }
            //use item if condition in item function is met
            if(tempEvent.main != "false"){
                if(itemuse.getUses() == 0){
                    partyCopy[i].getItems().splice(j,1);
                }
                if(numargs == 2){
                    buildarr.push(tempEvent);
                    partyCopy.splice(i,1);
                    i--;
                }
                else if(numargs == 3){
                    buildarr.push(tempEvent);
                    partyCopy.splice(Math.max(randint,i),1);
                    partyCopy.splice(Math.min(randint,i),1);
                    i--;
                    if(randint < i){
                        i--;
                    }
                }
                else{
                    buildarr.push({images:[],main:"Error: invalid number of arguments on item " + itemuse.getName(),combat:[]})
                }
                if(DEBUG_LOG_EVENTS){
                    console.log(buildarr[buildarr.length-1].main);
                }
                break;
            }
        }
    }
    while (partyCopy.length > 0){ //event selection loop
        let randnum: number;
        let eventint: number;
        let randcont1: number;
        let randcont2: number;
        let randcont3: number;
        let passes:number = 0;
        randnum = Math.random();
        if(day != 0){
            if(partyCopy.length >= 3 && randnum < 0.33 && partyCopy.length >= numConts / 2){//group creation
                randnum = Math.random();
                if(randnum < 0.5){//2 members
                    do{
                        randcont1 = Math.floor(Math.random()*partyCopy.length);
                        randcont2 = Math.floor(Math.random()*partyCopy.length); 
                    }while(randcont1 == randcont2);
                    parties.push(groupCreateMain([partyCopy[randcont1], partyCopy[randcont2]],groupCreateList));
                    buildarr.push({images:partyCopy[randcont1].getImage().concat(partyCopy[randcont2].getImage()),main:parties[parties.length-1].getString(),combat:[]});
                    partyCopy[randcont1].setIsInGroup(true);
                    partyCopy[randcont2].setIsInGroup(true);
                    partyCopy.splice(Math.max(randcont1,randcont2),1);
                    partyCopy.splice(Math.min(randcont1,randcont2),1);
                }
                else{//3 members
                    do{
                        randcont1 = Math.floor(Math.random()*partyCopy.length);
                        randcont2 = Math.floor(Math.random()*partyCopy.length);
                        randcont3 = Math.floor(Math.random()*partyCopy.length);
                    }while(randcont1 == randcont2 || randcont1 == randcont3 || randcont2 == randcont3);
                    let temparr = [randcont1, randcont2, randcont3];
                    parties.push(groupCreateMain([partyCopy[randcont1], partyCopy[randcont2], partyCopy[randcont3]], groupCreateList));
                    buildarr.push({images:partyCopy[randcont1].getImage().concat(partyCopy[randcont2].getImage().concat(partyCopy[randcont3].getImage())),main:parties[parties.length-1].getString(),combat:[]});
                    while(temparr.length > 0){
                        partyCopy[Math.max(...temparr)].setIsInGroup(true);
                        partyCopy.splice(Math.max(...temparr),1);
                        temparr.splice(temparr.indexOf(Math.max(...temparr)),1);
                    }
                }
            }
            else if(partyCopy.length == 1 || randnum < 0.5){ //solo event
                randcont1 = Math.floor(Math.random()*partyCopy.length);
                //individual
                if(partyCopy[randcont1] instanceof Contestant){
                    eventint = Math.floor(Math.random()*soloList.length);
                    buildarr.push(soloList[eventint](partyCopy[randcont1]));
                    partyCopy.splice(randcont1,1);
                }
                //group
                else{
                    //10% chance of betrayal event
                    if(randnum < 0.1){
                        eventint = Math.floor(Math.random()*groupBetrayList.length);
                        buildarr.push(groupBetrayList[eventint](partyCopy[randcont1]));
                    }
                    else{
                        eventint = Math.floor(Math.random()*groupList.length);
                        buildarr.push(groupList[eventint](partyCopy[randcont1]));
                    }
                    partyCopy.splice(randcont1,1);
                }
            }
            else{//multi event
                eventint = Math.floor(Math.random()*multiList.length);
                do{
                    randcont1 = Math.floor(Math.random()*partyCopy.length);
                    randcont2 = Math.floor(Math.random()*partyCopy.length);
                }while(randcont1 == randcont2);//ensure different contestants are used
                buildarr.push(multiList[eventint](partyCopy[randcont1], partyCopy[randcont2]));
                partyCopy.splice(Math.max(randcont1,randcont2),1);
                partyCopy.splice(Math.min(randcont1,randcont2),1);
            }
        }
        else{//cornucopia
            if (partyCopy.length == 1 || Math.random() < 0.66){
                randcont1 = Math.floor(Math.random()*partyCopy.length);
                eventint = Math.floor(Math.random()*cornSoloList.length);
                buildarr.push(cornSoloList[eventint](partyCopy[randcont1]));
                partyCopy.splice(randcont1,1);
            }
            else{
                eventint = Math.floor(Math.random()*cornMultiList.length);
                do{
                    randcont1 = Math.floor(Math.random()*partyCopy.length);
                    randcont2 = Math.floor(Math.random()*partyCopy.length);
                }while(randcont1 == randcont2);//ensure different contestants are used
                if (Math.random() < 0.2){
                    parties.push(groupCreateMain([partyCopy[randcont1], partyCopy[randcont2]],cornGroupList));
                    buildarr.push({images:partyCopy[randcont1].getImage().concat(partyCopy[randcont2].getImage()),main:parties[parties.length-1].getString(),combat:[]});
                    partyCopy[randcont1].setIsInGroup(true);
                    partyCopy[randcont2].setIsInGroup(true);
                    partyCopy.splice(Math.max(randcont1,randcont2),1);
                    partyCopy.splice(Math.min(randcont1,randcont2),1);
                }
                else{
                    buildarr.push(cornMultiList[eventint](partyCopy[randcont1], partyCopy[randcont2]));
                    partyCopy.splice(Math.max(randcont1,randcont2),1);
                    partyCopy.splice(Math.min(randcont1,randcont2),1);
                }
            }
        }
        if(DEBUG_LOG_EVENTS){
            console.log(buildarr[buildarr.length-1].main);
        }
        passes++;
        if(passes > 1000){
            console.log("Error: infinite loop in event selection");
            buildarr = [{images:[],main:"Error: infinite loop in event selection. The game is now unstable!",combat:[]}].concat(buildarr);
            break;
        }
    }
    if(DEBUG_LOG_EVENTS){
        console.log("\n");
    }
    //delete groups with no living members or one living member
    for(let i = numConts; i < parties.length; i++){
        let temp = parties[i];
        if(temp instanceof Group){//should always be true, have to make my compiler happy
            temp.purge();
            //delete groups whose members are all dead OR who have merged into a larger group
            if(temp.getConts().length == 0 || temp.getIsInGroup()){
                parties.splice(i,1);
                i--;
            }
            //delete group with one surviving member, adding said member back to the contestant pool
            else if(temp.getConts().length == 1){
                temp.getConts()[0].setIsInGroup(false);
                while(temp.getItems().length > 0 && temp.getConts()[0].getItems().length < 3){
                    temp.getConts()[0].getItems().push(temp.getItems()[0]);
                    temp.getItems().splice(0,1);
                }
                parties.splice(i,1);
                i--;
            }
        }
    }
    //clear items & weapons from dead contestants
    for(let i = 0; i < numConts; i++){
        if(parties[i].getCond() == Condition.DEAD){
            let temp = parties[i];
            temp.loseWeapon();
            while(temp.getItems().length > 0){
                temp.getItems().splice(0,1);
            }
            if (temp instanceof Contestant){ //should always be true (?)
                while(temp.getConsumWeps().length > 0){
                    temp.loseConsumWep(0);
                }
            }
        }
    }
    return buildarr;
}