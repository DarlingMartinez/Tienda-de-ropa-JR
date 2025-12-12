// --- DATA MANAGEMENT ---

// Default Data
const defaultProducts = [
    { id: 1, name: 'Pantalon floreado', code: '001', price: 35000, stock: 10, type: 'Pantalon' },
    { id: 2, name: 'Chaqueta de peluche', code: '002', price: 85000, stock: 5, type: 'Chaqueta' },
    { id: 3, name: 'Vestido floreado', code: '003', price: 45000, stock: 8, type: 'Vestido' },
    { id: 4, name: 'Vestido', code: '004', price: 40000, stock: 12, type: 'Vestido' }
];

const defaultUsers = [
    { id: 1, name: 'Juan Perez', email: 'juan@gmail.com', phone: '3001234567', role: 'Vendedor' },
    { id: 2, name: 'Claudia Patricia', email: 'claudia@gmail.com', phone: '3109876543', role: 'Administrador' },
    { id: 3, name: 'Tatiana Espinosa', email: 'TatES@gmail.com', phone: '3143070987', role: 'Vendedor' }
];

// Load Data
function loadData() {
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}

function getProducts() {
    return JSON.parse(localStorage.getItem('products'));
}

function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users'));
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart'));
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    loadData();

    // Check which page we are on and render accordingly
    if (document.getElementById('inventoryListContainer')) {
        renderProducts();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.addEventListener('input', renderProducts);
    }

    if (document.getElementById('usersSection')) {
        renderUsers();
    }

    if (document.getElementById('selectedProductsList')) {
        renderCart();
        updateCartCounter();
        renderSuggestedProducts();
    }
});


// --- SHARED UI FUNCTIONS ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}


// --- INVENTORY MODULE ---

let productToDeleteId = null;

function renderProducts() {
    const container = document.getElementById('inventoryListContainer');
    if (!container) return;

    const products = getProducts();
    const searchTerm = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase() : '';

    const filteredProducts = products.filter(product => {
        return product.name.toLowerCase().includes(searchTerm) || product.code.toLowerCase().includes(searchTerm);
    });

    container.innerHTML = '';
    filteredProducts.forEach(product => {
        const item = document.createElement('div');
        item.className = 'inv-list-item';
        item.innerHTML = `
            <span>${product.name} // cod. ${product.code}</span>
            <div class="action-icons">
                <i class="fas fa-pencil-alt" onclick="handleEdit(${product.id})"></i>
                <i class="fas fa-trash-alt" style="color: var(--color-danger);" onclick="handleDelete(${product.id})"></i>
            </div>
        `;
        container.appendChild(item);
    });
}

function handleEdit(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('editCode').value = product.code;
    document.getElementById('editName').value = product.name;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editStock').value = product.stock;
    document.getElementById('editType').value = product.type;

    document.getElementById('editModal').dataset.productId = id;

    updateTotalCost();

    document.getElementById('editPrice').oninput = updateTotalCost;
    document.getElementById('editStock').oninput = updateTotalCost;

    openModal('editModal');
}

function updateTotalCost() {
    const price = parseInt(document.getElementById('editPrice').value) || 0;
    const stock = parseInt(document.getElementById('editStock').value) || 0;
    const total = price * stock;
    document.getElementById('editTotalCost').innerText = `Costo total en ganacias : ${total} COP`;
}

function openConfirmEditModal() {
    const name = document.getElementById('editName').value;
    const code = document.getElementById('editCode').value;
    const price = document.getElementById('editPrice').value;
    const stock = document.getElementById('editStock').value;
    const type = document.getElementById('editType').value;
    const total = parseInt(price) * parseInt(stock);

    document.getElementById('confirmName').innerText = name;
    document.getElementById('confirmCode').innerText = `Cod. ${code}`;
    document.getElementById('confirmPrice').innerText = `Costo unitario : ${price} COP`;
    document.getElementById('confirmStock').innerText = `Cantidad en stock : ${stock}`;
    document.getElementById('confirmType').innerText = `Tipo de perenda: ${type}`;
    document.getElementById('confirmTotal').innerText = `Costo total en stock : ${total} COP`;

    openModal('confirmEditModal');
}

