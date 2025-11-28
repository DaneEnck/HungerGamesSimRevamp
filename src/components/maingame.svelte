<script lang="ts">
    export let events;
    export let day;
    export let gapToggle;

    let combatDetailToggle = true;//used to toggle between multi line & single line combat description

</script>


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
    {#if gapToggle}
        <div class="spacer"><h5>Scroll down for events</h5></div>
    {/if}
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