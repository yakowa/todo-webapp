<script>
	// The list object
	export let list;
	// The current selected list
	export let currentList;
	// Store in localstorage function
	export let storeList;

	let newTodoItem = '';
	
	function updateList() {
		console.warn("RAN" + newTodoItem)
		if (!(newTodoItem == '')) {
			if (list[currentList].length > 0) {
				list[currentList] = [...list[currentList], {text: newTodoItem, completed: false}]
			}
			else { list[currentList] = [{text: newTodoItem, completed: false}] }
			storeList();
			newTodoItem = '';
		}
		else {
			notificationAlert('Whoops!', 'You must type something to add it!')
		}
	}
</script>

<div>
	<form on:submit|preventDefault={updateList}>
		<input type="text" bind:value={newTodoItem} placeholder="New item"/>
		<button type="submit">Add</button>
	</form>
</div>


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

	form {
		display: flex;
		gap: 1rem;
		width: 100%;
		justify-content: space-between;
		flex-direction: row;
	}
</style>