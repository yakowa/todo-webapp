<script>
	// The list object
	export let todos;
	// The current selected list
	export let currentList;
	// Store in localstorage function
	export let storeList;
</script>

<ul>
	{#each todos[currentList] as todo, i}
	<li>
		<input type="text" bind:value={todo}>
		<span on:click={(e) => {todos[currentList].splice(i, 1); todos = todos; storeList();}}>&times</span>
	</li>
	{/each}
	<span>Yayy! There is nothing to do! ¯\_(ツ)_/¯</span>
</ul>

<style>
	ul {
		padding: 5px;
		margin: 0;
		background-color: var(--bg-alt);
		color: var(--text);
		list-style-type: none;
		display: flex;
		flex-direction: column;
	}
	li {
		background-color: var(--bg);
		padding: 8px;
		display: flex;
		flex-direction: row;
		border-bottom: 2px solid var(--border);
	}
	li > span {
		margin-left: auto;
		background-color: var(--border);
		border-radius: 1rem;
		color: red;
		font-size: 20px;
		font-weight: bolder;
		padding: 0 4px 4px 4px;
	}
	li > span:hover { cursor: pointer; }
	ul>li+span { display: none }
	ul > span { display: block; padding: 15px; background-color: var(--bg); }

	input { margin: 0; }
</style>