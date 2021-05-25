<script>
	export let list;
	export let storeList;

	let tempValue = '';
	
	function updateList() {
		list = [...list, tempValue]
		storeList();
		tempValue = '';
	}
</script>

<input type="text" bind:value={tempValue}/>

<button on:click={updateList}>Add To List</button>