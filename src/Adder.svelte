<script>
	export let list;

	let tempValue = '';
	
	function updateList() {
		list = [...list, tempValue]
		tempValue = '';
	}
</script>

<input type="text" bind:value={tempValue}/>

<button on:click={updateList}>Add To List</button>