function showSuccessEdit() {
    const id = parseInt(document.getElementById('editModal').dataset.productId);
    let products = getProducts();
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex !== -1) {
        products[productIndex].name = document.getElementById('editName').value;
        products[productIndex].code = document.getElementById('editCode').value;
        products[productIndex].price = parseInt(document.getElementById('editPrice').value);
        products[productIndex].stock = parseInt(document.getElementById('editStock').value);
        products[productIndex].type = document.getElementById('editType').value;

        saveProducts(products);
        renderProducts();
    }

    closeModal('confirmEditModal');
    closeModal('editModal');
    openModal('successModal');
}

function handleDelete(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    productToDeleteId = id;
    const details = `
        <p>${product.name}</p>
        <p>Cod. ${product.code}</p>
        <p>Costo unitario : ${product.price} COP</p>
        <p>Cantidad en stock : ${product.stock}</p>
        <p>Costo total en stock : ${product.price * product.stock} COP</p>
    `;
    document.getElementById('deleteProductDetails').innerHTML = details;
    openModal('deleteModal');
}

function showSuccessDelete() {
    if (productToDeleteId !== null) {
        let products = getProducts();
        products = products.filter(p => p.id !== productToDeleteId);
        saveProducts(products);
        productToDeleteId = null;
        renderProducts();
    }
    closeModal('deleteModal');
    openModal('successDeleteModal');
}

// Registration (registrar.html)
function saveProduct() {
    // In a real app we would get values from inputs, but for this prototype we might just add a dummy or read the inputs if they exist
    // Let's try to read inputs if we are on the register page
    const codeInput = document.querySelector('.register-form-container input[value="001"]'); // Targeting by value is risky if user changed it, but let's assume structure
    // Better to use relative position or add IDs in HTML. I will add IDs in HTML later.
    // For now, let's just create a new product object

    // NOTE: I will need to update registrar.html to have IDs for these inputs to work properly.
    // Assuming IDs will be added: regCode, regName, regPrice, regStock, regType

    const code = document.getElementById('regCode') ? document.getElementById('regCode').value : 'NEW001';
    const name = document.getElementById('regName') ? document.getElementById('regName').value : 'Nuevo Producto';
    const price = document.getElementById('regPrice') ? parseInt(document.getElementById('regPrice').value) : 0;
    const stock = document.getElementById('regStock') ? parseInt(document.getElementById('regStock').value) : 0;
    const type = document.getElementById('regType') ? document.getElementById('regType').value : 'Pantalon';

    const products = getProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    products.push({
        id: newId,
        name: name,
        code: code,
        price: price,
        stock: stock,
        type: type
    });

    saveProducts(products);

    document.getElementById('successMessage').innerText = "El producto se registró con éxito";
    openModal('successModal');
}

function updateRegTotalCost() {
    const price = parseInt(document.getElementById('regPrice').value) || 0;
    const stock = parseInt(document.getElementById('regStock').value) || 0;
    const total = price * stock;
    const display = document.getElementById('regTotalCost');
    if (display) {
        display.innerText = `Costo total en ganacias : ${total} COP`;
    }
}

// Add listeners for registration form
document.addEventListener('DOMContentLoaded', () => {
    const regPrice = document.getElementById('regPrice');
    const regStock = document.getElementById('regStock');

    if (regPrice && regStock) {
        regPrice.addEventListener('input', updateRegTotalCost);
        regStock.addEventListener('input', updateRegTotalCost);
    }
});


// --- SALES MODULE ---

function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        const code = event.target.value.trim();
        handleSearch(code);
    }
}

