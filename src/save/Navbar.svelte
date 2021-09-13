<script>
	let light = true;
</script>

<div>
	<h2>Todo App!</h2>
	{#if light}
		<button on:click="{() => {light = false; document.body.className = 'dark'}}">Go Dark 🌑</button>
	{:else}
		<button on:click="{() => {light = true; document.body.className = 'light'}}">Go Light ⛅</button>
	{/if}
</div>

<style>
div {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 1.5rem;
	background-color: var(--theme);
	color: #f4f4f4;
}
h2 {
	margin: 0;
	font-family: 'Patrick Hand', cursive;
}
button {
	border-radius: 1rem;
}
</style>