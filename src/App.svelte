<script lang="ts">
	import Contestant from './classes/contestant';
	import { Condition } from './classes/contestant';
	import Group from './classes/group';
	import hungerGames from './classes/HungerGames';
	import type EventStruct from './classes/eventStruct';
	import Papa from 'papaparse';
	import Contcreate from './components/contcreate.svelte';
	/*
		General Vocabulary Overview:
		Contestant - a single character
		Group - a collection of two or more characters operating together
		Party - either a contestant or a group
	*/
	let toggle = 0; //0 = character creation, 1 = main game, 2 = winner screen, 3 = contestant overview

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

	let combatDetailToggle = true;//used to toggle between multi line & single line combat description

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
			toggle = 2;
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
		for(let i = 0; i < numConts; i++){
			if(creationConts[i].getName() == ""){
				creationConts[i].setName("Contestant " + (i + 1).toString());
			}
			parties.push(creationConts[i]);
		}
		toggle = 1;
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
		toggle = 3;
	}
	//button that exits contestant view screen
	const backToGame = () => {
		toggle = 1;
	}
	
	//return to creation menu after complete game, retaining contestant names, images, and pronouns
	const resetGame = () => {
		toggle = 0;
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
		toggle = 4;
	}

	//when return in about menu is clicked
	const returnCreationHandler = () => {
		toggle = 0;
	}

</script>

<!-- TODO: turn rest of menus into components-->
<main>
	<h1>Hunger Games Simulator: Revamped</h1>
	<!--Character selection screen-->
	{#if toggle == 0}
		<button on:click={aboutHandler}>About</button>
		<Contcreate bind:numConts = {numConts} bind:creationConts = {creationConts}/>
		<!--Game Start-->
		<button on:click={creationEndHandler}>Start Game!</button>
	<!--Main game display, shows list of events and activities of the characters-->
	{:else if toggle == 1}
		<!--Combat detail toggle-->
		<h4>
			<input type="checkbox" bind:checked={combatDetailToggle}>
			Show combat details
		</h4>
		<p><br/></p>
		<!--Day header-->
		<h4>
			{#if day - 1 == 0}
				The Cornucopia
			{:else}
				Day {day - 1}
			{/if}
		</h4>
		<p><br/></p>
		<!--Event loop-->
		{#each events as event,i}
			<!--Images-->
			<div style="margin:auto">
				{#each event.images as thing}
					<img src={thing} alt = "img error" class = "create-pic">
				{/each}
			</div>
			<!--Main content-->
			<p>{event.main}</p>
			<!--Combat (detailed)-->
			{#if combatDetailToggle}
				{#each event.combat as thing, m}
					{#if m != event.combat.length -1}
						<p style="font-size:12px">{thing}</p>
					{/if}
				{/each}
			<!--Combat (single line)-->
			{:else}
				{#each event.combat as thing, m}
					{#if m == event.combat.length - 1}
						<p style="font-size:12px">{thing}</p>
					{/if}
				{/each}
			{/if}
		{/each}
		<button on:click={runDay}>next day</button>
		<button on:click={prepDisplay}>view contestants</button>
	<!--Winner screen, endimgs/endstr determined in runDay function-->
	{:else if toggle == 2}
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
	{:else if toggle == 3}
		<div class = "all-rows">
		{#each displayParties as displays}
			{#if displays[0] instanceof Contestant}
				<!--row of contestants-->
				<div class = "six-block">
					{#each displays as thing}
						{#if thing instanceof Contestant} <!-- should always be true. TODO improve type checks-->
							<div class="cont-info-block">
								<!--grayscale pic if dead-->
								{#if thing.getCond() == Condition.DEAD}
									<img src={thing.getImage()[0]} alt="img error" class="dead-pic">
								{:else}
									<img src={thing.getImage()[0]} alt="img error" class="create-pic">
								{/if}
								<p style = "margin:1px">{thing.getName()}</p>
								<p style = "margin:1px">{thing.getKills()} kills</p>
								<!--change text color based on condition-->
								{#if thing.getCond() == Condition.HEALTHY}
									<p style = "margin:1px;color:green">{thing.getCondName()}</p>
								{:else if thing.getCond() == Condition.WOUND_LOW}
									<p style = "margin:1px;color:yellowgreen">{thing.getCondName()}</p>
								{:else if thing.getCond() == Condition.WOUND_MEDIUM}
									<p style = "margin:1px;color:gold">{thing.getCondName()}</p>
								{:else if thing.getCond() == Condition.WOUND_HIGH}
									<p style = "margin:1px;color:orange">{thing.getCondName()}</p>
								{:else if thing.getCond() == Condition.DEAD}
									<p style = "margin:1px;color:red">{thing.getCondName()}</p>
								{/if}	
								<!--list weapon-->
								<!--characters without a weapon have "fists" by default-->
								{#if thing.getWeapon().getName() != "fists"}
									<p style = "margin:1px">Weapon:</p>
									<p style = "margin:1px">{thing.getWeapon().getName()}</p>
								{/if}
								<!--list items-->
								{#if thing.getItems().length > 0}
									<p style = "margin:1px">Items:</p>
									{#each thing.getItems() as item}
										<p style = "margin:1px">{item.getName()}</p>
									{/each}
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<!--group-->
				{#each displays as thing} <!--TODO: remove this each loop-->
					<div style="margin:auto">
						{#each thing.getImage() as image}
							<img src={image} alt="img error" class="create-pic">
						{/each}
					</div>
					<p style = "margin:10px">{thing.getName()} are a group</p>
					<!--items-->
					{#if thing.getItems().length == 1}
						<span>Items: {thing.getItems()[0].getName()}</span>
					{:else if thing.getItems().length == 2}
						<span>Items: {thing.getItems()[0].getName()} and {thing.getItems()[1].getName()}</span>
					{:else if thing.getItems().length > 2}
						<div>
							<span>Items:</span>
							{#each thing.getItems() as item,k}
								{#if k == thing.getItems().length - 1}
									<span>and {item.getName()}</span>
								{:else}
									<span>{item.getName()},&nbsp</span>
								{/if}
							{/each}
						</div>
					{/if}
				{/each}
			{/if}
		{/each}
		</div>
		<button on:click={backToGame}>return</button>
	{:else if toggle == 4}
		<p>This website will simulate a battle royale, similar to the Hunger Games, with characters of your choice as the participants.</p>
		<p>Enter the names, pronouns, and optionally images of the characters you want to participate</p>
		<p>Then, click start game to begin the simulation</p>
		<p>The submitted characters will then procedurally fight, explore, team up, and gather supplies</p>
		<button on:click={returnCreationHandler}>return</button>
	{:else}
		<p>Toggle Error</p>
	{/if}
</main>