/**
 * Trust-First V2: App Controller
 * Handles routing, pantry state, UI, and the walkthrough.
 */

const App = (() => {
    // ─── State ────────────────────────────────────────────────
    let pantryItems = [];        // [{ingredientId, quantity, unit}]
    let desiredServings = 2;
    let matchResults = [];
    let currentView = 'pantry';
    let selectedRecipe = null;
    let onboardingStep = 0;
    let hasCompletedOnboarding = false;
    let pendingIngredient = null; // for qty picker

    // ─── Init ─────────────────────────────────────────────────
    function init() {
        loadState();
        renderCurrentView();
        bindGlobalEvents();

        if (!hasCompletedOnboarding) {
            showOnboarding();
        }
    }

    // ─── State Persistence (localStorage) ─────────────────────
    function loadState() {
        try {
            const saved = localStorage.getItem('tf_pantry');
            if (saved) pantryItems = JSON.parse(saved);
            const servings = localStorage.getItem('tf_servings');
            if (servings) desiredServings = parseInt(servings, 10);
            hasCompletedOnboarding = localStorage.getItem('tf_onboarded') === 'true';
        } catch (e) { /* ignore */ }
    }

    function saveState() {
        localStorage.setItem('tf_pantry', JSON.stringify(pantryItems));
        localStorage.setItem('tf_servings', String(desiredServings));
    }

    function markOnboarded() {
        hasCompletedOnboarding = true;
        localStorage.setItem('tf_onboarded', 'true');
    }

    // ─── Navigation ───────────────────────────────────────────
    function navigate(view) {
        currentView = view;
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

        const viewEl = document.getElementById(`view-${view}`);
        const navEl = document.querySelector(`.nav-item[data-view="${view}"]`);
        if (viewEl) viewEl.classList.add('active');
        if (navEl) navEl.classList.add('active');
        renderCurrentView();
    }

    function renderCurrentView() {
        switch (currentView) {
            case 'pantry': renderPantryView(); break;
            case 'results': renderResultsView(); break;
            case 'detail': renderDetailView(); break;
            case 'settings': renderSettingsView(); break;
        }
    }

    // ─── Pantry View ──────────────────────────────────────────
    function renderPantryView() {
        const container = document.getElementById('pantry-items');
        const matchBtn = document.getElementById('match-btn');

        if (pantryItems.length === 0) {
            container.innerHTML = `
        <div class="pantry-empty">
          <div class="pantry-empty-icon">🧊</div>
          <p>냉장고가 비어있어요!<br>재료를 추가해보세요.</p>
        </div>`;
            renderCategoryBrowse();
            matchBtn.disabled = true;
        } else {
            container.innerHTML = pantryItems.map(item => {
                const ing = TFData.getIngredientById(item.ingredientId);
                if (!ing) return '';
                // If staple (high qty), don't show unit/qty, just checkmark or nothing
                const qtyDisplay = item.quantity >= 900 ? '✔' : formatQty(item.quantity, item.unit);

                return `
          <div class="pantry-chip" data-id="${item.ingredientId}" onclick="App.openQtyPicker('${item.ingredientId}', true)">
            <span class="chip-emoji">${ing.emoji}</span>
            <span>${ing.name}</span>
            <span class="chip-qty">${qtyDisplay}</span>
            <span class="chip-remove" onclick="event.stopPropagation(); App.removePantryItem('${item.ingredientId}')">✕</span>
          </div>`;
            }).join('');

            // ALWAYS show categories now (User Feedback: "icons go away")
            renderCategoryBrowse();
            matchBtn.disabled = false;
        }

        updateServingDisplay();
    }

    function renderCategoryBrowse() {
        const el = document.getElementById('category-browse');
        if (!el) return;
        const grouped = TFData.getIngredientsByCategory();
        const order = ['protein', 'seafood', 'vegetable', 'sauce', 'grain', 'staple'];

        el.innerHTML = order.map(cat => {
            const items = grouped[cat];
            if (!items || items.length === 0) return '';
            return `
        <div class="category-group">
          <div class="category-group-title">${TFData.getCategoryLabel(cat)}</div>
          <div class="category-items">
            ${items.map(ing => `
              <div class="browse-chip" onclick="App.openQtyPicker('${ing.id}', false)">
                <span>${ing.emoji}</span> ${ing.name}
              </div>
            `).join('')}
          </div>
        </div>`;
        }).join('');

        el.style.display = 'block';
    }

    function hideCategoryBrowse() {
        const el = document.getElementById('category-browse');
        if (el) el.style.display = 'none';
    }

    // ─── Search ───────────────────────────────────────────────
    function handleSearch(query) {
        const resultsEl = document.getElementById('search-results');
        if (!query || query.trim().length === 0) {
            resultsEl.classList.remove('open');
            return;
        }

        const results = TFData.searchIngredients(query);
        // Filter out already-added items
        const filtered = results.filter(r => !pantryItems.find(p => p.ingredientId === r.id));

        if (filtered.length === 0) {
            resultsEl.classList.remove('open');
            return;
        }

        resultsEl.innerHTML = filtered.map(r => `
      <div class="search-result-item" onclick="App.openQtyPicker('${r.id}', false)">
        <span class="search-result-emoji">${r.emoji}</span>
        <span class="search-result-name">${r.name}</span>
        <span class="search-result-category">${TFData.getCategoryLabel(r.category)}</span>
      </div>
    `).join('');
        resultsEl.classList.add('open');
    }

    // ─── Quantity Picker ──────────────────────────────────────
    function openQtyPicker(ingredientId, isEdit) {
        const ing = TFData.getIngredientById(ingredientId);
        if (!ing) return;

        // Smart Add: If staple/sauce and NOT editing, add immediately (Y/N mode)
        if (ing.isStaple && !isEdit) {
            addPantryItem(ingredientId, 999, 'whole');
            return;
        }

        pendingIngredient = { id: ingredientId, isEdit };

        const overlay = document.getElementById('qty-modal');
        const titleEl = document.getElementById('qty-modal-ingredient-name');
        const customInput = document.getElementById('qty-custom-value');

        titleEl.textContent = `${ing.emoji} ${ing.name}`;

        // If editing, pre-fill. If it's a staple being edited, show 1 as dummy?
        if (isEdit) {
            const existing = pantryItems.find(p => p.ingredientId === ingredientId);
            if (existing) customInput.value = (existing.quantity >= 900) ? 1 : existing.quantity;
        } else {
            // Default 300g for meat if unit is g?
            // For now keep 1 as default to avoid confusion
            customInput.value = '1';
        }

        // Clear preset selection
        document.querySelectorAll('.qty-preset-btn').forEach(b => b.classList.remove('selected'));

        overlay.classList.add('open');
        // Close search results
        const sr = document.getElementById('search-results');
        if (sr) sr.classList.remove('open');
        const si = document.getElementById('search-input');
        if (si) si.value = '';
    }

    function selectQtyPreset(value) {
        document.getElementById('qty-custom-value').value = value;
        document.querySelectorAll('.qty-preset-btn').forEach(b => {
            b.classList.toggle('selected', parseFloat(b.dataset.value) === parseFloat(value));
        });
    }

    function confirmQty() {
        if (!pendingIngredient) return;
        const qty = parseFloat(document.getElementById('qty-custom-value').value) || 1;

        if (pendingIngredient.isEdit) {
            const item = pantryItems.find(p => p.ingredientId === pendingIngredient.id);
            if (item) item.quantity = qty;
            saveState();
            renderPantryView();
        } else {
            addPantryItem(pendingIngredient.id, qty, 'whole');
        }
        closeQtyPicker();
    }

    function addPantryItem(ingredientId, qty, unit) {
        // Check if already exists
        const existing = pantryItems.find(p => p.ingredientId === ingredientId);
        if (existing) {
            existing.quantity = qty;
        } else {
            pantryItems.push({ ingredientId: ingredientId, quantity: qty, unit: unit || 'whole' });
        }
        renderPantryView();
        saveState();
    }

    function closeQtyPicker() {
        document.getElementById('qty-modal').classList.remove('open');
        pendingIngredient = null;
    }

    function removePantryItem(ingredientId) {
        pantryItems = pantryItems.filter(p => p.ingredientId !== ingredientId);
        saveState();
        renderPantryView();
    }

    // ─── Serving Size ─────────────────────────────────────────
    function adjustServings(delta) {
        desiredServings = Math.max(1, Math.min(10, desiredServings + delta));
        saveState();
        updateServingDisplay();
    }

    function updateServingDisplay() {
        const el = document.getElementById('serving-count');
        if (el) el.textContent = `${desiredServings}인분`;
    }

    // ─── Matching ─────────────────────────────────────────────
    function runMatch() {
        if (pantryItems.length === 0) return;
        matchResults = TFData.matchRecipes(pantryItems, desiredServings);
        navigate('results');
    }

    // ─── Results View ─────────────────────────────────────────
    function renderResultsView() {
        const container = document.getElementById('results-list');
        const highResults = matchResults.filter(r => r.confidence === 'high');
        const medResults = matchResults.filter(r => r.confidence === 'medium');

        if (matchResults.length === 0) {
            container.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🍳</div>
          <h3>일치하는 레시피가 없어요</h3>
          <p>재료를 더 추가하거나,<br>인분 수를 줄여보세요.</p>
        </div>`;
            return;
        }

        let html = '';

        if (highResults.length > 0) {
            html += `<div class="section-label">🟢 바로 만들 수 있어요 (${highResults.length})</div>`;
            html += highResults.map(r => renderRecipeCard(r)).join('');
        }

        if (medResults.length > 0) {
            html += `<div class="section-label mt-16">🟡 조금만 더 있으면 (${medResults.length})</div>`;
            html += medResults.map(r => renderRecipeCard(r)).join('');
        }

        container.innerHTML = html;
    }

    function renderRecipeCard(match) {
        const r = match.recipe;
        const coreIngs = r.ingredients.filter(i => i.role === 'core');

        // Match dots
        const dots = coreIngs.map(ci => {
            const inPantry = pantryItems.find(p => p.ingredientId === ci.id);
            return `<div class="match-dot ${inPantry ? 'matched' : 'missing'}"></div>`;
        }).join('');

        // Serving tip
        let servingTip = '';
        if (!match.canMakeAtDesired && match.suggestedServings >= 1) {
            servingTip = `
        <div class="recipe-card-serving-tip">
          💡 ${desiredServings}인분은 재료가 부족해요. <strong>${match.suggestedServings}인분</strong>으로 만들 수 있어요!
        </div>`;
        }

        // Variant hint
        let variantHint = '';
        if (match.variants.length > 0) {
            variantHint = `
        <div class="recipe-card-variant-hint">
          🔄 다른 버전도 있어요: ${match.variants.map(v => v.variantLabel || v.title).join(', ')}
        </div>`;
        }

        // Missing core
        let missingHint = '';
        if (match.coreMissing.length > 0) {
            missingHint = match.coreMissing.map(m => `<span style="color:var(--color-accent-red);">−${m.name}</span>`).join(' ');
        }

        return `
      <div class="recipe-card" onclick="App.openRecipe('${r.id}', ${JSON.stringify(match.suggestedServings)})">
        <div class="recipe-card-header">
          <div class="recipe-card-title">${r.title}</div>
          <div class="confidence-badge ${match.confidence}">${match.confidence === 'high' ? '완벽' : '거의'}</div>
        </div>
        <div class="recipe-card-desc">${r.description}</div>
        <div class="recipe-card-meta">
          <span>⏱ ${r.cookTime}분</span>
          <span>👤 ${r.baseServings}인분</span>
          <span>🥘 ${match.coreMatched}/${match.coreTotal} 재료</span>
          ${missingHint ? `<span>${missingHint}</span>` : ''}
        </div>
        <div class="ingredient-match-bar">${dots}</div>
        ${servingTip}
        ${variantHint}
      </div>`;
    }

    // ─── Recipe Detail View ───────────────────────────────────
    function openRecipe(recipeId, servings) {
        selectedRecipe = { id: recipeId, servings: servings || desiredServings };
        currentView = 'detail';
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.getElementById('view-detail').classList.add('active');
        renderDetailView();
    }

    function renderDetailView() {
        if (!selectedRecipe) return;
        const recipe = TFData.getRecipeById(selectedRecipe.id);
        if (!recipe) return;

        const container = document.getElementById('detail-content');
        const scale = selectedRecipe.servings / recipe.baseServings;
        const pantryMap = {};
        pantryItems.forEach(p => { pantryMap[p.ingredientId] = p; });

        // Ingredients list
        const ingredientsList = recipe.ingredients.map(ri => {
            const ing = TFData.getIngredientById(ri.id);
            if (!ing) return '';
            const inPantry = pantryMap[ri.id];
            const scaledQty = ri.qty ? (ri.qty * scale) : null;
            let statusClass = '';
            let statusText = '';

            if (ri.role === 'core') {
                statusClass = inPantry ? 'have' : 'missing';
                statusText = inPantry ? '보유' : '부족';
            } else if (ri.role === 'optional') {
                statusClass = 'optional-label';
                statusText = inPantry ? '보유' : '선택';
            } else {
                statusClass = 'optional-label';
                statusText = '장식';
            }

            return `
        <li class="recipe-ingredient-item">
          <span class="ing-emoji">${ing.emoji}</span>
          <span class="ing-name">${ing.name}</span>
          <span class="ing-qty">${scaledQty !== null ? formatQty(scaledQty, ri.unit) : ''}</span>
          <span class="ing-status ${statusClass}">${statusText}</span>
        </li>`;
        }).join('');

        // Steps
        const stepsList = recipe.steps.map(step => `
      <li class="recipe-step-item">
        <span class="recipe-step-text">${step}</span>
      </li>`).join('');

        // Variant siblings
        let variantSection = '';
        if (recipe.variantGroupId) {
            const siblings = TFData.getRecipes().filter(
                r => r.variantGroupId === recipe.variantGroupId && r.id !== recipe.id
            );
            if (siblings.length > 0) {
                variantSection = `
          <div class="recipe-section-title">🔄 다른 버전</div>
          ${siblings.map(s => `
            <div class="recipe-card" onclick="App.openRecipe('${s.id}', ${selectedRecipe.servings})" style="margin-bottom:8px;">
              <div class="recipe-card-header">
                <div class="recipe-card-title">${s.title}</div>
                <span style="font-size:0.8rem;color:var(--color-accent-blue);">${s.variantLabel || ''}</span>
              </div>
              <div class="recipe-card-desc">${s.description}</div>
            </div>
          `).join('')}
        `;
            }
        }

        container.innerHTML = `
      <button class="recipe-detail-back" onclick="App.backToResults()">← 목록으로</button>
      <div class="recipe-detail-title">${recipe.title}</div>
      <div class="recipe-detail-meta">
        <span class="meta-item">⏱ ${recipe.cookTime}분</span>
        <span class="meta-item">👤 ${selectedRecipe.servings}인분</span>
        <span class="meta-item">${recipe.difficulty === 'easy' ? '쉬움' : recipe.difficulty === 'medium' ? '보통' : '어려움'}</span>
      </div>
      <p class="recipe-card-desc" style="margin-bottom:0;">${recipe.description}</p>

      <div class="recipe-section-title">🥘 재료</div>
      <ul class="recipe-ingredient-list">${ingredientsList}</ul>

      <div class="recipe-section-title">👩‍🍳 만드는 법</div>
      <ol class="recipe-steps-list">${stepsList}</ol>

      ${variantSection}

      <button class="post-cooking-btn" onclick="App.openPostCooking()">
        ✅ 요리 완료! 재료 업데이트
      </button>
    `;
    }

    function backToResults() {
        selectedRecipe = null;
        navigate('results');
    }

    // ─── Post-Cooking Update ──────────────────────────────────
    function openPostCooking() {
        if (!selectedRecipe) return;
        const recipe = TFData.getRecipeById(selectedRecipe.id);
        if (!recipe) return;

        const overlay = document.getElementById('post-cooking-modal');
        const content = document.getElementById('post-cooking-content');
        const scale = selectedRecipe.servings / recipe.baseServings;

        const usedIngredients = recipe.ingredients.filter(ri => {
            return ri.role === 'core' && pantryItems.find(p => p.ingredientId === ri.id);
        });

        content.innerHTML = `
      <div class="qty-modal-header">
        <div class="qty-modal-title">🍽️ 요리 후 재료 업데이트</div>
        <button class="qty-modal-close" onclick="App.closePostCooking()">✕</button>
      </div>
      <p class="text-secondary mb-16" style="font-size:0.85rem;">레시피에 사용된 재료를 자동으로 차감했어요. 수정이 필요하면 직접 변경해주세요.</p>
      ${usedIngredients.map(ri => {
            const ing = TFData.getIngredientById(ri.id);
            const pantryItem = pantryItems.find(p => p.ingredientId === ri.id);
            if (!ing || !pantryItem) return '';
            const used = (ri.qty || 0) * scale;
            const remaining = Math.max(0, pantryItem.quantity - used);
            return `
          <div class="post-cook-item">
            <span>${ing.emoji}</span>
            <span class="pc-name">${ing.name}</span>
            <span class="pc-calc">${pantryItem.quantity} − ${formatQty(used, ri.unit)} =</span>
            <input class="pc-input" type="number" step="0.25" min="0" value="${remaining}" data-id="${ri.id}">
          </div>`;
        }).join('')}
      <button class="qty-confirm-btn" onclick="App.confirmPostCooking()" style="margin-top:16px;">
        ✅ 업데이트 완료
      </button>
    `;

        overlay.classList.add('open');
    }

    function confirmPostCooking() {
        const inputs = document.querySelectorAll('#post-cooking-content .pc-input');
        inputs.forEach(input => {
            const id = input.dataset.id;
            const newQty = parseFloat(input.value) || 0;
            if (newQty <= 0) {
                pantryItems = pantryItems.filter(p => p.ingredientId !== id);
            } else {
                const item = pantryItems.find(p => p.ingredientId === id);
                if (item) item.quantity = newQty;
            }
        });

        saveState();
        closePostCooking();
        // Show confirmation
        renderDetailView();
    }

    function closePostCooking() {
        document.getElementById('post-cooking-modal').classList.remove('open');
    }

    // ─── Settings View ────────────────────────────────────────
    function renderSettingsView() {
        // Already rendered in HTML, but we can update dynamic content here
    }

    function resetOnboarding() {
        hasCompletedOnboarding = false;
        localStorage.removeItem('tf_onboarded');
        showOnboarding();
    }

    function clearPantry() {
        if (confirm('모든 재료를 삭제하시겠습니까?')) {
            pantryItems = [];
            saveState();
            navigate('pantry');
        }
    }

    // ─── Onboarding Walkthrough ───────────────────────────────
    const onboardingSteps = [
        {
            emoji: '🧊',
            title: '내 냉장고를 등록하세요!',
            desc: '냉장고에 있는 재료를 검색하거나, 카테고리에서 골라 추가해보세요.',
        },
        {
            emoji: '🔢',
            title: '수량을 입력하세요',
            desc: '양파 2개? 반 개? 1/4?\n정확한 수량을 입력하면 더 정확한 레시피를 추천받을 수 있어요.',
        },
        {
            emoji: '🍲',
            title: '레시피를 찾아보세요!',
            desc: '재료를 모두 추가했으면 "레시피 찾기" 버튼을 누르세요.\n가지고 있는 재료로 만들 수 있는 요리만 보여드려요.',
        },
        {
            emoji: '✅',
            title: '요리 후 업데이트',
            desc: '요리를 완성한 후 "요리 완료" 버튼을 누르면\n사용된 재료가 자동으로 차감됩니다.',
        },
    ];

    function showOnboarding() {
        onboardingStep = 0;
        const overlay = document.getElementById('onboarding-overlay');
        overlay.classList.add('active');
        renderOnboardingStep();
    }

    function renderOnboardingStep() {
        const step = onboardingSteps[onboardingStep];
        const card = document.getElementById('onboarding-card');
        const isLast = onboardingStep === onboardingSteps.length - 1;

        card.innerHTML = `
      <div class="onboarding-emoji">${step.emoji}</div>
      <div class="onboarding-title">${step.title}</div>
      <div class="onboarding-desc">${step.desc.replace(/\n/g, '<br>')}</div>
      <div class="onboarding-dots">
        ${onboardingSteps.map((_, i) => `
          <div class="onboarding-dot ${i === onboardingStep ? 'active' : ''}"></div>
        `).join('')}
      </div>
      <div class="onboarding-actions">
        <button class="onboarding-skip" onclick="App.skipOnboarding()">건너뛰기</button>
        <button class="onboarding-next" onclick="App.nextOnboarding()">
          ${isLast ? '시작하기! 🎉' : '다음 →'}
        </button>
      </div>
    `;
    }

    function nextOnboarding() {
        if (onboardingStep < onboardingSteps.length - 1) {
            onboardingStep++;
            renderOnboardingStep();
        } else {
            skipOnboarding();
        }
    }

    function skipOnboarding() {
        const overlay = document.getElementById('onboarding-overlay');
        overlay.classList.remove('active');
        markOnboarded();
    }

    // ─── Global Events ────────────────────────────────────────
    function bindGlobalEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => navigate(btn.dataset.view));
        });

        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let debounce;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounce);
                debounce = setTimeout(() => handleSearch(e.target.value), 150);
            });

            // Close search on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    const sr = document.getElementById('search-results');
                    if (sr) sr.classList.remove('open');
                }
            });
        }

        // Qty modal overlay click-to-close
        document.getElementById('qty-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'qty-modal') closeQtyPicker();
        });
        document.getElementById('post-cooking-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'post-cooking-modal') closePostCooking();
        });
    }

    // ─── Helpers ──────────────────────────────────────────────
    function formatQty(qty, unit) {
        if (qty === null || qty === undefined) return '';
        const unitLabel = TFData.getUnitLabel(unit || 'whole');
        // Nice fraction display
        if (qty === 0.25) return `¼${unitLabel}`;
        if (qty === 0.5) return `½${unitLabel}`;
        if (qty === 0.75) return `¾${unitLabel}`;
        if (qty % 1 === 0) return `${qty}${unitLabel}`;
        return `${qty}${unitLabel}`;
    }

    // ─── Public API ───────────────────────────────────────────
    return {
        init,
        navigate,
        handleSearch,
        openQtyPicker,
        selectQtyPreset,
        confirmQty,
        closeQtyPicker,
        removePantryItem,
        adjustServings,
        runMatch,
        openRecipe,
        backToResults,
        openPostCooking,
        confirmPostCooking,
        closePostCooking,
        resetOnboarding,
        clearPantry,
        nextOnboarding,
        skipOnboarding,
    };
})();

document.addEventListener('DOMContentLoaded', App.init);
