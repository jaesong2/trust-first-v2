/**
 * Trust-First V2: Local Data Store
 * Simulates Supabase until backend is connected.
 * Data structures are aligned to the Postgres schema for migration.
 */

const TFData = (() => {
    // ─── Ingredients ─────────────────────────────────────────
    const ingredients = [
        // Proteins
        { id: 'a01', name: '닭가슴살', category: 'protein', emoji: '🍗', templeOk: false },
        { id: 'a02', name: '닭다리살', category: 'protein', emoji: '🍗', templeOk: false },
        { id: 'a03', name: '삼겹살', category: 'protein', emoji: '🥓', templeOk: false },
        { id: 'a04', name: '소고기(불고기용)', category: 'protein', emoji: '🥩', templeOk: false },
        { id: 'a05', name: '돼지고기(앞다리)', category: 'protein', emoji: '🥩', templeOk: false },
        { id: 'a06', name: '두부', category: 'protein', emoji: '🧈', templeOk: true },
        { id: 'a07', name: '계란', category: 'protein', emoji: '🥚', templeOk: false },
        { id: 'a08', name: '새우', category: 'seafood', emoji: '🦐', templeOk: false },
        { id: 'a09', name: '오징어', category: 'seafood', emoji: '🦑', templeOk: false },
        { id: 'a10', name: '참치캔', category: 'protein', emoji: '🐟', templeOk: false },
        // Vegetables
        { id: 'b01', name: '양파', category: 'vegetable', emoji: '🧅', templeOk: true },
        { id: 'b02', name: '대파', category: 'vegetable', emoji: '🧅', templeOk: true },
        { id: 'b03', name: '마늘', category: 'vegetable', emoji: '🧄', templeOk: true },
        { id: 'b04', name: '감자', category: 'vegetable', emoji: '🥔', templeOk: true },
        { id: 'b05', name: '당근', category: 'vegetable', emoji: '🥕', templeOk: true },
        { id: 'b06', name: '호박', category: 'vegetable', emoji: '🎃', templeOk: true },
        { id: 'b07', name: '배추', category: 'vegetable', emoji: '🥬', templeOk: true },
        { id: 'b08', name: '콩나물', category: 'vegetable', emoji: '🌱', templeOk: true },
        { id: 'b09', name: '시금치', category: 'vegetable', emoji: '🥬', templeOk: true },
        { id: 'b10', name: '무', category: 'vegetable', emoji: '🥕', templeOk: true },
        { id: 'b11', name: '고추', category: 'vegetable', emoji: '🌶️', templeOk: true },
        { id: 'b12', name: '버섯', category: 'vegetable', emoji: '🍄', templeOk: true },
        { id: 'b13', name: '부추', category: 'vegetable', emoji: '🌿', templeOk: true },
        { id: 'b14', name: '깻잎', category: 'vegetable', emoji: '🍃', templeOk: true },
        { id: 'b15', name: '애호박', category: 'vegetable', emoji: '🥒', templeOk: true },
        // Sauces
        { id: 'c01', name: '간장', category: 'sauce', emoji: '🫙', templeOk: true },
        { id: 'c02', name: '고추장', category: 'sauce', emoji: '🫙', templeOk: true },
        { id: 'c03', name: '된장', category: 'sauce', emoji: '🫙', templeOk: true },
        { id: 'c04', name: '고춧가루', category: 'sauce', emoji: '🌶️', templeOk: true },
        { id: 'c05', name: '참기름', category: 'sauce', emoji: '🫗', templeOk: true },
        { id: 'c06', name: '식용유', category: 'sauce', emoji: '🫗', templeOk: true },
        { id: 'c07', name: '설탕', category: 'sauce', emoji: '🧂', templeOk: true },
        { id: 'c08', name: '소금', category: 'sauce', emoji: '🧂', templeOk: true },
        { id: 'c09', name: '후추', category: 'sauce', emoji: '🧂', templeOk: true },
        { id: 'c10', name: '미림', category: 'sauce', emoji: '🍶', templeOk: true },
        { id: 'c11', name: '식초', category: 'sauce', emoji: '🫗', templeOk: true },
        { id: 'c12', name: '카레가루', category: 'sauce', emoji: '🟡', templeOk: true },
        { id: 'c13', name: '다진마늘', category: 'sauce', emoji: '🧄', templeOk: true },
        { id: 'c14', name: '생강', category: 'sauce', emoji: '🫚', templeOk: true },
        { id: 'c15', name: '물엿', category: 'sauce', emoji: '🍯', templeOk: true },
        // Staples / Grains
        { id: 'd01', name: '밥(쌀)', category: 'grain', emoji: '🍚', templeOk: true },
        { id: 'd02', name: '라면사리', category: 'grain', emoji: '🍜', templeOk: true },
        { id: 'd03', name: '김치', category: 'staple', emoji: '🥬', templeOk: true },
        { id: 'd04', name: '떡(떡볶이용)', category: 'grain', emoji: '🍡', templeOk: true },
        { id: 'd05', name: '어묵', category: 'protein', emoji: '🍢', templeOk: false },
        { id: 'd06', name: '밀가루', category: 'grain', emoji: '🌾', templeOk: true },
        { id: 'd07', name: '김', category: 'staple', emoji: '🟫', templeOk: true },
        { id: 'd08', name: '깨', category: 'staple', emoji: '⚪', templeOk: true },
    ];

    // ─── Aliases (Korean search terms) ────────────────────────
    const aliases = [
        { ingredientId: 'b01', alias: '양파' }, { ingredientId: 'b01', alias: '어니언' },
        { ingredientId: 'b02', alias: '대파' }, { ingredientId: 'b02', alias: '파' }, { ingredientId: 'b02', alias: '쪽파' },
        { ingredientId: 'b03', alias: '마늘' }, { ingredientId: 'b03', alias: '다진 마늘' },
        { ingredientId: 'b04', alias: '감자' }, { ingredientId: 'b05', alias: '당근' },
        { ingredientId: 'c01', alias: '간장' }, { ingredientId: 'c01', alias: '진간장' }, { ingredientId: 'c01', alias: '국간장' },
        { ingredientId: 'c02', alias: '고추장' }, { ingredientId: 'c03', alias: '된장' }, { ingredientId: 'c03', alias: '된쟝' },
        { ingredientId: 'c04', alias: '고춧가루' }, { ingredientId: 'c04', alias: '고추가루' },
        { ingredientId: 'c05', alias: '참기름' }, { ingredientId: 'c06', alias: '식용유' },
        { ingredientId: 'c07', alias: '설탕' }, { ingredientId: 'c08', alias: '소금' }, { ingredientId: 'c09', alias: '후추' },
        { ingredientId: 'c12', alias: '카레가루' }, { ingredientId: 'c12', alias: '카레' },
        { ingredientId: 'd03', alias: '김치' }, { ingredientId: 'd03', alias: '배추김치' }, { ingredientId: 'd03', alias: '묵은지' },
        { ingredientId: 'a06', alias: '두부' }, { ingredientId: 'a07', alias: '계란' }, { ingredientId: 'a07', alias: '달걀' },
        { ingredientId: 'a03', alias: '삼겹살' }, { ingredientId: 'a03', alias: '삼겹' },
        { ingredientId: 'a04', alias: '소고기' }, { ingredientId: 'a04', alias: '불고기용' },
        { ingredientId: 'a02', alias: '닭다리살' }, { ingredientId: 'a02', alias: '닭다리' },
        { ingredientId: 'a01', alias: '닭가슴살' },
        { ingredientId: 'd01', alias: '밥' }, { ingredientId: 'd01', alias: '쌀' }, { ingredientId: 'd01', alias: '쌀밥' },
        { ingredientId: 'b06', alias: '호박' }, { ingredientId: 'b15', alias: '애호박' },
        { ingredientId: 'b07', alias: '배추' }, { ingredientId: 'b08', alias: '콩나물' },
        { ingredientId: 'b09', alias: '시금치' }, { ingredientId: 'b10', alias: '무' },
        { ingredientId: 'b11', alias: '고추' }, { ingredientId: 'b11', alias: '청양고추' },
        { ingredientId: 'b12', alias: '버섯' }, { ingredientId: 'b12', alias: '표고버섯' }, { ingredientId: 'b12', alias: '팽이버섯' },
        { ingredientId: 'b13', alias: '부추' }, { ingredientId: 'b14', alias: '깻잎' },
        { ingredientId: 'd04', alias: '떡' }, { ingredientId: 'd04', alias: '떡볶이떡' },
        { ingredientId: 'd05', alias: '어묵' }, { ingredientId: 'd05', alias: '오뎅' },
        { ingredientId: 'a08', alias: '새우' }, { ingredientId: 'a10', alias: '참치캔' }, { ingredientId: 'a10', alias: '참치' },
        { ingredientId: 'd02', alias: '라면' }, { ingredientId: 'd02', alias: '라면사리' },
        { ingredientId: 'c10', alias: '미림' }, { ingredientId: 'c11', alias: '식초' },
        { ingredientId: 'c14', alias: '생강' }, { ingredientId: 'c15', alias: '물엿' },
        { ingredientId: 'd06', alias: '밀가루' }, { ingredientId: 'd07', alias: '김' },
        { ingredientId: 'd08', alias: '깨' }, { ingredientId: 'd08', alias: '참깨' },
        { ingredientId: 'a05', alias: '돼지고기' }, { ingredientId: 'a05', alias: '앞다리살' },
        { ingredientId: 'a09', alias: '오징어' }, { ingredientId: 'c13', alias: '다진마늘' },
    ];

    // ─── Auto-mark Staples ────────────────────────────────────
    const stapleCategories = ['sauce', 'oil', 'spice', 'grain', 'staple', 'processed'];
    ingredients.forEach(i => {
        if (stapleCategories.includes(i.category)) {
            i.isStaple = true;
        }
    });
    const recipes = [
        {
            id: 'r01', title: '김치찌개', description: '깊은 맛의 묵은지 김치찌개. 돼지고기와 두부가 어우러진 한국 대표 찌개.',
            baseServings: 2, difficulty: 'easy', cookTime: 25, variantGroupId: null, variantLabel: null,
            ingredients: [
                { id: 'd03', role: 'core', qty: 1, unit: 'cup' },
                { id: 'a05', role: 'core', qty: 150, unit: 'g' },
                { id: 'a06', role: 'core', qty: 0.5, unit: 'whole' },
                { id: 'b02', role: 'core', qty: 1, unit: 'whole' },
                { id: 'b01', role: 'optional', qty: 0.5, unit: 'whole' },
                { id: 'b11', role: 'garnish', qty: 1, unit: 'whole' },
            ],
            steps: [
                '김치를 먹기 좋은 크기로 썰어주세요.',
                '냄비에 식용유를 두르고 돼지고기를 볶아주세요.',
                '고기가 익으면 김치를 넣고 함께 볶아주세요.',
                '물 400ml를 넣고 끓여주세요.',
                '끓어오르면 두부를 넣고 5분 더 끓여주세요.',
                '대파를 썰어 넣고 마무리합니다.',
            ],
        },
        {
            id: 'r02', title: '된장찌개', description: '구수한 된장의 풍미가 살아있는 한국식 된장찌개.',
            baseServings: 2, difficulty: 'easy', cookTime: 25, variantGroupId: null, variantLabel: null,
            ingredients: [
                { id: 'c03', role: 'core', qty: 2, unit: 'tbsp' },
                { id: 'a06', role: 'core', qty: 0.5, unit: 'whole' },
                { id: 'b15', role: 'core', qty: 0.5, unit: 'whole' },
                { id: 'b04', role: 'core', qty: 1, unit: 'whole' },
                { id: 'b01', role: 'optional', qty: 0.5, unit: 'whole' },
                { id: 'b12', role: 'optional', qty: 3, unit: 'whole' },
                { id: 'b02', role: 'garnish', qty: 0.5, unit: 'whole' },
            ],
            steps: [
                '감자와 애호박을 깍둑 썰어주세요.',
                '냄비에 물 400ml를 넣고 된장을 풀어주세요.',
                '감자를 먼저 넣고 5분 끓여주세요.',
                '애호박, 두부, 버섯을 넣고 10분 더 끓여주세요.',
                '대파를 넣어 마무리합니다.',
            ],
        },
        {
            id: 'r03', title: '불고기', description: '달콤한 간장 양념의 한국 대표 소고기 요리.',
            baseServings: 2, difficulty: 'easy', cookTime: 30, variantGroupId: null, variantLabel: null,
            ingredients: [
                { id: 'a04', role: 'core', qty: 300, unit: 'g' },
                { id: 'b01', role: 'core', qty: 1, unit: 'whole' },
                { id: 'c01', role: 'core', qty: 3, unit: 'tbsp' },
                { id: 'c07', role: 'optional', qty: 1, unit: 'tbsp' },
                { id: 'c05', role: 'optional', qty: 1, unit: 'tbsp' },
                { id: 'b02', role: 'garnish', qty: 1, unit: 'whole' },
            ],
            steps: [
                '소고기를 양념(간장 3큰술, 설탕 1큰술, 참기름 1큰술, 다진 마늘)에 30분 재워주세요.',
                '양파를 채 썰어주세요.',
                '팬에 양파와 재운 소고기를 함께 볶아주세요.',
                '고기가 다 익으면 대파를 넣어 마무리합니다.',
            ],
        },
        {
            id: 'r04', title: '한국식 카레', description: '닭다리살을 사용한 구수한 한국식 카레.',
            baseServings: 4, difficulty: 'easy', cookTime: 35, variantGroupId: 'vg01', variantLabel: '한국식 (닭다리살)',
            ingredients: [
                { id: 'a02', role: 'core', qty: 300, unit: 'g' },
                { id: 'b04', role: 'core', qty: 2, unit: 'whole' },
                { id: 'b01', role: 'core', qty: 1, unit: 'whole' },
                { id: 'b05', role: 'core', qty: 1, unit: 'whole' },
                { id: 'c12', role: 'core', qty: 4, unit: 'tbsp' },
                { id: 'd01', role: 'optional', qty: 2, unit: 'cup' },
            ],
            steps: [
                '닭다리살을 한입 크기로 자르고, 감자와 당근, 양파를 깍둑 썰어주세요.',
                '팬에 식용유를 두르고 닭다리살을 볶아주세요.',
                '양파, 당근, 감자를 넣고 함께 볶아주세요.',
                '물 600ml를 넣고 감자가 익을 때까지 끓여주세요.',
                '카레가루를 넣고 잘 풀어 5분 더 끓여주세요.',
            ],
        },
        {
            id: 'r05', title: '일본식 카레', description: '삼겹살을 사용한 진한 일본식 카레.',
            baseServings: 4, difficulty: 'easy', cookTime: 40, variantGroupId: 'vg01', variantLabel: '일본식 (삼겹살)',
            ingredients: [
                { id: 'a03', role: 'core', qty: 200, unit: 'g' },
                { id: 'b04', role: 'core', qty: 2, unit: 'whole' },
                { id: 'b01', role: 'core', qty: 1, unit: 'whole' },
                { id: 'b05', role: 'core', qty: 1, unit: 'whole' },
                { id: 'c12', role: 'core', qty: 4, unit: 'tbsp' },
                { id: 'd01', role: 'optional', qty: 2, unit: 'cup' },
            ],
            steps: [
                '삼겹살을 얇게 자르고, 감자와 당근, 양파를 깍둑 썰어주세요.',
                '냄비에 식용유를 두르고 삼겹살을 볶아주세요.',
                '양파, 당근, 감자를 넣고 함께 볶아주세요.',
                '물 700ml를 넣고 20분 끓여주세요.',
                '카레가루를 넣고 걸쭉해질 때까지 저어주세요.',
            ],
        },
        {
            id: 'r06', title: '떡볶이', description: '매콤달콤한 국민 간식 떡볶이.',
            baseServings: 2, difficulty: 'easy', cookTime: 20, variantGroupId: null, variantLabel: null,
            ingredients: [
                { id: 'd04', role: 'core', qty: 300, unit: 'g' },
                { id: 'c02', role: 'core', qty: 2, unit: 'tbsp' },
                { id: 'c04', role: 'core', qty: 1, unit: 'tbsp' },
                { id: 'd05', role: 'optional', qty: 100, unit: 'g' },
                { id: 'a07', role: 'optional', qty: 2, unit: 'whole' },
                { id: 'b02', role: 'garnish', qty: 1, unit: 'whole' },
            ],
            steps: [
                '떡을 물에 불려주세요.',
                '냄비에 물 300ml, 고추장 2큰술, 고춧가루 1큰술, 설탕 1큰술을 넣고 끓여주세요.',
                '양념이 끓으면 떡과 어묵을 넣어주세요.',
                '떡이 말랑해지면 삶은 계란을 넣고 대파를 올려 마무리합니다.',
            ],
        },
        {
            id: 'r07', title: '계란볶음밥', description: '간단하고 빠른 계란볶음밥. 남은 밥 활용 최고!',
            baseServings: 1, difficulty: 'easy', cookTime: 10, variantGroupId: null, variantLabel: null,
            ingredients: [
                { id: 'd01', role: 'core', qty: 1, unit: 'cup' },
                { id: 'a07', role: 'core', qty: 2, unit: 'whole' },
                { id: 'b02', role: 'core', qty: 0.5, unit: 'whole' },
                { id: 'c01', role: 'optional', qty: 1, unit: 'tbsp' },
                { id: 'c05', role: 'optional', qty: 0.5, unit: 'tbsp' },
                { id: 'b01', role: 'optional', qty: 0.25, unit: 'whole' },
            ],
            steps: [
                '팬에 식용유를 두르고 계란을 스크램블 해주세요.',
                '밥을 넣고 센 불에서 볶아주세요.',
                '간장과 참기름으로 간을 맞춰주세요.',
                '대파를 넣어 마무리합니다.',
            ],
        },
        {
            id: 'r08', title: '콩나물국', description: '시원하고 깔끔한 콩나물국. 해장에도 좋아요.',
            baseServings: 2, difficulty: 'easy', cookTime: 15, variantGroupId: null, variantLabel: null,
            ingredients: [
                { id: 'b08', role: 'core', qty: 200, unit: 'g' },
                { id: 'b02', role: 'core', qty: 1, unit: 'whole' },
                { id: 'b03', role: 'core', qty: 3, unit: 'clove' },
                { id: 'c08', role: 'optional', qty: 0.5, unit: 'tsp' },
                { id: 'c04', role: 'optional', qty: 0.5, unit: 'tsp' },
            ],
            steps: [
                '냄비에 물 500ml를 넣고 끓여주세요.',
                '물이 끓으면 콩나물을 넣고 뚜껑을 덮어 7분 끓여주세요.',
                '다진 마늘과 소금으로 간을 맞춰주세요.',
                '대파를 넣어 마무리합니다.',
            ],
        },
        {
            id: 'r09', title: '참치김치볶음밥', description: '참치캔과 김치로 만드는 감칠맛 폭발 볶음밥.',
            baseServings: 1, difficulty: 'easy', cookTime: 15, variantGroupId: null, variantLabel: null,
            ingredients: [
                { id: 'a10', role: 'core', qty: 1, unit: 'can' },
                { id: 'd03', role: 'core', qty: 0.5, unit: 'cup' },
                { id: 'd01', role: 'core', qty: 1, unit: 'cup' },
                { id: 'c05', role: 'optional', qty: 1, unit: 'tbsp' },
                { id: 'a07', role: 'optional', qty: 1, unit: 'whole' },
                { id: 'd07', role: 'garnish', qty: 1, unit: 'sheet' },
            ],
            steps: [
                '김치를 잘게 썰어주세요.',
                '팬에 김치를 볶다가 참치를 넣어 함께 볶아주세요.',
                '밥을 넣고 센 불에서 빠르게 볶아주세요.',
                '참기름을 두르고, 김 가루를 올려 마무리합니다.',
            ],
        },
        {
            id: 'r10', title: '시금치나물', description: '고소한 참기름 향의 시금치나물 반찬.',
            baseServings: 2, difficulty: 'easy', cookTime: 10, variantGroupId: null, variantLabel: null,
            ingredients: [
                { id: 'b09', role: 'core', qty: 200, unit: 'g' },
                { id: 'c05', role: 'core', qty: 1, unit: 'tbsp' },
                { id: 'c01', role: 'core', qty: 1, unit: 'tbsp' },
                { id: 'b03', role: 'optional', qty: 1, unit: 'clove' },
                { id: 'c08', role: 'optional', qty: 0.25, unit: 'tsp' },
                { id: 'd08', role: 'garnish', qty: 1, unit: 'tsp' },
            ],
            steps: [
                '시금치를 깨끗이 씻어 끓는 물에 30초 데쳐주세요.',
                '찬물에 헹궈 물기를 꽉 짜주세요.',
                '간장, 참기름, 다진 마늘, 소금을 넣고 조물조물 무쳐주세요.',
                '깨를 뿌려 마무리합니다.',
            ],
        },
    ];

    // ─── Category labels (Korean) ─────────────────────────────
    const categoryLabels = {
        protein: '단백질',
        seafood: '해산물',
        vegetable: '채소',
        sauce: '양념',
        grain: '곡류',
        staple: '기본 재료',
        dairy: '유제품',
        fruit: '과일',
        other: '기타',
    };

    const unitLabels = {
        whole: '개', g: 'g', ml: 'ml', cup: '컵', tbsp: '큰술',
        tsp: '작은술', can: '캔', sheet: '장', clove: '쪽',
    };

    // ─── Public API ───────────────────────────────────────────

    function getIngredients() { return ingredients; }
    function getRecipes() { return recipes; }
    function getIngredientById(id) { return ingredients.find(i => i.id === id); }
    function getRecipeById(id) { return recipes.find(r => r.id === id); }

    function searchIngredients(query) {
        if (!query || query.length === 0) return [];
        const q = query.toLowerCase().trim();
        const matches = [];
        const seen = new Set();
        // Exact/prefix match on aliases first
        for (const a of aliases) {
            if (a.alias.startsWith(q) && !seen.has(a.ingredientId)) {
                seen.add(a.ingredientId);
                const ing = getIngredientById(a.ingredientId);
                if (ing) matches.push({ ...ing, matchType: 'prefix', matchedAlias: a.alias });
            }
        }
        // Then partial/contains match
        for (const a of aliases) {
            if (a.alias.includes(q) && !seen.has(a.ingredientId)) {
                seen.add(a.ingredientId);
                const ing = getIngredientById(a.ingredientId);
                if (ing) matches.push({ ...ing, matchType: 'contains', matchedAlias: a.alias });
            }
        }
        // Then try ingredient name directly
        for (const ing of ingredients) {
            if (ing.name.includes(q) && !seen.has(ing.id)) {
                seen.add(ing.id);
                matches.push({ ...ing, matchType: 'name' });
            }
        }

        // Finally, typo-tolerance fallback for near-miss short queries
        // (kept intentionally light to preserve deterministic behavior)
        if (matches.length < 10 && q.length >= 2) {
            const scored = [];
            for (const a of aliases) {
                if (seen.has(a.ingredientId)) continue;
                const alias = a.alias.toLowerCase();
                const distance = levenshteinDistance(alias, q);
                const threshold = q.length <= 3 ? 1 : 2;
                if (distance <= threshold) {
                    const ing = getIngredientById(a.ingredientId);
                    if (ing) {
                        scored.push({
                            ingredient: ing,
                            alias: a.alias,
                            distance,
                        });
                    }
                }
            }

            scored.sort((a, b) => a.distance - b.distance);
            for (const candidate of scored) {
                if (seen.has(candidate.ingredient.id)) continue;
                seen.add(candidate.ingredient.id);
                matches.push({
                    ...candidate.ingredient,
                    matchType: 'fuzzy',
                    matchedAlias: candidate.alias,
                });
                if (matches.length >= 10) break;
            }
        }

        return matches.slice(0, 10);
    }

    function levenshteinDistance(a, b) {
        if (a === b) return 0;
        if (!a.length) return b.length;
        if (!b.length) return a.length;

        const rows = a.length + 1;
        const cols = b.length + 1;
        const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));

        for (let i = 0; i < rows; i++) dp[i][0] = i;
        for (let j = 0; j < cols; j++) dp[0][j] = j;

        for (let i = 1; i < rows; i++) {
            for (let j = 1; j < cols; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + cost
                );
            }
        }

        return dp[a.length][b.length];
    }

    function getIngredientsByCategory() {
        const grouped = {};
        for (const ing of ingredients) {
            const cat = ing.category;
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(ing);
        }
        return grouped;
    }

    function getCategoryLabel(cat) { return categoryLabels[cat] || cat; }
    function getUnitLabel(unit) { return unitLabels[unit] || unit; }

    /**
     * Quantity-aware matching engine.
     * @param {Array} pantryItems - [{ingredientId, quantity, unit}]
     * @param {number} desiredServings - user's desired servings
     * @returns {Array} matched recipes with confidence and explanation
     */
    function matchRecipes(pantryItems, desiredServings = 2) {
        const pantryMap = {};
        for (const item of pantryItems) {
            pantryMap[item.ingredientId] = { qty: item.quantity, unit: item.unit };
        }
        const pantryIds = new Set(Object.keys(pantryMap));
        const results = [];

        for (const recipe of recipes) {
            const coreIngredients = recipe.ingredients.filter(i => i.role === 'core');
            const optionalIngredients = recipe.ingredients.filter(i => i.role === 'optional');

            // Step 1: Binary match – does user HAVE the ingredient?
            const coreMatched = [];
            const coreMissing = [];
            for (const ci of coreIngredients) {
                if (pantryIds.has(ci.id)) {
                    coreMatched.push(ci);
                } else {
                    coreMissing.push(ci);
                }
            }

            // Skip recipes with too many missing core ingredients
            if (coreMissing.length > 1) continue;
            const coreMatchRatio = coreMatched.length / coreIngredients.length;
            if (coreMatchRatio < 0.75) continue;

            // Step 2: Quantity sufficiency check
            const scale = desiredServings / recipe.baseServings;
            const insufficientCoreIngredients = [];
            let maxFeasibleServings = desiredServings;

            for (const ci of coreMatched) {
                const userHas = pantryMap[ci.id];
                if (!userHas || ci.qty === null || ci.qty === undefined) continue;

                const needed = ci.qty * scale;

                // If staple, assume we have enough (Y/N logic)
                const ingInfo = getIngredientById(ci.id);
                if (ingInfo && ingInfo.isStaple) continue;

                if (userHas.qty < needed) {
                    // Calculate max feasible servings for this ingredient
                    const feasible = Math.floor((userHas.qty / ci.qty) * recipe.baseServings);
                    maxFeasibleServings = Math.min(maxFeasibleServings, feasible);
                    insufficientCoreIngredients.push({
                        ingredient: getIngredientById(ci.id),
                        needed: needed,
                        userHas: userHas.qty,
                        unit: ci.unit,
                    });
                }
            }

            // If insufficient at desired servings BUT feasible at lower servings
            const canMakeAtDesired = insufficientCoreIngredients.length === 0;
            const canMakeAtReduced = maxFeasibleServings >= 1;

            if (!canMakeAtDesired && !canMakeAtReduced) continue;

            // Step 3: Scoring
            let score = 100 * coreMatchRatio;
            const optionalMatched = optionalIngredients.filter(oi => pantryIds.has(oi.id));
            score += Math.min(optionalMatched.length * 3, 10);
            if (coreMissing.length > 0) score -= 15 * coreMissing.length;

            // Step 4: Confidence labeling
            let confidence;
            if (coreMissing.length === 0 && coreMatchRatio >= 0.75 && canMakeAtDesired) {
                confidence = 'high';
            } else if (coreMissing.length <= 1 && (canMakeAtDesired || canMakeAtReduced)) {
                confidence = 'medium';
            } else {
                confidence = 'low';
            }

            // Step 5: Build explanation
            results.push({
                recipe,
                score,
                confidence,
                coreMatched: coreMatched.length,
                coreTotal: coreIngredients.length,
                coreMissing: coreMissing.map(m => getIngredientById(m.id)),
                optionalMatched: optionalMatched.length,
                optionalTotal: optionalIngredients.length,
                canMakeAtDesired,
                suggestedServings: canMakeAtDesired ? desiredServings : maxFeasibleServings,
                insufficientIngredients: insufficientCoreIngredients,
                variants: recipe.variantGroupId
                    ? recipes.filter(r => r.variantGroupId === recipe.variantGroupId && r.id !== recipe.id)
                    : [],
            });
        }

        // Sort by score descending
        results.sort((a, b) => b.score - a.score);
        return results;
    }

    return {
        getIngredients,
        getRecipes,
        getIngredientById,
        getRecipeById,
        searchIngredients,
        getIngredientsByCategory,
        getCategoryLabel,
        getUnitLabel,
        matchRecipes,
    };
})();
