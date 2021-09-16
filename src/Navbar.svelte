<script>
	// The toggle page function
	export let togglePage;
	// The current selected page
	export let page;

	let light = true;
</script>

<div>
	<h2>Todo App!</h2>

	<section>
		<button style='margin-right: 1rem;' on:click={ togglePage }>{(page == 'list' ? 'My Lists' : 'Back to items')}</button>

		{#if light}
			<button on:click="{() => {light = false; document.body.className = 'dark'; localStorage.setItem('theme', 'dark');}}">Go Dark 🌑</button>
		{:else}
			<button on:click="{() => {light = true; document.body.className = 'light'; localStorage.setItem('theme', 'light'); }}">Go Light ⛅</button>
		{/if}
	</section>

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