(() => {
  const STORAGE_KEY = 'inventario-tienda-demo-v2';
  const LOW_STOCK_THRESHOLD = 8;

  const sampleProducts = [
    { id: 'P-001', name: 'Cuaderno kraft A5', price: 4.50, quantity: 28 },
    { id: 'P-002', name: 'Lámpara de escritorio', price: 32.00, quantity: 12 },
    { id: 'P-003', name: 'Termo de acero 750 ml', price: 18.75, quantity: 7 },
    { id: 'P-004', name: 'Organizador de bambú', price: 24.90, quantity: 4 },
    { id: 'P-005', name: 'Bolígrafos de gel · paquete de 3', price: 3.50, quantity: 35 },
    { id: 'P-006', name: 'Taza de cerámica mate', price: 11.00, quantity: 6 },
    { id: 'P-007', name: 'Mochila urbana', price: 42.00, quantity: 15 },
  ];

  const timeToday = (hour, minute, daysAgo = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };

  const sampleMovements = [
    { id: 'M-004', productId: 'P-005', type: 'salida', quantity: 3, note: 'Entrega de mostrador', responsible: 'Ana', at: timeToday(10, 42) },
    { id: 'M-003', productId: 'P-004', type: 'entrada', quantity: 10, note: 'Reposición de proveedor', responsible: 'Luis', at: timeToday(9, 58) },
    { id: 'M-002', productId: 'P-003', type: 'salida', quantity: 1, note: 'Venta de tienda', responsible: 'Ana', at: timeToday(9, 15) },
    { id: 'M-001', productId: 'P-001', type: 'entrada', quantity: 8, note: 'Ingreso a bodega', responsible: 'Luis', at: timeToday(16, 30, 1) },
  ];

  const readSavedState = () => {
    try {
      const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (state && Array.isArray(state.products) && Array.isArray(state.movements)) return state;
    } catch (error) {
      console.info('Se usará el estado de demostración inicial.', error);
    }
    return { products: sampleProducts.map((product) => ({ ...product })), movements: sampleMovements.map((movement) => ({ ...movement })) };
  };

  const state = readSavedState();
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const number = new Intl.NumberFormat('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const integer = new Intl.NumberFormat('es-NI', { maximumFractionDigits: 0 });
  const dateTime = new Intl.DateTimeFormat('es-NI', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  let toastTimer;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      showToast('No se pudo guardar en este navegador.');
    }
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2700);
  }

  function stockStatus(quantity) {
    if (quantity === 0) return { label: 'Agotado', className: 'status-out' };
    if (quantity <= LOW_STOCK_THRESHOLD) return { label: 'Stock bajo', className: 'status-low' };
    return { label: 'Disponible', className: 'status-ok' };
  }

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
  }

  function getProduct(productId) {
    return state.products.find((product) => product.id === productId);
  }

  function movementRow(movement) {
    const product = getProduct(movement.productId);
    const isEntry = movement.type === 'entrada';
    const formattedDate = dateTime.format(new Date(movement.at));
    return `<tr>
      <td><div class="product-cell"><span class="product-initial">${escapeHtml(initials(product?.name || 'Producto'))}</span><span>${escapeHtml(product?.name || 'Producto eliminado')}<small class="product-id">${escapeHtml(product?.id || '')}</small></span></div></td>
      <td><span class="movement-kind ${isEntry ? 'entry' : 'exit'}">${isEntry ? 'Entrada' : 'Salida'}</span></td>
      <td class="movement-quantity ${isEntry ? 'positive' : 'negative'}">${isEntry ? '+' : '−'}${escapeHtml(movement.quantity)} uds.</td>
      <td>${escapeHtml(formattedDate)}</td>
      <td>${escapeHtml(movement.responsible || 'Equipo')}</td>
    </tr>`;
  }

  function renderOverview() {
    const productCount = state.products.length;
    const units = state.products.reduce((total, product) => total + Number(product.quantity || 0), 0);
    const value = state.products.reduce((total, product) => total + Number(product.quantity || 0) * Number(product.price || 0), 0);
    const lowProducts = state.products.filter((product) => Number(product.quantity) <= LOW_STOCK_THRESHOLD).sort((a, b) => a.quantity - b.quantity);
    const maxStock = Math.max(1, ...state.products.map((product) => Number(product.quantity) || 0));

    $('#metricProducts').textContent = productCount;
    $('#metricUnits').textContent = integer.format(units);
    $('#metricValue').textContent = number.format(value);
    $('#metricLow').textContent = lowProducts.length;
    $('#attentionCount').textContent = lowProducts.length;
    $('#navProductCount').textContent = productCount;

    const stockProducts = [...state.products].sort((a, b) => b.quantity - a.quantity).slice(0, 6);
    $('#stockList').innerHTML = stockProducts.length ? stockProducts.map((product) => {
      const quantity = Number(product.quantity) || 0;
      const width = Math.max(quantity > 0 ? 5 : 0, Math.round((quantity / maxStock) * 100));
      return `<div class="stock-item"><span class="stock-name" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</span><span class="bar-track"><span class="bar-fill ${quantity <= LOW_STOCK_THRESHOLD ? 'low' : ''}" style="width:${width}%"></span></span><span class="stock-quantity">${quantity}<small> uds.</small></span></div>`;
    }).join('') : '<div class="attention-empty">Agrega productos para ver el inventario.</div>';

    $('#attentionList').innerHTML = lowProducts.length ? lowProducts.slice(0, 4).map((product) => `<div class="attention-row"><span class="attention-product"><span class="alert-dot"></span><span>${escapeHtml(product.name)}</span></span><span class="attention-amount">${escapeHtml(product.quantity)} uds.</span></div>`).join('') : '<div class="attention-empty">Sin alertas de existencias por ahora.</div>';
    $('#recentMovements').innerHTML = state.movements.slice(0, 4).map(movementRow).join('') || '<tr><td colspan="5">Sin movimientos registrados.</td></tr>';
  }

  function renderProducts() {
    const term = ($('#productSearch')?.value || '').trim().toLocaleLowerCase('es');
    const filter = $('#stockFilter')?.value || 'all';
    const products = [...state.products].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    const visible = products.filter((product) => {
      const matchesTerm = `${product.name} ${product.id}`.toLocaleLowerCase('es').includes(term);
      const low = Number(product.quantity) <= LOW_STOCK_THRESHOLD;
      const matchesFilter = filter === 'all' || (filter === 'low' ? low : !low);
      return matchesTerm && matchesFilter;
    });

    $('#catalogCount').textContent = products.length;
    $('#productsTable').innerHTML = visible.map((product) => {
      const status = stockStatus(Number(product.quantity));
      return `<tr>
        <td><div class="product-cell"><span class="product-initial">${escapeHtml(initials(product.name))}</span><span>${escapeHtml(product.name)}<small class="product-id">${escapeHtml(product.id)}</small></span></div></td>
        <td class="price-cell">${number.format(Number(product.price))}</td>
        <td class="stock-cell ${Number(product.quantity) <= LOW_STOCK_THRESHOLD ? 'low' : ''}">${escapeHtml(product.quantity)} uds.</td>
        <td><span class="status ${status.className}">${status.label}</span></td>
        <td><span class="product-actions"><button class="icon-button" type="button" data-edit-product="${escapeHtml(product.id)}" aria-label="Editar ${escapeHtml(product.name)}" title="Editar">✎</button><button class="icon-button delete" type="button" data-delete-product="${escapeHtml(product.id)}" aria-label="Eliminar ${escapeHtml(product.name)}" title="Eliminar">×</button></span></td>
      </tr>`;
    }).join('');
    $('#emptyProducts').hidden = visible.length > 0;
  }

  function renderMovements() {
    const entries = state.movements.filter((movement) => movement.type === 'entrada').length;
    const exits = state.movements.length - entries;
    $('#movementCount').textContent = state.movements.length;
    $('#entryCount').textContent = entries;
    $('#exitCount').textContent = exits;
    $('#movementTable').innerHTML = state.movements.map((movement) => {
      const product = getProduct(movement.productId);
      const isEntry = movement.type === 'entrada';
      return `<tr>
        <td><div class="product-cell"><span class="product-initial">${escapeHtml(initials(product?.name || 'Producto'))}</span><span>${escapeHtml(product?.name || 'Producto eliminado')}<small class="product-id">${escapeHtml(product?.id || '')}</small></span></div></td>
        <td><span class="movement-kind ${isEntry ? 'entry' : 'exit'}">${isEntry ? 'Entrada' : 'Salida'}</span></td>
        <td class="movement-quantity">${isEntry ? '+' : '−'}${escapeHtml(movement.quantity)} uds.</td>
        <td>${escapeHtml(dateTime.format(new Date(movement.at)))}</td>
        <td>${escapeHtml(movement.note || 'Sin nota')}</td>
      </tr>`;
    }).join('');
    $('#emptyMovements').hidden = state.movements.length > 0;

    const select = $('#movementProduct');
    const previous = select.value;
    select.innerHTML = state.products.map((product) => `<option value="${escapeHtml(product.id)}">${escapeHtml(product.name)} · ${escapeHtml(product.quantity)} uds.</option>`).join('');
    if (state.products.some((product) => product.id === previous)) select.value = previous;
    select.disabled = state.products.length === 0;
  }

  function renderAll() {
    renderOverview();
    renderProducts();
    renderMovements();
  }

  function switchView(name) {
    const labels = { overview: 'Resumen', products: 'Productos', movements: 'Movimientos' };
    $$('[data-view-panel]').forEach((panel) => { panel.hidden = panel.dataset.viewPanel !== name; });
    $$('[data-view]').forEach((button) => {
      const isActive = button.dataset.view === name;
      button.classList.toggle('is-active', isActive && button.classList.contains('nav-item'));
      if (button.classList.contains('nav-item')) {
        if (isActive) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      }
    });
    $('#breadcrumbCurrent').textContent = labels[name] || 'Resumen';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openProductDialog(product = null) {
    const form = $('#productForm');
    form.reset();
    $('#productId').value = product?.id || '';
    $('#productDialogTitle').textContent = product ? 'Editar producto' : 'Nuevo producto';
    $('#productName').value = product?.name || '';
    $('#productPrice').value = product?.price ?? '';
    $('#productQuantity').value = product?.quantity ?? '';
    $('#productDialog').showModal();
    window.setTimeout(() => $('#productName').focus(), 0);
  }

  function createProductId() {
    const used = new Set(state.products.map((product) => product.id));
    let index = 1;
    while (used.has(`P-${String(index).padStart(3, '0')}`)) index += 1;
    return `P-${String(index).padStart(3, '0')}`;
  }

  document.addEventListener('click', (event) => {
    const viewButton = event.target.closest('[data-view]');
    if (viewButton) {
      event.preventDefault();
      switchView(viewButton.dataset.view);
      return;
    }

    const closeButton = event.target.closest('[data-close]');
    if (closeButton) {
      $(`#${closeButton.dataset.close}`).close();
      return;
    }

    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'add-product') {
      openProductDialog();
      return;
    }
    if (action === 'add-movement') {
      renderMovements();
      if (!state.products.length) {
        showToast('Agrega un producto antes de registrar movimientos.');
        return;
      }
      $('#movementForm').reset();
      $('#movementDialog').showModal();
      return;
    }

    const editId = event.target.closest('[data-edit-product]')?.dataset.editProduct;
    if (editId) {
      const product = getProduct(editId);
      if (product) openProductDialog(product);
      return;
    }

    const deleteId = event.target.closest('[data-delete-product]')?.dataset.deleteProduct;
    if (deleteId) {
      const product = getProduct(deleteId);
      if (product && window.confirm(`¿Eliminar “${product.name}” del prototipo?`)) {
        state.products = state.products.filter((item) => item.id !== deleteId);
        saveState();
        renderAll();
        showToast('Producto eliminado del prototipo.');
      }
    }
  });

  $('#productForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const id = $('#productId').value;
    const values = {
      name: $('#productName').value.trim(),
      price: Number($('#productPrice').value),
      quantity: Number($('#productQuantity').value),
    };
    if (!values.name || !Number.isFinite(values.price) || !Number.isInteger(values.quantity)) return;

    if (id) {
      const product = getProduct(id);
      if (product) Object.assign(product, values);
      showToast('Producto actualizado.');
    } else {
      state.products.push({ id: createProductId(), ...values });
      showToast('Producto agregado al prototipo.');
    }
    saveState();
    renderAll();
    $('#productDialog').close();
  });

  $('#movementForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const product = getProduct($('#movementProduct').value);
    const type = $('#movementType').value;
    const quantity = Number($('#movementQuantity').value);
    if (!product || !Number.isInteger(quantity) || quantity < 1) return;
    if (type === 'salida' && quantity > product.quantity) {
      showToast(`Solo hay ${product.quantity} unidades disponibles.`);
      $('#movementQuantity').focus();
      return;
    }

    product.quantity += type === 'entrada' ? quantity : -quantity;
    state.movements.unshift({
      id: `M-${Date.now()}`,
      productId: product.id,
      type,
      quantity,
      note: $('#movementNote').value.trim() || (type === 'entrada' ? 'Entrada de inventario' : 'Salida de inventario'),
      responsible: 'Equipo',
      at: new Date().toISOString(),
    });
    saveState();
    renderAll();
    $('#movementDialog').close();
    showToast(`Movimiento de ${type} aplicado; existencias actualizadas.`);
  });

  $('#productSearch').addEventListener('input', renderProducts);
  $('#stockFilter').addEventListener('change', renderProducts);

  renderAll();
})();
