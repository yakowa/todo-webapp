<script>
	import List from './List.svelte';
	import Adder from './Adder.svelte';
	import Navbar from './Navbar.svelte';
	
	var list = localStorage.getItem('list');
	if (list == null) {
		localStorage.setItem('list', '[]');
	}
	let todosList = JSON.parse(localStorage.getItem('list'));

	function storeList() {
		localStorage.setItem('list', JSON.stringify(todosList));
	}



	let page = 'list';
</script>


<Navbar bind:page={page}/>
{#if page == 'list'}
	<Adder bind:list={todosList} storeList={storeList}/>
	<List bind:todos={todosList} storeList={storeList}/>
{:else}
	..
{/if}