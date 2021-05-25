<script>
	import List from './List.svelte';
	import Adder from './Adder.svelte';
	
	var list = localStorage.getItem('list');
	if (list == null) {
		localStorage.setItem('list', '[]');
	}
	let todosList = JSON.parse(localStorage.getItem('list'));

	function storeList() {
		localStorage.setItem('list', JSON.stringify(todosList));
	} 
</script>


<h1>Todo App!</h1>
<Adder bind:list={todosList} storeList={storeList}/>
<List bind:todos={todosList} storeList={storeList}/>