function handleSearch(code) {
    const products = getProducts();
    const product = products.find(p => p.code === code);
    const resultContainer = document.getElementById('salesSearchResult');
    const card = document.getElementById('foundProductCard');

    if (product) {
        resultContainer.style.display = 'block';

        const cart = getCart();
        const cartItem = cart.find(item => item.id === product.id);
        const isInCart = !!cartItem;
        const circleColor = isInCart ? '#38B000' : 'white';
        const quantity = cartItem ? cartItem.quantity : 1;

        card.innerHTML = `
            <img src="https://via.placeholder.com/100x150" style="border-radius: 5px;">
            <div style="flex: 1;">
                <h3 style="margin-bottom: 5px;">${product.name} // ${product.code}</h3>
                <p style="font-weight: bold; margin-bottom: 10px;">$${product.price}</p>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="number" id="qty-search-${product.id}" value="${quantity}" min="1" 
                        style="width: 50px; padding: 5px; border-radius: 5px; border: 1px solid #ccc; color: black;"
                        onchange="updateQuantity(${product.id}, this.value)">
                    <div onclick="toggleProductSelection(${product.id}, 'search')" id="circle-search-${product.id}"
                        style="width: 30px; height: 30px; border: 2px solid #333; border-radius: 50%; background-color: ${circleColor}; cursor: pointer;">
                    </div>
                </div>
            </div>
        `;
    } else {
        resultContainer.style.display = 'none';
        alert('Producto no encontrado');
    }
}

function addToCartById(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    const cart = getCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    updateCartCounter();
    saveCart(cart);
    updateCartCounter();
    // alert('Producto agregado al carrito'); // Removed alert
}

function updateCartCounter() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counter = document.getElementById('cartCounter');
    const btn = document.getElementById('floatingCartBtn');

    if (counter) {
        counter.innerText = count;
    }

    if (btn) {
        if (count > 0) {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
            btn.style.cursor = 'pointer';
        } else {
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
            btn.style.cursor = 'not-allowed';
        }
    }
}

function showSearchResult() {
    // Legacy function, kept if needed or redirected
}

function showPaymentView() {
    document.getElementById('initialView').style.display = 'none';
    document.getElementById('paymentView').style.display = 'block';

    // Hide floating button
    const btn = document.getElementById('floatingCartBtn');
    if (btn) btn.style.display = 'none';

    renderCart();
}

function toggleCartView() {
    const initialView = document.getElementById('initialView');
    const paymentView = document.getElementById('paymentView');
    const btn = document.getElementById('floatingCartBtn');

    if (paymentView.style.display === 'block') {
        paymentView.style.display = 'none';
        initialView.style.display = 'block';
        if (btn) btn.style.display = 'flex'; // Show button
    } else {
        initialView.style.display = 'none';
        paymentView.style.display = 'block';
        renderCart();
        if (btn) btn.style.display = 'none'; // Hide button
    }
}

function openCategoryModal() {
    openModal('categoryModal');
    renderCategories();
}

function renderCategories() {
    const categories = ['Pantalones', 'Chaquetas', 'Camisas', 'Vestidos', 'Interiores'];
    const grid = document.querySelector('.category-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // Group 1: Vestidos, Pantalones, Camisas
    const group1 = ['Vestidos', 'Pantalones', 'Camisas'];
    // Group 2: Chaquetas, Interiores
    const group2 = ['Chaquetas', 'Interiores'];

    // Helper to create category item
    const createItem = (cat) => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.onclick = () => selectCategory(cat);
        item.innerHTML = `
            <img src="https://via.placeholder.com/200x150?text=${cat}" class="category-img">
            <div class="category-btn">${cat}</div>
        `;
        return item;
    };

    // Render Group 1
    group1.forEach(cat => grid.appendChild(createItem(cat)));

    // Render Group 2
    group2.forEach(cat => grid.appendChild(createItem(cat)));
}

