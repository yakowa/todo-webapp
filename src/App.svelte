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
	<div>
		<p>Todo App v1.5 created by JacobEM</p>
		<p>Licensed under CC BY-NC-ND 4.0</p>
	</div>
{/if}

<style>
	div {
		padding: 2rem;
		background-color: #ccc;
		color: #333;
	}
</style>