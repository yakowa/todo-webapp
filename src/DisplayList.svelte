<script>
	import { text } from 'svelte/internal';
import Adder from './Adder.svelte';

	// The list object
	export let todos;
	// Store in localstorage function
	export let storeList;
</script>

{#each Object.keys(todos) as todoListName}
	<h3 id="{todoListName}">{todoListName}</h3>
	<ul>
		{#each todos[todoListName] as todo, i}
		<li class:done={todo.completed}>
			<input class:done={todo.completed} type="text" bind:value={todo.text} on:change={() => {todos = todos; storeList();}}>
			<span on:click={(e) => {todos[todoListName].splice(i, 1); todos = todos; storeList();}}>&times</span>
			<span class="check" on:click={(e) => { todo.completed = !todo.completed; todos = todos; storeList(); }}>&#10003;</span>
		</li>
		{/each}
		<span>Yayy! There is nothing to do! ¯\_(ツ)_/¯</span>
		<Adder bind:list={todos} storeList={storeList} currentList={todoListName}/>
	</ul>
{/each}

<style>
	ul {
		padding: 5px;
		margin: 0;
		background-color: var(--bg-alt);
		color: var(--text);
		list-style-type: none;
		display: flex;
		flex-direction: column;
	}
	li {
		background-color: var(--bg);
		padding: 8px;
		display: flex;
		flex-direction: row;
		border-bottom: 2px solid var(--border);
	}
	li > span {
		margin-left: auto;
		background-color: var(--border);
		border-radius: 1rem;
		color: red;
		font-size: 20px;
		font-weight: bolder;
		padding: 0 4px 4px 4px;
	}
	li > .check { color: green; }
	li > span:hover { cursor: pointer; }
	ul>li+span { display: none }
	ul > span { display: block; padding: 15px; background-color: var(--bg); }

	input { margin: 0; width: 75%; }

	input.done {
		text-decoration: line-through;
		color: var(--text-muted);
	}
	li.done {
		background: var(--bg-muted) !important;
	}
</style>