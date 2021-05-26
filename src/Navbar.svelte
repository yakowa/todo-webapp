<script>
	export let page;
</script>

<div>
<h2>Todo App!</h2>
<i class="fa fa-bars" on:click={() => {if (page == 'list') { page = 'adder'; } else { page = 'list'; } }}></i>
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
i {
	font-size: 2rem;
}
i:hover {
	opacity: 0.8;
}
</style>