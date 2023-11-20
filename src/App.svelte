<script lang="ts">
	import Contestant from './classes/contestant';
	import { Condition } from './classes/contestant';
	import Group from './classes/group';
	import hungerGames from './classes/HungerGames';
	import type EventStruct from './classes/eventStruct';
	import Contcreate from './components/contcreate.svelte';
  import Maingame from './components/maingame.svelte';
  import Overview from './components/overview.svelte';
	/*
		General Vocabulary Overview:
		Contestant - a single character
		Group - a collection of two or more characters operating together
		Party - either a contestant or a group
	*/
	let menuToggle = 0; //0 = character creation, 1 = main game, 2 = winner screen, 3 = contestant overview, 4 = about screen

	let creationConts = new Array<Contestant>(); //stores all contestants created during character creation

	let parties = new Array<Contestant|Group>(); /*stores all contestants and groups
	Contestants and groups are partially polymorphic and are stored in the same array to simplify unweighted random selection between the two
	any index >= numConts is a group. This is known externally but must be type checked anyways
	This simplification has complicated the code in other areas, but it is still a net positive imo*/

	let partyCopy = new Array<Contestant|Group>(); //temporary copy of parties array. 
	//Passed to the hungergames function, where parties are removed one by one to ensure each entry is used once

	let numConts:number = 24;//number of contestants listed for character creation

	let events:EventStruct[] = [];//return from hungergames function goes here, refer to eventStruct.ts for more info
	
	let day:number = 0;//current day of the game, 0 is the cornucopia (beginning of the game)

	let endstr:string[] = [];//used to store the winner(s) and their kills

	let endimgs:string[] = [];//used to store the winner(s) image(s)

	let displayParties:Array<(Contestant|Group)[]>;//2d array used to organize all contestants into blocks of 6 for display purposes

	let selectBinds:string[] = [];//used to store the value of the pronoun select dropdowns

	

	for(let i = 0; i < numConts; i++){
		selectBinds.push("1");
		creationConts.push(new Contestant("" ,"he","him","his","Default.png"));
	}

	//function used on game start and after each day. passes the parties array to the hungergames to generate events
	const runDay = () => {
		//shallow copy of main party array
		partyCopy = Array.from(parties);

		//remove dead contestants and contestants in groups from partyCopy. groups are always left in
		for (let i = 0; i < numConts; i++){
			let temp = partyCopy[i];
			if(temp instanceof Contestant && (temp.getCond() == Condition.DEAD || temp.getIsInGroup())){
				partyCopy.splice(i,1);
				i--;//array now shorter by 1, avoids skipping shift down
			}
		}
			
		//if one party left, end game
		if(partyCopy.length == 1){
			if(partyCopy[0] instanceof Contestant){
				endstr.push(partyCopy[0].getName() + " is the winner with " + partyCopy[0].getKills() + " kills!");
			}
			else{
				endstr.push(partyCopy[0].getName() + " are the winners!");
				for(let j = 0; j < partyCopy[0].getConts().length; j++){
					endstr.push(partyCopy[0].getConts()[j].getName() + " got " + partyCopy[0].getConts()[j].getKills() + " kills");
				}
			}
			endimgs = partyCopy[0].getImage();
			menuToggle = 2;
		}
		else{
			events = hungerGames(parties,partyCopy,numConts,day);
			day++;
		}
		//set scroll to top of page
		document.documentElement.scrollTop = 0;
    }
	//handler for Start Game button
	const creationEndHandler = () => {
		//copy contestants from creationConts to parties
		if(parties.length == 0){
			for(let i = 0; i < numConts; i++){
				if(creationConts[i].getName() == ""){
					creationConts[i].setName("Contestant " + (i + 1).toString());
				}
				parties.push(creationConts[i]);
			}
		}
		menuToggle = 1;
		runDay();
	}
	
	//create 2D array which places contestants into 6 person arrays, groups get their own array each
	//this makes it easier to display contestants in rows
	const prepDisplay = () => {
		displayParties = [];
		let temparr = [];
		//create 6 contestants arrays
		for(let i = 0; i < numConts; i++){
			temparr.push(parties[i]);
			if((i + 1) % 6 == 0){
				displayParties.push(temparr);
				temparr = [];
			}
		}
		//push incomplete array, in case numConts % 6 != 0
		if(temparr.length > 0){
			displayParties.push(temparr);
		}
		//add all groups as seperate array to be displayed individually
		for(let i = numConts; i < parties.length; i++){
			displayParties.push([parties[i]])
		}
		menuToggle = 3;
	}
	//button that exits contestant view screen
	const backToGame = () => {
		menuToggle = 1;
	}
	
	//return to creation menu after complete game, retaining contestant names, images, and pronouns
	const resetGame = () => {
		menuToggle = 0;
		day = 0;
		endstr = [];
		for(let i = 0; i < numConts; i++){
			let temp = parties[i];
			if(temp instanceof Contestant){
				temp.upCond(99);
				temp.loseWeapon();
				while (temp.getItems().length > 0){
					temp.loseItem(0);
				}
				temp.setKills(0);
				temp.setIsInGroup(false);
			}
		}
		while(parties.length > numConts){
			parties.pop();
			selectBinds.pop();
		}
	}

	//when about button is clicked
	const aboutHandler = () => {
		menuToggle = 4;
	}

	//when return in about menu is clicked
	const returnCreationHandler = () => {
		menuToggle = 0;
	}

</script>

<!-- TODO: turn rest of menus into components-->
<main>
	<h1>Hunger Games Simulator: Revamped</h1>
	<!--Character selection screen-->
	{#if menuToggle == 0}
		<button on:click={aboutHandler}>About</button>
		<Contcreate bind:numConts = {numConts} bind:creationConts = {creationConts}/>
		<!--Game Start-->
		<button on:click={creationEndHandler}>Start Game!</button>
	<!--Main game display, shows list of events and activities of the characters-->
	{:else if menuToggle == 1}
		<Maingame bind:events = {events} bind:day = {day}/>
		<button on:click={runDay}>next day</button>
		<button on:click={prepDisplay}>view contestants</button>
	<!--Winner screen, endimgs/endstr determined in runDay function-->
	{:else if menuToggle == 2}
		<div style="margin:auto">
			{#each endimgs as image}
				<img src={image} alt="img error" class="create-pic">
			{/each}
		</div>
		{#each endstr as line}
			<p>{line}</p>
		{/each}
		<button on:click={resetGame}>new game</button>
	<!--Contestant overview screen, lists all contestants, their kills, health, and possessions-->
	{:else if menuToggle == 3}
		<Overview bind:displayParties = {displayParties}/>
		<button on:click={backToGame}>return</button>
	{:else if menuToggle == 4}
		<p>This website will simulate a battle royale, similar to the Hunger Games, with characters of your choice as the participants.</p>
		<p>Enter the names, pronouns, and optionally images of the characters you want to participate</p>
		<p>Then, click start game to begin the simulation</p>
		<p>The submitted characters will then procedurally fight, explore, team up, and gather supplies</p>
		<button on:click={returnCreationHandler}>return</button>
	{:else}
		<p>Toggle Error</p>
	{/if}
</main>