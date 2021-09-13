<script>
	import List from './DisplayList.svelte';
	import Adder from './Adder.svelte';
	import Navbar from './Navbar.svelte';
	import Footer from './Footer.svelte';
	import Lists from './Lists.svelte';

	// Loading stored list
	var list = localStorage.getItem('list');
	if (list == null) {
		localStorage.setItem('list', '{ "default": [] }');
	}
	let todosList = JSON.parse(localStorage.getItem('list'));
	if (todosList == {}) { todosList = { "default": [] }; storeList(); }

	function storeList() {
		localStorage.setItem('list', JSON.stringify(todosList));
	}

	const __version = 'v1.9.1';
	// let currentList = 'default';
	var currentList = 'default';
	var page = 'list';

function test() {
	page = (page == 'list') ? 'listOptions' : 'list';
}
</script>


<Navbar/>
<div>
	<!-- {#if page == 'list'} -->
		{#if currentList !== 'default'}
			<h3>{currentList} list</h3>
		{/if}
		<Adder bind:list={todosList} storeList={storeList} currentList={currentList}/>
		<List bind:todos={todosList} storeList={storeList} currentList={currentList}/>
	<!-- {:else} -->
		<hr>
		<Lists bind:todos={todosList} bind:currentList storeList={storeList}/>
	<!-- {/if} -->
</div>
<Footer version={__version}/>

<button on:click={ test }>Click Me</button>

<style>
	div {
		max-width: 400px;
		margin: auto;
	}
</style>