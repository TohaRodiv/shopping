"use strict";

let products = [
	{
		id: 1,
		title: "Название товара",
		count: 0,
		price: 0,
		active: true,
	},
	{
		id: 2,
		title: "Название товара",
		count: 0,
		price: 0,
		active: false,
	},
	{
		id: 3,
		title: "Название товара",
		count: 10,
		price: 100,
		active: false,
	}
];

document.addEventListener ("DOMContentLoaded", () => {

	const result = {
		sum: 0,
		count: 0,
	}

	const elements = {
		sum: document.querySelector ("[data-result-sum]"),
		count: document.querySelector ("[data-result-count]"),
		products: document.querySelector ("[data-products]"),
	};

	function createProduct (product) {
		const html = `
			<li class="products__item product">
				<h2 class="product__head" data-edit-head="1" contenteditable>${product.title}</h2>
				<div class="product__control" data-calc-id="${product.id}">
					<input data-calc-count="1" type="number" min="0" value="${product.count}" class="product__field product__field-count">
					<input data-calc-price="1" type="number" min="0" value="${product.price}" class="product__field product__field-price">
					<label class="product__custom-checkbox">
						<input type="checkbox" class="product__field-checkbox" data-calc-active="1" ${product.active && 'checked="checked"'}>
						<span></span>
					</label>
					<button class="product__field-del" data-crud-del="1">Удалить</button>
				</div>
			</li>
		`;
		return html;
	}

	function createProducts (products) {
		return products.map(product => createProduct (product)).join ("");
	}

	function render (products) {
		elements.products.innerHTML = createProducts (products);
	}

	function calcSumAndRender (products) {
		let sum = products.reduce ((sum, current) => {
			return current.active === true ? sum + (current.price * current.count) : sum;
		}, 0);

		elements.sum.innerHTML = sum;
	}

	function calcCountAndRender (products) {
		let countAll = products.reduce ((count, current) => {
			return current.active === true ? count + current.count : count;
		}, 0);

		elements.count.innerHTML = countAll;
	}

	function calcAndRender (products) {
		calcCountAndRender (products);
		calcSumAndRender (products);
	}

	function updateSum (id, price) {
		products.forEach ((product, index) => {
			if (product.id === id && product.active === true) {
				products[index].price = +price;
			}
		});
		
		calcSumAndRender (products);

	}

	function updateCount (id, count) {
		products.forEach ((product, index) => {
			if (product.id === id && product.active === true) {
				products[index].count = +count;
			}
		});
		
		calcCountAndRender (products);
	}

	function updateActive (id, isActive) {
		products.forEach ((product, index) => {
			if (product.id === id) {
				products[index].active = !!isActive;
			}
		});
	}

	function saveToLocalStorage () {
		localStorage.setItem ("products", JSON.stringify (products));
	}

	function loadFromLocalStorage () {
		if (localStorage.key ("products")) {
			let productsFromLS = JSON.parse (localStorage.getItem ("products"));
			if (productsFromLS.length) {
				products = productsFromLS;
			}
		}
	}

	function updateProduct ({
		id, count, price, active
	}) {
		updateActive (id, active);
		updateCount (id, count);
		updateSum (id, price);
		saveToLocalStorage ();
	}

	function getValues (root) {
		if (root) {
			const id = +root.dataset["calcId"];
			const count = +root.querySelector ("[data-calc-count]").value;
			const price = +root.querySelector ("[data-calc-price]").value;
			const active = !!root.querySelector ("[data-calc-active]").checked;

			return {
				id, count, price, active,
			};
		}
		else {
			return null;
		}
	}

	document.body.addEventListener ("input", e => {
		const target = e.target;
		
		if (target.closest("[data-calc-id]") && target.closest("[data-calc-id]").dataset["calcId"]) {
			
			if (target.dataset["calcCount"] || target.dataset["calcPrice"]) {
				updateProduct (getValues (target.closest("[data-calc-id]")));
			}
		}
		else if (target.closest("li") && target.closest("li").querySelector ("[data-calc-id]") && target.closest("li").querySelector ("[data-calc-id]").dataset["calcId"]) {
			
			if (target.dataset["editHead"]) {
				const {id} = getValues (target.closest("li").querySelector ("[data-calc-id]"));

				products.forEach ((product, index) => {
					if (product.id === id) {
						products[index].title = target.innerText;
					}
				});

				saveToLocalStorage ();

			}
		}
	});

	document.body.addEventListener ("change", e => {
		const target = e.target;

		if (target.closest("div").closest ("[data-calc-id]") && target.closest("div").closest ("[data-calc-id]").dataset["calcId"]) {
			if (target.dataset["calcActive"]) {
				updateProduct (getValues (target.closest("div").closest ("[data-calc-id]")));
			}
		}
	});

	document.body.addEventListener ("click", e => {
		const target = e.target;

		if (target.dataset["crudDel"] && target.closest ("[data-calc-id]") && target.closest ("[data-calc-id]").dataset["calcId"]) {
			const values = getValues (target.closest ("[data-calc-id]"));

			if (values) {
				if(confirm ("Удалить этот товар?")) {
					products = products.filter (product => product.id !== values.id);
					saveToLocalStorage ();
					calcAndRender (products);
					render (products);
				}
			}
		}
	});

	document.querySelector ("[data-crud-add]").addEventListener ("submit", e => {
		e.preventDefault ();
		const elements = e.target.elements;

		const productValues = {
			title: elements.title.value,
			count: elements.qty.value,
			price: elements.price.value,
			active: elements.active.checked,
		};

		products.push (
			{
				id: products.length ? products[products.length - 1].id + 1 : 1,
				...productValues,
			}
		);

		e.target.reset ();

		saveToLocalStorage ();
		calcAndRender (products);
		render (products);
	});

	loadFromLocalStorage ();
	calcAndRender (products);
	render (products);

});