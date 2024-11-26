document.getElementById('session-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const sessionName = document.getElementById('session-name').value;
    if (sessionName) {
        addSessionToDOM(sessionName);
        saveSessionToLocalStorage(sessionName);
        document.getElementById('session-form').reset();
    }
});

document.getElementById('product-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const productName = document.getElementById('product-name').value;
    const productPrice = document.getElementById('product-price').value;
    const productImage = document.getElementById('product-image').files[0];
    const sessionName = document.getElementById('session-select').value;

    if (productName && productPrice && productImage && sessionName) {
        const reader = new FileReader();
        reader.onload = function(event) {
            addProductToSession(sessionName, productName, productPrice, event.target.result);
            saveProductToLocalStorage(sessionName, productName, productPrice, event.target.result);
            document.getElementById('product-form').reset();
        };
        reader.readAsDataURL(productImage);
    }
});

let cart = []; // Array para almacenar los productos en el carrito

function addSessionToDOM(sessionName) {
    const catalog = document.getElementById('catalog');
    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'catalog-session animate__animated animate__fadeInDown';
    sessionDiv.setAttribute('data-session', sessionName);
    sessionDiv.innerHTML = `
        <h3>${sessionName}</h3>
        <button class="delete-session-btn" onclick="deleteSession('${sessionName}')">Eliminar sección</button>
        <div class="catalog-products" id="${sessionName}-products"></div>
    `;
    catalog.appendChild(sessionDiv);

    const sessionSelect = document.getElementById('session-select');
    const option = document.createElement('option');
    option.value = sessionName;
    option.textContent = sessionName;
    sessionSelect.appendChild(option);
}

function addProductToSession(sessionName, productName, productPrice, productImage, soldOut = false) {
    const sessionProducts = document.getElementById(`${sessionName}-products`);
    const productItem = document.createElement('div');
    productItem.className = `product-item animate__animated animate__fadeInDown ${soldOut ? 'product-sold-out' : ''}`;
    productItem.innerHTML = `
        <img src="${productImage}" alt="${productName}" width="100" height="100">
        <h3>${productName}</h3>
        <p>Precio: $${productPrice}</p>
        <button class="buy-btn" onclick="redirectToWhatsApp('${productName}', ${productPrice})">Comprar</button>
        <button class="cart-btn" onclick="addToCart('${productName}', ${productPrice})">
            <span class="cart-icon"><img src="images/cart-icon.png" alt="Carrito"></span>
        </button>
        <button class="delete-btn" onclick="deleteProduct('${productName}')">Eliminar</button>
    `;
    sessionProducts.appendChild(productItem);
}

function redirectToWhatsApp(productName, productPrice) {
    const phoneNumber = '+5358697664'; // Tu número de teléfono de WhatsApp
    const message = `Hola, me gustaría comprar el producto: ${productName} que cuesta $${productPrice}.`;
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.location.href = url;
}

function addToCart(productName, productPrice) {
    cart.push({ productName, productPrice });
    alert(`Añadido al carrito: ${productName} por $${productPrice}`);
    updateCartInLocalStorage();
}

function updateCartInLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = storedCart;
}

function showCart() {
    const cartWindow = window.open('', '_blank');
    cartWindow.document.write('<html><head><title>Carrito de Compras</title></head><body>');
    cartWindow.document.write('<h1>Carrito de Compras</h1>');
    cartWindow.document.write('<ul>');
    cart.forEach(item => {
        cartWindow.document.write(`<li>${item.productName} - $${item.productPrice}</li>`);
    });
    cartWindow.document.write('</ul>');
    cartWindow.document.write('<button onclick="window.opener.checkoutCart()">Comprar</button>');
    cartWindow.document.write('</body></html>');
    cartWindow.document.close();
}

function checkoutCart() {
    const phoneNumber = '+5358697664'; // Tu número de teléfono de WhatsApp
    let message = 'Hola, me gustaría comprar los siguientes productos:\n';
    cart.forEach(item => {
        message += `- ${item.productName} por $${item.productPrice}\n`;
    });
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.location.href = url;
}

function saveSessionToLocalStorage(sessionName) {
    const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
    if (!sessions.includes(sessionName)) {
        sessions.push(sessionName);
        localStorage.setItem('sessions', JSON.stringify(sessions));
    }
}

function saveProductToLocalStorage(sessionName, productName, productPrice, productImage, soldOut = false) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.push({ sessionName, productName, productPrice, productImage, soldOut });
    localStorage.setItem('products', JSON.stringify(products));
}

function loadSessionsFromLocalStorage() {
    const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
    sessions.forEach(sessionName => {
        addSessionToDOM(sessionName);
    });
}

function loadProductsFromLocalStorage() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.forEach(product => {
        addProductToSession(product.sessionName, product.productName, product.productPrice, product.productImage, product.soldOut);
    });
}

function buyProduct(productName) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.map(product => {
        if (product.productName === productName) {
            product.soldOut = true;
        }
        return product;
    });
    localStorage.setItem('products', JSON.stringify(products));

    // Actualizar la lista de productos en el DOM
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';
    loadSessionsFromLocalStorage();
    loadProductsFromLocalStorage();
}

function deleteProduct(productName) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(product => product.productName !== productName);
    localStorage.setItem('products', JSON.stringify(products));

    // Actualizar la lista de productos en el DOM
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';
    loadSessionsFromLocalStorage();
    loadProductsFromLocalStorage();
}

function deleteSession(sessionName) {
    // Eliminar los productos de la sesión
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(product => product.sessionName !== sessionName);
    localStorage.setItem('products', JSON.stringify(products));

    // Eliminar la sesión de localStorage
    let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
    sessions = sessions.filter(session => session !== sessionName);
    localStorage.setItem('sessions', JSON.stringify(sessions));

    // Eliminar la sesión del DOM
    const sessionDiv = document.querySelector(`[data-session="${sessionName}"]`);
    if (sessionDiv) {
        sessionDiv.remove();
    }

    // Eliminar la opción del selector de sesiones
    const sessionSelect = document.getElementById('session-select');
    const optionToRemove = Array.from(sessionSelect.options).find(option => option.value === sessionName);
    if (optionToRemove) {
        optionToRemove.remove();
    }
}

document.getElementById('search-bar').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const productItems = document.querySelectorAll('.product-item');

    productItems.forEach(item => {
        const productName = item.querySelector('h3').textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});

window.onload = function() {
    loadSessionsFromLocalStorage();
    loadProductsFromLocalStorage();
    loadCartFromLocalStorage(); // Cargar el carrito desde localStorage
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 2000); // Ajusta el tiempo según sea necesario
};