function selectCategory(category) {
    const products = getProducts().filter(p => p.type.toLowerCase().includes(category.toLowerCase().slice(0, -1)) || p.type === category);
    const grid = document.querySelector('.category-grid');
    grid.style.display = 'block';

    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: left; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-arrow-left" onclick="renderCategories()" style="font-size: 1.5rem; cursor: pointer;"></i>
            <h3 style="margin: 0;">${category}</h3>
        </div>
    `;

    if (products.length === 0) {
        grid.innerHTML += '<div style="grid-column: 1/-1; text-align: center;">No hay productos en esta categoría.</div>';
        return;
    }

    const cart = getCart();

    products.forEach(p => {
        const cartItem = cart.find(item => item.id === p.id);
        const isInCart = !!cartItem;
        const circleColor = isInCart ? '#38B000' : 'white';
        const quantity = cartItem ? cartItem.quantity : 1;

        const item = document.createElement('div');
        item.className = 'category-item product-item'; // Added class for hover
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.justifyContent = 'space-between';
        item.style.padding = '10px';
        item.style.border = '1px solid #333';
        item.style.borderRadius = '5px';
        item.style.marginBottom = '10px';
        item.style.gridColumn = '1/-1';
        item.style.transition = 'background-color 0.2s';

        // Hover effect logic
        item.onmouseenter = () => { item.style.backgroundColor = '#094C62'; item.style.color = 'white'; };
        item.onmouseleave = () => { item.style.backgroundColor = 'transparent'; item.style.color = 'black'; };

        item.innerHTML = `
            <div style="text-align: left; flex: 1;">
                <div style="font-weight: bold;">${p.name}</div>
                <div style="font-size: 0.9rem; opacity: 0.8;">Cod. ${p.code}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="number" id="qty-${p.id}" value="${quantity}" min="1" 
                    style="width: 50px; padding: 5px; border-radius: 5px; border: 1px solid #ccc; color: black;"
                    onclick="event.stopPropagation()"
                    onchange="updateQuantity(${p.id}, this.value)">
                <div onclick="toggleProductSelection(${p.id})" id="circle-${p.id}"
                    style="width: 30px; height: 30px; border: 2px solid #333; border-radius: 50%; background-color: ${circleColor}; cursor: pointer;">
                </div>
            </div>
        `;
        grid.appendChild(item);
    });
}

function updateQuantity(id, qty) {
    let cart = getCart();
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
        cart[index].quantity = parseInt(qty);
        saveCart(cart);
        updateCartCounter();
    }
}

function toggleProductSelection(id, context = 'modal') {
    let cart = getCart();
    const index = cart.findIndex(item => item.id === id);

    // Determine IDs based on context (modal, search, suggested)
    // Actually, we should try to find elements in all contexts to keep them in sync
    const circleModal = document.getElementById(`circle-${id}`);
    const circleSearch = document.getElementById(`circle-search-${id}`);
    const circleSugg = document.getElementById(`circle-sugg-${id}`);

    const qtyInputModal = document.getElementById(`qty-${id}`);
    const qtyInputSearch = document.getElementById(`qty-search-${id}`);
    const qtyInputSugg = document.getElementById(`qty-sugg-${id}`);

    // Get quantity from the context that triggered the action
    let qty = 1;
    if (context === 'modal' && qtyInputModal) qty = parseInt(qtyInputModal.value);
    else if (context === 'search' && qtyInputSearch) qty = parseInt(qtyInputSearch.value);
    else if (context === 'suggested' && qtyInputSugg) qty = parseInt(qtyInputSugg.value);
    else {
        // Fallback: try to find any visible input
        if (qtyInputModal) qty = parseInt(qtyInputModal.value);
        else if (qtyInputSearch) qty = parseInt(qtyInputSearch.value);
        else if (qtyInputSugg) qty = parseInt(qtyInputSugg.value);
    }

    if (index !== -1) {
        // Remove from cart
        cart.splice(index, 1);
        const color = 'white';
        if (circleModal) circleModal.style.backgroundColor = color;
        if (circleSearch) circleSearch.style.backgroundColor = color;
        if (circleSugg) circleSugg.style.backgroundColor = color;
    } else {
        // Add to cart
        const products = getProducts();
        const product = products.find(p => p.id === id);
        if (product) {
            cart.push({ ...product, quantity: qty });
            const color = '#38B000';
            if (circleModal) circleModal.style.backgroundColor = color;
            if (circleSearch) circleSearch.style.backgroundColor = color;
            if (circleSugg) circleSugg.style.backgroundColor = color;
        }
    }

    saveCart(cart);
    updateCartCounter();
}

function renderSuggestedProducts() {
    const container = document.getElementById('suggestedProductsList');
    if (!container) return;

    // Use default products as suggested for now
    const products = getProducts().slice(0, 4); // Take first 4
    const cart = getCart();

    container.innerHTML = '';
    products.forEach(p => {
        const cartItem = cart.find(item => item.id === p.id);
        const isInCart = !!cartItem;
        const circleColor = isInCart ? '#38B000' : 'white';
        const quantity = cartItem ? cartItem.quantity : 1;

        const item = document.createElement('div');
        item.className = 'product-card-small';
        item.style.minWidth = '150px'; // Ensure width
        item.innerHTML = `
            <img src="https://via.placeholder.com/150x200" style="width: 100%; border-radius: 5px;">
            <div style="font-weight: bold; margin-top: 5px;">${p.name}</div>
            <div style="margin-bottom: 5px;">$${p.price}</div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <input type="number" id="qty-sugg-${p.id}" value="${quantity}" min="1" 
                    style="width: 40px; padding: 3px; border-radius: 5px; border: 1px solid #ccc; color: black;"
                    onchange="updateQuantity(${p.id}, this.value)">
                <div onclick="toggleProductSelection(${p.id}, 'suggested')" id="circle-sugg-${p.id}"
                    style="width: 25px; height: 25px; border: 2px solid #333; border-radius: 50%; background-color: ${circleColor}; cursor: pointer;">
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function addToCart() {
    // Legacy
}

function renderCart() {
    const list = document.getElementById('selectedProductsList');
    if (!list) return;

    const cart = getCart();
    list.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.innerHTML = `
            <span>${item.name} // ${item.code} (x${item.quantity})</span>
            <i class="fas fa-trash" style="color: red; cursor: pointer;" onclick="event.stopPropagation(); removeFromCart(${item.id})"></i>
        `;
        list.appendChild(div);
    });

    const totalInput = document.querySelector('.payment-input-readonly');
    if (totalInput) totalInput.value = `${total} cop`;
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);

    if (cart.length === 0) {
        // Return to main view if cart is empty
        toggleCartView();
        updateCartCounter();

        // Reset visuals
        renderSuggestedProducts();

        // If search result is visible and matches, update it
        const searchResultCard = document.getElementById('salesSearchResult');
        if (searchResultCard && searchResultCard.style.display === 'block') {
            const circleSearch = document.getElementById(`circle-search-${id}`);
            if (circleSearch) circleSearch.style.backgroundColor = 'white';
        }
    } else {
        renderCart();
        updateCartCounter();
    }
}

