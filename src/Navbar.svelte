<script>
	export let page;
</script>

<div>
<h2>Todo App!</h2>
<p on:click={() => {if (page == 'list') { page = 'adder'; } else { page = 'list'; } }}>{page == 'list' ? 'Info' : 'Back'}</p>
</div>

<style>
div {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 1.5rem;
	background-color: #1b9595;
	color: #f4f4f4;
}
h2 {
	margin: 0;
	font-family: 'Patrick Hand', cursive;
}
</style>