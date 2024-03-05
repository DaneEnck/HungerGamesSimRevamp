<script lang="ts">
    export let displayParties;
    export let numConts;
    export let parties;
    export let endstr;
    import Contestant from '../classes/contestant';
    import { Condition } from '../classes/contestant';
</script>

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
                            <!--mark winner if game end--->
                            {#if endstr.length > 0 && thing.getCond() != Condition.DEAD && parties.length == numConts}
                                <p style = "margin:1px;color:yellow">WINNER!</p>
                            {/if}
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
                            {#if thing.getWeapon().getName() != "fists" || thing.getConsumWeps().length > 0}
                                <p style = "margin:1px">Weapon:</p>
                                <p style = "margin:1px">{thing.getWeapon().getName()}</p>
                            {/if}
                            {#each thing.getConsumWeps() as wep}
                                <p style = "margin:1px">{wep.getName()}</p>
                                <p style = "margin:1px">{"Uses: " + wep.getUses()}</p>
                            {/each}
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
                <!--mark winner if game end--->
                {#if endstr.length > 0}
                    <p style = "margin:1px;color:yellow">WINNER!</p>
                {/if}
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