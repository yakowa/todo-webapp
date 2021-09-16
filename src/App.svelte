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

	const __version = 'v2.0.0';
	let currentList = 'default';
	let page = 'list';

	function togglePage() {
		page = (page == 'list') ? 'listOptions' : 'list';
	}
</script>


<Navbar togglePage={togglePage} bind:page={page}/>
<div>
	{#if page == 'list'}
		<h2>{(currentList == 'default') ? 'Default list' : (currentList + ' list') }</h2>
		<Adder bind:list={todosList} storeList={storeList} currentList={currentList}/>
		<List bind:todos={todosList} storeList={storeList} currentList={currentList}/>
	{:else}
		<Lists bind:todos={todosList} togglePage={togglePage} bind:currentList={currentList} storeList={storeList}/>
	{/if}
</div>
<Footer version={__version}/>

<style>
	div {
		max-width: 400px;
		margin: auto;
	}
	@media screen and (max-width: 400px) {
		div { margin: 0 4px; }
	}
</style>