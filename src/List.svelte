<script>
	export let todos;
</script>

<ul>
	{#each todos as todo, i}
	<li>
		{todo}
		<span on:click={(e) => {todos.splice(i, 1); todos = todos;}}>&times</span>
	</li>
	{/each}
	<span>Yayy! There is nothing to do! *dance*</span>
</ul>

<style>
	ul:empty {
		
	}
	ul {
		padding: 5px;
		background-color: #efefef;
		color: #333;
		list-style-type: none;
		display: flex;
		flex-direction: column;
	}
	li {
		background-color: #fff;
		padding: 8px;
		display: flex;
		flex-direction: row;
		border-bottom: 2px solid #ccc;
	}
	li > span {
		margin-left: auto;
		background-color: #ccc;
		color: red;
		font-size: 20px;
		font-weight: bolder;
		padding: 0 4px 4px 4px;
	}
	ul>li+span { display: none }
	ul > span { display: block; padding: 15px; }
</style>