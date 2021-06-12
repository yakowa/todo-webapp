<script>
	export let list;
	export let storeList;

	let tempValue = '';
	
	function updateList() {
		if (!(tempValue == '')) {
			list = [...list, tempValue]
			storeList();
			tempValue = '';
		}
		else {
			notificationAlert('Whoops!', 'You must type something to add it!')
		}
	}
</script>

<div>
	<input type="text" bind:value={tempValue} placeholder="New item"/>
	<button on:click={updateList}>Add</button>
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
</style>