function generatePurchase() {
    const method = document.getElementById('paymentMethod').value;
    const totalStr = document.querySelector('.payment-input-readonly').value.replace('cop', '').trim();
    const total = parseInt(totalStr) || 0;
    const givenStr = document.getElementById('valorEntregado').value.toLowerCase().replace('cop', '').trim();
    const given = parseInt(givenStr) || 0;

    const changeText = document.getElementById('changeText');

    if (method === 'NA') {
        const change = given - total;
        changeText.innerText = `El cambio a entregar es : ${change} COP`;
    } else {
        changeText.innerText = `Costo total de la compra : ${total} COP`;
    }

    // Clear cart
    saveCart([]);
    openModal('changeModal');
}

function resetSalesView() {
    closeModal('changeModal');
    document.getElementById('paymentView').style.display = 'none';
    document.getElementById('initialView').style.display = 'block';

    // Show floating button again (will be disabled/hidden by updateCartCounter if 0)
    const btn = document.getElementById('floatingCartBtn');
    if (btn) btn.style.display = 'flex';

    updateCartCounter();
    renderSuggestedProducts(); // Reset suggested products visuals

    // Reset search if needed
    const searchInput = document.getElementById('salesSearchInput');
    if (searchInput) searchInput.value = '';
    document.getElementById('salesSearchResult').style.display = 'none';
}


// --- ADMIN MODULE ---

