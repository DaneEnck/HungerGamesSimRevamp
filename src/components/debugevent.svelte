<script lang="ts">
    import Contestant from '../classes/contestant';
    import Group from '../classes/group';
    import type EventStruct from '../classes/eventStruct';
    import { cornSoloList } from '../classes/eventCorn';
    import { cornMultiList } from '../classes/eventCorn';
    import soloList from '../classes/eventSolo';
    import groupList from '../classes/eventGroup';
    import multiList from '../classes/eventMulti';
    import { groupBetrayList } from '../classes/eventGroup';

    //when debug button is clicked
	const debugHandler = () => {
		//run every event 10 times, printing to console. used to check all events for errors/crashes
		let testCont1:Contestant
		let testCont2:Contestant
		let testGroup1:Group
		let testGroup2:Group
		let tempstruct:EventStruct
		console.log("---SOLO EVENTS---")
		for(let i = 0; i < soloList.length; i++){
			for (let j = 0; j < 10; j++){
				testCont1 = new Contestant("test1" ,"he","him","his","Default.png");
				tempstruct = soloList[i](testCont1);
			}
			console.log(tempstruct.main);
			console.log(tempstruct.combat);
		}
		console.log("---GROUP EVENTS (2 MEMBERS)---")
		for(let i = 0; i < groupList.length; i++){
			for (let j = 0; j < 10; j++){
				testGroup1 = new Group([new Contestant("test1" ,"he","him","his","Default.png"),new Contestant("test2" ,"he","him","his","Default.png")],[],"");
                tempstruct = groupList[i](testGroup1);
			}
			console.log(tempstruct.main);
			console.log(tempstruct.combat);
		}
		console.log("---GROUP EVENTS (3 MEMBERS)---")
		for(let i = 0; i < groupList.length; i++){
			for (let j = 0; j < 10; j++){
				testGroup1 = new Group([new Contestant("test1" ,"he","him","his","Default.png"),new Contestant("test2" ,"he","him","his","Default.png"),new Contestant("test3" ,"he","him","his","Default.png")],[],"");
				tempstruct = groupList[i](testGroup1);
			}
			console.log(tempstruct.main);
			console.log(tempstruct.combat);
		}
		console.log("---CORN SOLO EVENTS---")
		for(let i = 0; i < cornSoloList.length; i++){
			for (let j = 0; j < 10; j++){
				testCont1 = new Contestant("test1" ,"he","him","his","Default.png");
				tempstruct = cornSoloList[i](testCont1);
			}
			console.log(tempstruct.main);
			console.log(tempstruct.combat);
		}
		console.log("---CORN GROUP EVENTS (2 MEMBERS)---")
		for(let i = 0; i < cornMultiList.length; i++){
			for (let j = 0; j < 10; j++){
				testCont1 = new Contestant("test1" ,"he","him","his","Default.png");
				testCont2 = new Contestant("test2" ,"he","him","his","Default.png");
				tempstruct = cornMultiList[i](testCont1,testCont2);
			}
			console.log(tempstruct.main);
			console.log(tempstruct.combat);
		}
		console.log("---MULTI EVENT (CONT AND CONT)---")
		for(let i = 0; i < multiList.length; i++){
			for (let j = 0; j < 10; j++){
				testCont1 = new Contestant("test1" ,"he","him","his","Default.png");
				testCont2 = new Contestant("test2" ,"he","him","his","Default.png");
				tempstruct = multiList[i](testCont1,testCont2);
			}
			console.log(tempstruct.main);
			console.log(tempstruct.combat);
		}
		console.log("---MULTI EVENT (CONT AND GROUP)---")
		for(let i = 0; i < multiList.length; i++){
			for (let j = 0; j < 5; j++){
				testCont1 = new Contestant("test1" ,"he","him","his","Default.png");
				testGroup1 = new Group([new Contestant("test2" ,"he","him","his","Default.png"),new Contestant("test3" ,"he","him","his","Default.png")],[],"");
				tempstruct = multiList[i](testCont1,testGroup1);
			}
			for (let j = 0; j < 5; j++){
				testCont1 = new Contestant("test1" ,"he","him","his","Default.png");
				testGroup1 = new Group([new Contestant("test2" ,"he","him","his","Default.png"),new Contestant("test3" ,"he","him","his","Default.png"),new Contestant("test4","he","him","his","Defauly.png")],[],"");
				tempstruct = multiList[i](testGroup1,testCont1);
			}
			console.log(tempstruct.main);
			console.log(tempstruct.combat);
		}
        console.log("---MULTI EVENT (GROUP AND CONT)---")
        for(let i = 0; i < multiList.length; i++){
            for (let j = 0; j < 5; j++){
                testGroup1 = new Group([new Contestant("test1" ,"he","him","his","Default.png"),new Contestant("test2" ,"he","him","his","Default.png")],[],"");
                testCont1 = new Contestant("test3" ,"he","him","his","Default.png");
                tempstruct = multiList[i](testGroup1,testCont1);
            }
            for (let j = 0; j < 5; j++){
                testGroup1 = new Group([new Contestant("test1" ,"he","him","his","Default.png"),new Contestant("test2" ,"he","him","his","Default.png"),new Contestant("test3" ,"he","him","his","Default.png")],[],"");
                testCont1 = new Contestant("test4" ,"he","him","his","Default.png");
                tempstruct = multiList[i](testGroup1,testCont1);
            }
            console.log(tempstruct.main);
            console.log(tempstruct.combat);
        }
        console.log("---MULTI EVENT (GROUP AND GROUP)---")
        for(let i = 0; i < multiList.length; i++){
            for (let j = 0; j < 5; j++){
                testGroup1 = new Group([new Contestant("test1" ,"he","him","his","Default.png"),new Contestant("test2" ,"he","him","his","Default.png")],[],"");
                testGroup2 = new Group([new Contestant("test3" ,"he","him","his","Default.png"),new Contestant("test4" ,"he","him","his","Default.png"),new Contestant("test5","he","him","his","Default.png")],[],"");
                tempstruct = multiList[i](testGroup1,testGroup2);
            }
            for (let j = 0; j < 5; j++){
                testGroup1 = new Group([new Contestant("test1" ,"he","him","his","Default.png"),new Contestant("test2" ,"he","him","his","Default.png"),new Contestant("test3" ,"he","him","his","Default.png")],[],"");
                testGroup2 = new Group([new Contestant("test4" ,"he","him","his","Default.png"),new Contestant("test5" ,"he","him","his","Default.png")],[],"");
                tempstruct = multiList[i](testGroup1,testGroup2);
            }
            console.log(tempstruct.main);
            console.log(tempstruct.combat);
        }
        console.log("---BETRAY EVENT---")
        for(let i = 0; i < groupBetrayList.length; i++){
            for (let j = 0; j < 5; j++){
                testGroup1 = new Group([new Contestant("test1" ,"he","him","his","Default.png"),new Contestant("test2" ,"he","him","his","Default.png")],[],"");
                tempstruct = groupBetrayList[i](testGroup1);
            }
            for (let j = 0; j < 5; j++){
                testGroup1 = new Group([new Contestant("test1" ,"he","him","his","Default.png"),new Contestant("test2" ,"he","him","his","Default.png"),new Contestant("test3" ,"he","him","his","Default.png")],[],"");
                tempstruct = groupBetrayList[i](testGroup1);
            }
            console.log(tempstruct.main);
            console.log(tempstruct.combat);
        }
	}
</script>

<button on:click={debugHandler}>Debug (open console)</button>