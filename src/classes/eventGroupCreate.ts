import Contestant from "./contestant";
import { Condition } from "./contestant";
import { weapon } from "./weapon";
import { item } from "./item";
import Group from "./group";

let groupCreateList: Array<Function> = [
    function(x: Array<Contestant|Group>):Group{
        let tempGroup:Group = new Group(x, [], "");
        let build:string = "";
        if(x.length <= 1){
            tempGroup.setString("error, only one member in group, this shouldn't happen");
            return tempGroup;
        }
        else if(x.length == 2){
            build += x[0].getName() + " and " + x[1].getName() + " form an alliance";
        }
        else{
            for(let i = 0; i < x.length - 1; i++){//create string
                build += x[i].getName() + ", ";
            }
            build += "and " + x[x.length - 1].getName() + " form an alliance";
        }
        tempGroup.setString(build);
        for(let i = 0; i < x.length; i++){//transfer items
            for(let j = 0; j < x[i].getItems().length; j++){
                tempGroup.getItems().push(x[i].getItems()[j]);
                x[i].getItems().splice(j,1);
            }
        }
        return tempGroup;
    }
];

export default groupCreateList;
