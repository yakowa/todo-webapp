<script>
	// The list object
	export let todos;
	// Store in localstorage function
	export let storeList;
	// The toggle page function
	export let togglePage;

	let newListName = '';

	function createNewList() {
		if (!(todos[newListName] == [])) {
			todos[newListName] = [];
			todos = todos;
			storeList();
			newListName = '';
			lists = getList(todos);
		}
		else {
			notificationAlert('Whoops!', 'There is already a list with that name!')
		}
	}

	var lists = getList(todos);
	function getList(passedList) {
		let tempList = [];
		for ( var property in passedList ) { tempList = [...tempList, property] }
		return tempList;
	}

</script>

<h2>My Lists</h2>
<div>
	<input type="text" bind:value={newListName} placeholder="New list"/>
	<button on:click={createNewList}>Add</button>
</div>

<ul>
	{#each lists as list, i}
		{#if i !== 0}
			<li on:click={(e) => { togglePage(); }}>
				{lists[i]}
				<span on:click={(e) => { delete todos[list]; todos = todos; lists = getList(todos); storeList();}}>&times</span>
			</li>
		{:else}
		<li on:click={(e) => { togglePage(); }}>
			{lists[i]}
		</li>
		{/if}
	{/each}
	<span>You have no lists! ¯\_(ツ)_/¯</span>
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
	li:hover {
		opacity: 0.8;
		border: 1px solid var(--bg-secondary);
		transition: all 300ms;
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