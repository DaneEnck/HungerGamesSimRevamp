<script lang="ts">
    import Contestant from '../classes/contestant';
	import { Condition } from '../classes/contestant';
	import Group from '../classes/group';
	import hungerGames from '../classes/HungerGames';
	import type EventStruct from '../classes/eventStruct';
	import Papa from 'papaparse';
    export let creationConts
    
    export let numConts = 24; //stores all contestants created during character creation
    
    let numContsWarningToggle = false;

    let selectBinds:string[] = [];//used to store the value of the pronoun select dropdowns

    let imgFiles;

	let inputFiles;

	let contExportData:string;

	let exportBlob:Blob;

	let exportURL:string;

	let exportFileName:string = "cast"

    
    //handler for submit button on character creation screen. done through submission instead of immediate reaction to avoid early input during multi digit numbers
	const submitNumConts = () => {
		if (numConts == 0){
			numContsWarningToggle = true;
		}
		else{
			numContsWarningToggle = false;
			//shorten parties array to match new number of contestants
			while(creationConts.length > numConts){
				creationConts.pop();
				selectBinds.pop();
			}
			//lengthen parties array to match new number of contestants
			while(creationConts.length < numConts){
				creationConts.push(new Contestant("" ,"he","him","his","Default.png"));
				selectBinds.push("1");
			}
		}
		creationConts = creationConts;//direct assignment needed to update svelte reactivity
	}
	const handleInputName = (e,c:Contestant) => {
		c.setName(e.target.value);
	}
	const handlePronoun = (e,c:Contestant) => {
		c.setPronoun(e.target.value);
	}
	const handleObjPronoun = (e,c:Contestant) => {
		c.setObjPronoun(e.target.value);
	}
	const handlePosPronoun = (e,c:Contestant) => {
		c.setPosPronoun(e.target.value);
	}
	//handler for add contestant button
	const addContHandler = () => {
		creationConts.push(new Contestant("" ,"he","him","his","Default.png"));
		selectBinds.push("1");
		numConts = creationConts.length;
		creationConts = creationConts;//direct assignment needed to update svelte reactivity
	}
	const removeContHandler = (c:Contestant) => {//when X is clicked on a particular character
		let val = creationConts.indexOf(c);
		creationConts.splice(val,1);
		selectBinds.splice(val,1);
		numConts = creationConts.length;
		creationConts = creationConts;//direct assignment needed to update svelte reactivity
	}
	const imgHandler = (e,c:Contestant) => {
		if(e.target.value == ""){
			c.setImage("Default.png");
		}
		else{
			c.setImage(e.target.value);
		}
		creationConts = creationConts;//direct assignment needed to update svelte reactivity
	}
	//change pronouns of contestant based on dropdown selection
	//customtoggle replaces dropdown with 3 text inputs
	const newPronounHandler = (c:Contestant,s:number) => {
		let val = selectBinds[s];
		if(val == "1"){
			c.setPronoun("he");
			c.setObjPronoun("him");
			c.setPosPronoun("his");
			c.setPronounCustomToggle(false);
		}
		else if(val == "2"){
			c.setPronoun("she");
			c.setObjPronoun("her");
			c.setPosPronoun("her");
			c.setPronounCustomToggle(false);
		}
		else if(val == "3"){
			c.setPronoun("they");
			c.setObjPronoun("them");
			c.setPosPronoun("their");
			c.setPronounCustomToggle(false);
		}
		else{
			c.setPronounCustomToggle(true);
		}
		creationConts = creationConts;//direct assignment needed to update svelte reactivity
	}
    const closeCustomPronoun = (c:Contestant) => {
		c.setPronounCustomToggle(false);
		creationConts = creationConts;//direct assignment needed to update svelte reactivity
	}
    const fileSelectHandler = (c: Contestant) => {
		let file = imgFiles[0];
		let reader = new FileReader();
		reader.readAsDataURL(file);
		reader.addEventListener("load", function () {
			let temp = reader.result as string;
			c.setImage(temp);
			creationConts = creationConts;//direct assignment needed to update svelte reactivity
		});
	}
	
    const downloadExport = async () => {
		let result = await downloadPrep();
		document.getElementById("downloadLink").click();//when this was syncronous, the file would download before the data was ready. not sure how
	}

	const downloadPrep = () => {
		return new Promise(()=>{
			contExportData = numConts.toString() + "\n";
			for (let i = 0; i < creationConts.length; i++){
				//'@' used as separator for csv
				contExportData += creationConts[i].getImage() + "@";
				contExportData += creationConts[i].getName() + "@";
				contExportData += creationConts[i].getPronoun() + "@";
				contExportData += creationConts[i].getObjpronoun() + "@";
				contExportData += creationConts[i].getPospronoun() + "\n";
			}
			exportBlob = new Blob([contExportData], {type: "text/csv"});
			exportURL = window.URL.createObjectURL(exportBlob);
			})
	}

	const csvInputHandler = () => {
		Papa.parse(inputFiles[0], {
			delimiter: "@",
			complete: function(results) {
				let temp = results.data;
				console.log(temp);
				numConts = parseInt(temp[0][0]);
				//shorten parties array to match new number of contestants
				while(creationConts.length > numConts){
					creationConts.pop();
					selectBinds.pop();
				}
				//lengthen parties array to match new number of contestants
				while(creationConts.length < numConts){
					creationConts.push(new Contestant("","he","him","his","Default.png"));
					selectBinds.push("1");
				}
				for(let i = 0; i < numConts; i++){
					creationConts[i].setImage(temp[i+1][0]);
					creationConts[i].setName(temp[i+1][1]);
					creationConts[i].setPronoun(temp[i+1][2]);
					creationConts[i].setObjPronoun(temp[i+1][3]);
					creationConts[i].setPosPronoun(temp[i+1][4]);
				}
				//update all select binds, updating the pronoun dropdowns
				for(let i = 0; i < numConts; i++){
					if(creationConts[i].getPronoun() == "he" && creationConts[i].getObjpronoun() == "him" && creationConts[i].getPospronoun() == "his"){
						selectBinds[i] = "1";
					}
					else if(creationConts[i].getPronoun() == "she" && creationConts[i].getObjpronoun() == "her" && creationConts[i].getPospronoun() == "her"){
						selectBinds[i] = "2";
					}
					else if(creationConts[i].getPronoun() == "they" && creationConts[i].getObjpronoun() == "them" && creationConts[i].getPospronoun() == "their"){
						selectBinds[i] = "3";
					}
					else{
						selectBinds[i] = "4";
						creationConts[i].setPronounCustomToggle(true);
					}
				}
				creationConts = creationConts;//direct assignment needed to update svelte reactivity
			}
		});
	}
