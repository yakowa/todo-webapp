<script>
	// The list object
	export let todos;
	// Store in localstorage function
	export let storeList;
	// The current selected list
	export let currentList;

	let newListName = '';

	function createNewList() {
		if (!(todos[newListName] == [])) {
			todos[newListName] = [];
			todos = todos;
			storeList();
			newListName = '';
			lists = getList();
		}
		else {
			notificationAlert('Whoops!', 'There is already a list with that name!')
		}
	}

	var lists = getList();
	function getList() {
		let tempList = [];
		for ( var property in todos ) { tempList = [...tempList, property] }
		return tempList;
	}

</script>

<div>
	<input type="text" bind:value={newListName} placeholder="New list"/>
	<button on:click={createNewList}>Add</button>
</div>

<ul>
	{#each lists as list, i}
	<li on:click={(e) => { currentList = lists[i]; }}>
		{lists[i]}
		<span on:click={(e) => { delete todos[list]; todos = todos; storeList();}}>&times</span>
	</li>
	{/each}
	<span>Yayy! There is nothing to do! ¯\_(ツ)_/¯</span>
</ul>

<style>
	div {
		display: flex;
		background-color: var(--bg-alt);
		flex-direction: row;
		padding: 10px;
	}
	input {
		width: 80%;
	}
	button {
		width: 20%;
	}

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
</style>