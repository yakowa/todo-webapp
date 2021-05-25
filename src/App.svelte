<script>
	import List from './List.svelte';
	import Adder from './Adder.svelte';
	let todosList = [
		'One',
		'Two',
		'Three',
		'Four',
		'test'
	];
</script>


<h1>Todo App!</h1>
<Adder bind:list={todosList}/>
<List todos={todosList}/>