function renderUsers() {
    const container = document.querySelector('.user-list');
    if (!container) return;

    const users = getUsers();
    container.innerHTML = '';

    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'inv-list-item';
        item.style.borderBottom = '1px solid #ccc';
        item.style.padding = '10px 0';
        item.innerHTML = `
            <div style="font-size: 1.1rem; font-weight: bold;">${user.name}</div>
            <div class="action-icons">
                <i class="fas fa-pencil-alt" onclick="openEditUserModal(${user.id})"></i>
                <i class="fas fa-trash-alt" style="color: var(--color-danger);" onclick="openDeleteUserModal(${user.id})"></i>
            </div>
        `;
        container.appendChild(item);
    });
}

let userToEditId = null;
let userToDeleteId = null;

function openEditUserModal(id) {
    const users = getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return;

    userToEditId = id;
    // Assuming IDs for inputs in editUserModal. I will need to add these IDs in HTML.
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserPhone').value = user.phone;
    // document.getElementById('editUserRole').value = user.role; // If select exists

    openModal('editUserModal');
}

function saveEditUser() {
    if (userToEditId === null) return;

    let users = getUsers();
    const index = users.findIndex(u => u.id === userToEditId);

    if (index !== -1) {
        users[index].name = document.getElementById('editUserName').value;
        users[index].email = document.getElementById('editUserEmail').value;
        users[index].phone = document.getElementById('editUserPhone').value;
        // users[index].role = document.getElementById('editUserRole').value;

        saveUsers(users);
        renderUsers();
    }
    closeModal('editUserModal');
}

function openDeleteUserModal(id) {
    const users = getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return;

    userToDeleteId = id;

    document.getElementById('deleteUserName').innerText = user.name;
    document.getElementById('deleteUserRole').innerText = user.role;
    document.getElementById('deleteUserEmail').innerText = user.email;
    document.getElementById('deleteUserPhone').innerText = user.phone;

    openModal('deleteUserModal');
}

function confirmDeleteUser() {
    if (userToDeleteId !== null) {
        let users = getUsers();
        users = users.filter(u => u.id !== userToDeleteId);
        saveUsers(users);
        renderUsers();
    }
    closeModal('deleteUserModal');
}

function showCreateUserView() {
    document.getElementById('usersSection').style.display = 'none';
    document.getElementById('createUserSection').style.display = 'block';
}

function hideCreateUserView() {
    document.getElementById('createUserSection').style.display = 'none';
    document.getElementById('usersSection').style.display = 'block';
}

function saveNewUser() {
    // Need IDs in createUserSection
    const name = document.getElementById('newUserName') ? document.getElementById('newUserName').value : 'Nuevo Usuario';
    const email = document.getElementById('newUserEmail') ? document.getElementById('newUserEmail').value : 'correo@ejemplo.com';
    const phone = document.getElementById('newUserPhone') ? document.getElementById('newUserPhone').value : '0000000000';
    const role = document.getElementById('newUserRole') ? document.getElementById('newUserRole').value : 'Vendedor';

    const users = getUsers();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

    users.push({
        id: newId,
        name: name,
        email: email,
        phone: phone,
        role: role
    });

    saveUsers(users);
    renderUsers();

    openModal('successCreateUserModal');
    hideCreateUserView(); // Return to list after success modal closed? Or wait for OK?
    // The original flow said "La tabla se actualiza", usually implies going back to list.
}

// Helper for Admin tabs
function showSection(section) {
    document.getElementById('usersSection').style.display = section === 'users' ? 'block' : 'none';
    document.getElementById('historySection').style.display = section === 'history' ? 'block' : 'none';

    const btns = document.querySelectorAll('.sidebar-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    if (section === 'users') btns[1].classList.add('active');
    else btns[0].classList.add('active');
}

function openReportModal() {
    document.getElementById('reportModal').style.display = 'flex';
}

// --- LOGOUT FUNCTIONALITY ---

function toggleMenu() {
    const menu = document.getElementById('menuDropdown');
    if (menu) {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
}

function handleLogout() {
    // Clear session data if any (simulated)
    localStorage.removeItem('user'); // Example key
    // Force navigation to login
    window.location.href = '/login';
}
