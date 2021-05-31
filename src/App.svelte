<script>
	import List from './List.svelte';
	import Adder from './Adder.svelte';
	import Navbar from './Navbar.svelte';
	import Footer from './Footer.svelte';
	
	var list = localStorage.getItem('list');
	if (list == null) {
		localStorage.setItem('list', '[]');
	}
	let todosList = JSON.parse(localStorage.getItem('list'));

	function storeList() {
		localStorage.setItem('list', JSON.stringify(todosList));
	}
</script>


<Navbar/>
<div>
	<Adder bind:list={todosList} storeList={storeList}/>
	<List bind:todos={todosList} storeList={storeList}/>
</div>
<Footer/>

<!-- <style>
	div {
		padding: 1rem 5rem;
	}
</style> -->