</script>

<div class = "num-header">
    <p>Number of contestants: </p>
    <input type = "text" bind:value={numConts}>
    <button on:click={submitNumConts}>submit</button>
</div>
{#if numContsWarningToggle}
    <p>Error, there must be contestants present to play the game</p>
{/if}
{#each creationConts as cont,i}
    <div class = "cont-creator">
        <img src={cont.getImage()[0]} alt="img error" class="create-pic">
        <!--custom file upload button via label-->
        <label class = "input-label">
            <input accept="image/png, image/jpeg" bind:files={imgFiles} type="file" on:change={() => fileSelectHandler(cont)} id="selectedFile" style="display:none;">
            <p class = "fileupload">File Upload</p>
        </label> 
        <p style="margin:auto">&nbspOR&nbsp</p>
        <!--image link input-->
        <input type = "text" placeholder="Image Link" on:input={(e) => imgHandler(e,cont)} class = "create-input">
        <p style="margin:auto">&nbsp&nbsp&nbsp</p><!--TODO: border instead of this nonsense-->
        <!--name input-->
        <input type = "text" value={cont.getName()} placeholder="Name" on:input={(e) => handleInputName(e,cont)} class = "create-input">
        <!--pronoun selector-->
        {#if cont.getPronounCustomToggle() == false}
            <select bind:value={selectBinds[i]} on:change={() => newPronounHandler(cont, i)} class = "create-input">
                <option value = "1" selected>He/Him</option>
                <option value = "2">She/Her</option>
                <option value = "3">They/Them</option>
                <option value = "4">Custom</option>
            </select>
        {:else}
            <input type = "text" placeholder="ex. He/She/They" on:input={(e) => handlePronoun(e,cont)} class = "create-input">
            <input type = "text" placeholder="ex. Him/Her/Them" on:input={(e) => handleObjPronoun(e,cont)} class = "create-input">
            <input type = "text" placeholder="ex. His/Her/Their" on:input={(e) => handlePosPronoun(e,cont)} class = "create-input">
            <button on:click={() => closeCustomPronoun(cont)} class="back-button">back</button>
        {/if}
        <!--delete button-->
        <button disabled = '{numConts == 1}' on:click = {() => removeContHandler(cont)} class = "create-x">X</button>
    </div>
{/each}
<button on:click={addContHandler}>add contestant</button>
<p><br/></p>
<!--Cast data import-->
<label class = "input-label">
    <input accept=".csv" bind:files={inputFiles} type="file" on:change={csvInputHandler} id="selectedFile2" style="display:none;">
    <p class = "fileupload">Cast Upload</p>
</label> 
<!--Export file creation & download-->
<a href={exportURL} style="display:none" id="downloadLink" download = {exportFileName}>.</a>
<span>Filename:</span>
<input type = "text" bind:value={exportFileName}>
<button on:click={downloadExport}>Download</button>
<p><br/></p>