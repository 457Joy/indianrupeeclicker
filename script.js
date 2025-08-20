let rupees = 0;
let rupeesPerClick = 1;
let dailyBonusStreak = 0;
let lastClaimedDate = null;
let prestigePoints = 0;
let prestigeMultiplier = 1;
let activePowerUps = [];
let activeEvents = [];
let hiredFigures = [];
let stocksUpdateCount = 0;
let currentAccount = "Guest";
let currentRegion = "north";
let rupeeHistory = [];
let uiState = {};
let rupeesChart = null;

const regions = {
    north: {
        name: "North India",
        buildings: {
            teaStall: { name: "Tea Stall", level: 0, baseCost: 10, rps: 1, rpc: 0, icon: "☕" },
            spiceFarm: { name: "Spice Farm", level: 0, baseCost: 300, rps: 5, rpc: 1, icon: "🌶️" },
            textileFactory: { name: "Textile Factory", level: 0, baseCost: 10000, rps: 20, rpc: 5, icon: "👕" }
        }
    },
    south: {
        name: "South India",
        buildings: {
            itHub: { name: "IT Hub", level: 0, baseCost: 50000, rps: 50, rpc: 10, icon: "💻" },
            templeComplex: { name: "Temple Complex", level: 0, baseCost: 25000, rps: 30, rpc: 5, icon: "🛕" }
        }
    },
    east: {
        name: "East India",
        buildings: {
            steelPlant: { name: "Steel Plant", level: 0, baseCost: 2e6, rps: 400, rpc: 50, icon: "🏭" },
            teaEstate: { name: "Tea Estate", level: 0, baseCost: 75000, rps: 100, rpc: 20, icon: "🍃" }
        }
    },
    west: {
        name: "West India",
        buildings: {
            bollywood: { name: "Bollywood Studio", level: 0, baseCost: 1e8, rps: 750, rpc: 200, icon: "🎬" },
            port: { name: "International Port", level: 0, baseCost: 500000, rps: 300, rpc: 100, icon: "⚓" }
        }
    },
    central: {
        name: "Central India",
        buildings: {
            coalMine: { name: "Coal Mine", level: 0, baseCost: 1e5, rps: 150, rpc: 30, icon: "⛏️" },
            solarFarm: { name: "Solar Farm", level: 0, baseCost: 3e5, rps: 200, rpc: 50, icon: "☀️" }
        }
    },
    northeast: {
        name: "Northeast",
        buildings: {
            teaResearch: { name: "Tea Research Center", level: 0, baseCost: 5e4, rps: 75, rpc: 15, icon: "🔬" },
            ecoTourism: { name: "Eco Tourism", level: 0, baseCost: 1e5, rps: 100, rpc: 25, icon: "🌿" }
        }
    }
};

const historicalFigures = [
    { name: "Ratan Tata", cost: 500000, effect: { factoryDiscount: 0.2 }, description: "Industrialist: Factories cost 20% less", icon: "👔" },
    { name: "APJ Abdul Kalam", cost: 1000000, effect: { techMultiplier: 1.5 }, description: "Missile Man: Tech buildings 50% stronger", icon: "🚀" },
    { name: "Gandhi", cost: 250000, effect: { peacefulMultiplier: 1.1 }, description: "Father of Nation: Peaceful income +10%", icon: "👴" },
    { name: "Indira Gandhi", cost: 750000, effect: { financialMultiplier: 1.25 }, description: "Iron Lady: Financial buildings 25% stronger", icon: "👩" }
];

const upgrades = {
    clickPower: { name: "Better Clicks", icon: "👆", description: "Improve your clicking power", baseCost: 100, level: 0, effect: { rpc: 5 }, affectedBy: ["Ratan Tata"] },
    autoClicker: { name: "Auto Clicker", icon: "🤖", description: "Automatically clicks for you", baseCost: 500, level: 0, effect: { rps: 1 }, affectedBy: ["APJ Abdul Kalam"] },
    bankInterest: { name: "Bank Interest", icon: "🏦", description: "Earn interest on your rupees", baseCost: 1000, level: 0, effect: { rps: 5 }, affectedBy: ["Indira Gandhi"] },
    spiceTrade: { name: "Spice Trade", icon: "🌶️", description: "Export spices for profit", baseCost: 2500, level: 0, effect: { rps: 10, rpc: 2 }, affectedBy: ["Gandhi"] }
};

const randomEvents = [
    { name: "Monsoon Season", effect: { teaMultiplier: 2, description: "All tea-related buildings produce double!", icon: "🌧️" }, duration: 30000 },
    { name: "Economic Boom", effect: { rpcMultiplier: 1.5, description: "All rupee clicks are 50% more effective!", icon: "📈" }, duration: 45000 },
    { name: "Diwali Sale", effect: { costReduction: 0.7, description: "All building costs reduced by 30%!", icon: "🎇" }, duration: 60000 }
];

const powerUps = [
    { id: 'ganesh', name: "Ganesh Idol", baseCost: 5000, duration: 30, effect: { clickMultiplier: 3 }, icon: "🐘" },
    { id: 'lakshmi', name: "Lakshmi's Lamp", baseCost: 10000, duration: 60, effect: { rpsMultiplier: 2 }, icon: "🪔" },
    { id: 'hanuman', name: "Hanuman's Strength", baseCost: 20000, duration: 45, effect: { clickPower: 50 }, icon: "🐒" }
];

let stocks = [
    { name: "Chai Corp", ticker: "CHAI", basePrice: 100, price: 100, owned: 0, history: [], color: '#4CAF50', volatility: 0.15, lastPrice: 100 },
    { name: "Tech Maha", ticker: "TECH", basePrice: 500, price: 500, owned: 0, history: [], color: '#2196F3', volatility: 0.20, lastPrice: 500 },
    { name: "Bollywood", ticker: "BOLLY", basePrice: 1000, price: 1000, owned: 0, history: [], color: '#E91E63', volatility: 0.25, lastPrice: 1000 },
    { name: "Spice Trade", ticker: "SPICE", basePrice: 750, price: 750, owned: 0, history: [], color: '#FF9800', volatility: 0.18, lastPrice: 750 },
    { name: "Infra Dev", ticker: "INFRA", basePrice: 1500, price: 1500, owned: 0, history: [], color: '#9C27B0', volatility: 0.16, lastPrice: 1500 }
];

function updateDisplay() {
    const newState = {
        'rupee-display': `₹ ${formatNumber(rupees)}`,
        'total-rps': formatNumber(calculateRPS()),
        'total-rpc': formatNumber(calculateRPC()),
        'prestige-points': prestigePoints,
        'daily-bonus-streak': `🔥 Streak: ${dailyBonusStreak} days`,
        'current-account': currentAccount,
        'portfolio-total': `₹${formatNumber(calculatePortfolioValue())}`,
        'portfolio-invested': `₹${formatNumber(calculateInvestedAmount())}`,
        'update-count': stocksUpdateCount,
        'persistent-rupee-amount': `₹ ${formatNumber(rupees)}`,
        'persistent-rps': `(${formatNumber(calculateRPS())}/sec)`
    };

    Object.entries(newState).forEach(([id, content]) => {
        if (uiState[id] !== content) {
            safeUpdateElement(id, content);
            uiState[id] = content;
        }
    });

    const profitElement = document.getElementById('portfolio-profit');
    if (profitElement) {
        const profit = calculatePortfolioValue() - calculateInvestedAmount();
        const profitText = `${profit >= 0 ? '+' : ''}₹${formatNumber(profit)}`;
        if (uiState['portfolio-profit'] !== profitText) {
            profitElement.textContent = profitText;
            profitElement.style.color = profit >= 0 ? '#4CAF50' : '#F44336';
            uiState['portfolio-profit'] = profitText;
        }
    }
}

function safeUpdateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
        return true;
    }
    console.warn(`Element with ID ${id} not found`);
    return false;
}

function formatNumber(num) {
    if (!isFinite(num)) return '0.00';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const pageElement = document.getElementById(`${pageId}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    document.querySelectorAll('.persistent-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    
    if (pageId !== 'home') {
        const activeBtn = document.querySelector(`.persistent-nav-btn[onclick="showPage('${pageId}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-selected', 'true');
        }
    }
    
    try {
        switch(pageId) {
            case 'development':
                updateMapVisuals();
                renderHistoricalFigures();
                showRegionDetails(currentRegion);
                break;
            case 'clicker':
                renderUpgrades();
                renderPowerUps();
                if (!rupeesChart) initializeRupeesChart();
                break;
            case 'stocks':
                renderStocks();
                break;
        }
    } catch (e) {
        console.error(`Error in showPage for ${pageId}:`, e);
    }
}

function clickRupee() {
    let clickValue = calculateRPC();
    rupees += clickValue;
    createRupeeFloat(clickValue);
    playSound('click-sound');
    updateDisplay();
}

function createRupeeFloat(amount) {
    const button = document.getElementById('click-button');
    if (!button) return;

    const float = document.createElement('div');
    float.className = 'rupee-float';
    float.textContent = `+₹${formatNumber(amount)}`;
    float.style.left = `${button.offsetLeft + Math.random() * button.offsetWidth}px`;
    float.style.top = `${button.offsetTop + button.offsetHeight / 2}px`;
    
    document.body.appendChild(float);
    setTimeout(() => float.remove(), 1000);
}

function calculateRPC() {
    let rpc = rupeesPerClick;
    
    Object.values(regions).forEach(region => {
        Object.values(region.buildings).forEach(building => {
            rpc += building.rpc * building.level * getBuildingMultiplier(building);
        });
    });

    Object.values(upgrades).forEach(upgrade => {
        if (upgrade.effect.rpc) {
            let multiplier = 1;
            if (upgrade.affectedBy.includes("Gandhi") && hiredFigures.includes("Gandhi")) multiplier *= 1.1;
            if (upgrade.affectedBy.includes("Indira Gandhi") && hiredFigures.includes("Indira Gandhi")) multiplier *= 1.25;
            rpc += upgrade.effect.rpc * upgrade.level * multiplier;
        }
    });

    activePowerUps.forEach(powerUp => {
        if (powerUp.effect.clickMultiplier) rpc *= powerUp.effect.clickMultiplier;
        if (powerUp.effect.clickPower) rpc += powerUp.effect.clickPower;
    });

    activeEvents.forEach(event => {
        if (event.effect.rpcMultiplier) rpc *= event.effect.rpcMultiplier;
    });

    return rpc * prestigeMultiplier;
}

function calculateRPS() {
    let rps = 0;
    
    Object.values(regions).forEach(region => {
        Object.values(region.buildings).forEach(building => {
            rps += building.rps * building.level * getBuildingMultiplier(building);
        });
    });

    Object.values(upgrades).forEach(upgrade => {
        if (upgrade.effect.rps) {
            let multiplier = 1;
            if (upgrade.affectedBy.includes("Gandhi") && hiredFigures.includes("Gandhi")) multiplier *= 1.1;
            if (upgrade.affectedBy.includes("Indira Gandhi") && hiredFigures.includes("Indira Gandhi")) multiplier *= 1.25;
            if (upgrade.affectedBy.includes("APJ Abdul Kalam") && hiredFigures.includes("APJ Abdul Kalam")) multiplier *= 1.5;
            rps += upgrade.effect.rps * upgrade.level * multiplier;
        }
    });

    activePowerUps.forEach(powerUp => {
        if (powerUp.effect.rpsMultiplier) rps *= powerUp.effect.rpsMultiplier;
    });

    return rps * prestigeMultiplier;
}

function prestige() {
    const prestigeCost = 1e9 * (prestigePoints + 1);
    if (rupees < prestigeCost) {
        showMessage(`You need ₹${formatNumber(prestigeCost)} to prestige!`);
        return;
    }

    rupees = 0;
    rupeesPerClick = 1;
    prestigePoints++;
    prestigeMultiplier = 1 + prestigePoints * 0.5;
    rupeeHistory = [];
    
    Object.values(regions).forEach(region => {
        Object.values(region.buildings).forEach(building => {
            building.level = 0;
        });
    });

    Object.values(upgrades).forEach(upgrade => {
        upgrade.level = 0;
    });

    activePowerUps = [];
    hiredFigures = [];
    stocks.forEach(stock => {
        stock.owned = 0;
        stock.price = stock.basePrice;
        stock.history = [];
    });

    const effect = document.getElementById('prestige-effect');
    if (effect) {
        effect.style.display = 'block';
        setTimeout(() => effect.style.display = 'none', 2000);
    }

    updateMapVisuals();
    showRegionDetails(currentRegion);
    renderUpgrades();
    renderPowerUps();
    renderStocks();
    renderHistoricalFigures();
    if (rupeesChart) updateRupeesChart();
    showMessage(`Prestiged! Multiplier: ${prestigeMultiplier.toFixed(1)}x`);
}

function updateMapVisuals() {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;

    Object.keys(regions).forEach(regionId => {
        const region = document.getElementById(regionId);
        if (region) {
            let totalLevel = Object.values(regions[regionId].buildings).reduce((sum, building) => sum + building.level, 0);
            region.style.opacity = totalLevel > 0 ? 1 : 0.5;
            region.style.backgroundColor = totalLevel > 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.1)';
        }
    });
}

function showRegionDetails(regionId) {
    currentRegion = regionId;
    const region = regions[regionId];
    const detailsContainer = document.getElementById('region-details');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `
        <h3>${region.name} <span class="region-level">Level: ${calculateRegionLevel(regionId)}</span></h3>
        <div class="buildings-grid" id="buildings-grid-${regionId}"></div>
    `;

    renderBuildings(regionId);
}

function calculateRegionLevel(regionId) {
    return Object.values(regions[regionId].buildings).reduce((sum, building) => sum + building.level, 0);
}

function renderBuildings(regionId) {
    const grid = document.getElementById(`buildings-grid-${regionId}`);
    if (!grid) return;

    grid.innerHTML = '';
    Object.entries(regions[regionId].buildings).forEach(([buildingId, building]) => {
        const cost = calculateBuildingCost(building);
        const affordable = rupees >= cost;
        grid.innerHTML += `
            <div class="building-card ${affordable ? 'affordable' : ''}" onclick="${affordable ? `upgradeBuilding('${regionId}', '${buildingId}')` : ''}">
                <div class="building-icon">${building.icon}</div>
                <div class="building-name">${building.name}</div>
                <div class="building-level">Level: ${building.level}</div>
                <div class="building-cost">Cost: ₹${formatNumber(cost)}</div>
                <div class="progress-container"><div class="progress-bar" style="width: ${Math.min((building.level / 10) * 100, 100)}%"></div></div>
            </div>
        `;
    });
}

function calculateBuildingCost(building) {
    let baseCost = building.baseCost;
    let multiplier = 1.15;
    if (hiredFigures.includes("Ratan Tata") && ["textileFactory", "itHub", "steelPlant", "bollywood"].includes(building.name.toLowerCase().replace(" ", ""))) {
        multiplier *= 0.8; // 20% discount
    }
    activeEvents.forEach(event => {
        if (event.effect.costReduction) multiplier *= event.effect.costReduction;
    });
    return Math.floor(baseCost * Math.pow(multiplier, building.level));
}

function upgradeBuilding(regionId, buildingId) {
    const building = regions[regionId].buildings[buildingId];
    const cost = calculateBuildingCost(building);
    if (rupees >= cost) {
        rupees -= cost;
        building.level++;
        updateDisplay();
        renderBuildings(regionId);
        playSound('upgrade-sound');
        const card = document.querySelector(`#buildings-grid-${regionId} .building-card[onclick="upgradeBuilding('${regionId}', '${buildingId}')"]`);
        if (card) card.classList.add('upgrading');
        setTimeout(() => card.classList.remove('upgrading'), 500);
    } else {
        showMessage(`Need ₹${formatNumber(cost)} to upgrade ${building.name}!`);
    }
}

function getBuildingMultiplier(building) {
    let multiplier = 1;
    if (hiredFigures.includes("APJ Abdul Kalam") && ["itHub"].includes(building.name.toLowerCase().replace(" ", ""))) multiplier *= 1.5;
    if (hiredFigures.includes("Indira Gandhi") && ["port"].includes(building.name.toLowerCase().replace(" ", ""))) multiplier *= 1.25;
    if (hiredFigures.includes("Gandhi") && ["templeComplex", "ecoTourism"].includes(building.name.toLowerCase().replace(" ", ""))) multiplier *= 1.1;
    activeEvents.forEach(event => {
        if (event.effect.teaMultiplier && ["teaStall", "teaEstate", "teaResearch"].includes(building.name.toLowerCase().replace(" ", ""))) multiplier *= event.effect.teaMultiplier;
    });
    return multiplier;
}

function renderHistoricalFigures() {
    const container = document.getElementById('historical-figures');
    if (!container) return;

    container.innerHTML = '';
    historicalFigures.forEach(figure => {
        const affordable = rupees >= figure.cost;
        container.innerHTML += `
            <div class="figure-card ${affordable ? 'affordable' : ''}" onclick="${affordable ? `hireFigure('${figure.name}')` : ''}">
                <div class="figure-icon">${figure.icon}</div>
                <div class="figure-name">${figure.name}</div>
                <div class="figure-cost">Cost: ₹${formatNumber(figure.cost)}</div>
                <div class="figure-desc">${figure.description}</div>
            </div>
        `;
    });
}

function hireFigure(figureName) {
    const figure = historicalFigures.find(f => f.name === figureName);
    if (rupees >= figure.cost && !hiredFigures.includes(figureName)) {
        rupees -= figure.cost;
        hiredFigures.push(figureName);
        updateDisplay();
        renderHistoricalFigures();
        showMessage(`Hired ${figureName}!`);
    } else if (hiredFigures.includes(figureName)) {
        showMessage(`${figureName} is already hired!`);
    } else {
        showMessage(`Need ₹${formatNumber(figure.cost)} to hire ${figureName}!`);
    }
}

function renderUpgrades() {
    const container = document.getElementById('upgrades-grid');
    if (!container) return;

    container.innerHTML = '';
    Object.entries(upgrades).forEach(([upgradeId, upgrade]) => {
        const cost = calculateUpgradeCost(upgrade);
        const affordable = rupees >= cost;
        container.innerHTML += `
            <div class="upgrade-card ${affordable ? 'affordable' : ''}" onclick="${affordable ? `upgradeItem('${upgradeId}')` : ''}">
                <div class="upgrade-icon">${upgrade.icon}</div>
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-level">Level: ${upgrade.level}</div>
                <div class="upgrade-cost">Cost: ₹${formatNumber(cost)}</div>
                <div class="upgrade-desc">${upgrade.description}</div>
            </div>
        `;
    });
}

function calculateUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
}

function upgradeItem(upgradeId) {
    const upgrade = upgrades[upgradeId];
    const cost = calculateUpgradeCost(upgrade);
    if (rupees >= cost) {
        rupees -= cost;
        upgrade.level++;
        updateDisplay();
        renderUpgrades();
        playSound('upgrade-sound');
    } else {
        showMessage(`Need ₹${formatNumber(cost)} to upgrade ${upgrade.name}!`);
    }
}

function renderPowerUps() {
    const container = document.getElementById('powerups-grid');
    if (!container) return;

    container.innerHTML = '';
    powerUps.forEach(powerUp => {
        const affordable = rupees >= powerUp.baseCost && !activePowerUps.some(p => p.id === powerUp.id);
        container.innerHTML += `
            <div class="powerup-card ${affordable ? 'affordable' : ''}" onclick="${affordable ? `activatePowerUp('${powerUp.id}')` : ''}">
                <div class="powerup-icon">${powerUp.icon}</div>
                <div class="powerup-name">${powerUp.name}</div>
                <div class="powerup-cost">Cost: ₹${formatNumber(powerUp.baseCost)}</div>
                <div class="powerup-desc">Duration: ${powerUp.duration}s</div>
            </div>
        `;
    });

    const activeEffects = document.getElementById('active-effects');
    if (activeEffects) {
        activeEffects.innerHTML = activePowerUps.map(p => `${p.name} (${p.remaining}s)`).join(', ') || 'None';
    }
}

function activatePowerUp(powerUpId) {
    const powerUp = powerUps.find(p => p.id === powerUpId);
    if (rupees >= powerUp.baseCost) {
        rupees -= powerUp.baseCost;
        const activePowerUp = { ...powerUp, remaining: powerUp.duration, startTime: Date.now() };
        activePowerUps.push(activePowerUp);
        updateDisplay();
        renderPowerUps();
        showMessage(`Activated ${powerUp.name}!`);
    } else {
        showMessage(`Need ₹${formatNumber(powerUp.baseCost)} to activate ${powerUp.name}!`);
    }
}

function updatePowerUps() {
    const now = Date.now();
    activePowerUps = activePowerUps.filter(powerUp => {
        powerUp.remaining = Math.max(0, powerUp.duration - Math.floor((now - powerUp.startTime) / 1000));
        return powerUp.remaining > 0;
    });
    renderPowerUps();
}

function renderStocks() {
    const container = document.getElementById('stocks-grid');
    if (!container) return;

    container.innerHTML = '';
    stocks.forEach((stock, index) => {
        const canBuy = rupees >= stock.price;
        const canSell = stock.owned > 0;
        container.innerHTML += `
            <div class="stock-card">
                <div class="stock-name">${stock.name} (${stock.ticker})</div>
                <div class="stock-price">₹${formatNumber(stock.price)}</div>
                <div class="stock-owned">Owned: ${stock.owned}</div>
                <div class="stock-buttons">
                    <button class="buy-btn ${canBuy ? '' : 'disabled'}" onclick="${canBuy ? `buyStock(${index})` : ''}">Buy</button>
                    <button class="sell-btn ${canSell ? '' : 'disabled'}" onclick="${canSell ? `sellStock(${index})` : ''}">Sell</button>
                </div>
            </div>
        `;
    });

    updateStockDisplay();
}

function updateStocks() {
    stocks.forEach(stock => {
        const change = (Math.random() - 0.5) * stock.volatility;
        stock.price = Math.max(10, stock.price * (1 + change)); // Minimum price to avoid 0
        stock.history.push(stock.price);
        if (stock.history.length > 20) stock.history.shift();
    });
    stocksUpdateCount++;
    updateStockDisplay();
    renderStocks();
}

function buyStock(index) {
    const stock = stocks[index];
    if (rupees >= stock.price) {
        rupees -= stock.price;
        stock.owned++;
        updateDisplay();
        renderStocks();
        playSound('buy-sound');
    } else {
        showMessage(`Need ₹${formatNumber(stock.price)} to buy ${stock.name}!`);
    }
}

function sellStock(index) {
    const stock = stocks[index];
    if (stock.owned > 0) {
        rupees += stock.price;
        stock.owned--;
        updateDisplay();
        renderStocks();
        playSound('sell-sound');
    }
}

function calculatePortfolioValue() {
    return stocks.reduce((total, stock) => total + stock.price * stock.owned, 0);
}

function calculateInvestedAmount() {
    return stocks.reduce((total, stock) => total + stock.lastPrice * stock.owned, 0);
}

function updateStockDisplay() {
    const updateCount = document.getElementById('update-count');
    if (updateCount) {
        const now = new Date();
        updateCount.textContent = `Updates: ${stocksUpdateCount} | Last Updated: ${now.toLocaleTimeString()}`;
    }
}

function initializeRupeesChart() {
    const ctx = document.getElementById('rupees-progress-chart').getContext('2d');
    rupeesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: rupeeHistory.map((_, i) => i),
            datasets: [{
                label: 'Rupees',
                data: rupeeHistory,
                borderColor: '#4CAF50',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function updateRupeeHistory() {
    rupeeHistory.push(rupees);
    if (rupeeHistory.length > 20) rupeeHistory.shift();
    if (rupeesChart) {
        rupeesChart.data.labels = rupeeHistory.map((_, i) => i);
        rupeesChart.data.datasets[0].data = rupeeHistory;
        rupeesChart.update();
    }
}

function updateRupeesChart() {
    if (rupeesChart) {
        updateRupeeHistory();
        rupeesChart.update();
    }
}

// Backendless Initialization
function initBackendless() {
    Backendless.initApp('https://api.backendless.com', '44235209-F78F-4736-9290-6D4B051A1BCC'); // Replace with your actual APP_ID and JS_API_KEY
}

// Modified saveGame to use Backendless
function saveGame() {
    if (currentAccount === "Guest") {
        // Fallback to localStorage for Guest
        const allSaves = JSON.parse(localStorage.getItem('rupeeClickerSaves')) || {};
        allSaves[currentAccount] = getSaveData();
        localStorage.setItem('rupeeClickerSaves', JSON.stringify(allSaves));
        showMessage(`Game saved locally for ${currentAccount}!`);
        return;
    }

    const saveData = getSaveData();
    const whereClause = `accountName = '${currentAccount}'`;
    const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);

    Backendless.Data.of("GameSaves").find(queryBuilder)
        .then(function(results) {
            const dataToSave = {
                accountName: currentAccount,
                saveData: JSON.stringify(saveData)
            };

            if (results.length > 0) {
                // Update existing record
                dataToSave.objectId = results[0].objectId;
            }

            Backendless.Data.of("GameSaves").save(dataToSave)
                .then(function() {
                    showMessage(`Game saved to cloud for ${currentAccount}!`);
                })
                .catch(function(error) {
                    console.error('Error saving to Backendless:', error);
                    showMessage("Failed to save to cloud! Using local save.");
                    // Fallback to local
                    const allSaves = JSON.parse(localStorage.getItem('rupeeClickerSaves')) || {};
                    allSaves[currentAccount] = saveData;
                    localStorage.setItem('rupeeClickerSaves', JSON.stringify(allSaves));
                });
        })
        .catch(function(error) {
            console.error('Error checking existing save:', error);
            showMessage("Failed to save! Check connection.");
        });
}

function getSaveData() {
    return {
        rupees, 
        rupeesPerClick, 
        dailyBonusStreak, 
        lastClaimedDate, 
        prestigePoints, 
        prestigeMultiplier, 
        activePowerUps, 
        activeEvents, 
        hiredFigures, 
        stocksUpdateCount, 
        currentRegion,
        regions, 
        upgrades, 
        stocks, 
        rupeeHistory, 
        timestamp: Date.now()
    };
}

// Modified loadGame to use Backendless
function loadGame(accountName = currentAccount) {
    if (accountName === "Guest") {
        // Fallback to localStorage for Guest
        const allSaves = JSON.parse(localStorage.getItem('rupeeClickerSaves')) || {};
        const saveData = allSaves[accountName];
        if (!saveData) {
            showMessage(`No saved data for ${accountName}`);
            return;
        }
        applySaveData(saveData);
        return;
    }

    const whereClause = `accountName = '${accountName}'`;
    const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);

    Backendless.Data.of("GameSaves").find(queryBuilder)
        .then(function(results) {
            if (results.length === 0) {
                showMessage(`No saved data for ${accountName}`);
                return;
            }
            const saveData = JSON.parse(results[0].saveData);
            applySaveData(saveData);
            currentAccount = accountName;
            document.getElementById('account-name').value = accountName;
            updateDisplay();
            showMessage(`Loaded ${accountName}'s game from cloud!`);
        })
        .catch(function(error) {
            console.error('Error loading from Backendless:', error);
            showMessage("Failed to load from cloud! Trying local.");
            // Fallback to local
            const allSaves = JSON.parse(localStorage.getItem('rupeeClickerSaves')) || {};
            const saveData = allSaves[accountName];
            if (saveData) {
                applySaveData(saveData);
            } else {
                showMessage(`No local data for ${accountName}`);
            }
        });
}

function applySaveData(saveData) {
    resetGameState();
    if (typeof saveData.rupees === 'number') rupees = saveData.rupees;
    if (typeof saveData.rupeesPerClick === 'number') rupeesPerClick = saveData.rupeesPerClick;
    if (typeof saveData.dailyBonusStreak === 'number') dailyBonusStreak = saveData.dailyBonusStreak;
    if (saveData.lastClaimedDate) lastClaimedDate = saveData.lastClaimedDate;
    if (typeof saveData.prestigePoints === 'number') prestigePoints = saveData.prestigePoints;
    if (typeof saveData.prestigeMultiplier === 'number') prestigeMultiplier = saveData.prestigeMultiplier;
    if (Array.isArray(saveData.activePowerUps)) activePowerUps = saveData.activePowerUps;
    if (Array.isArray(saveData.activeEvents)) activeEvents = saveData.activeEvents;
    if (Array.isArray(saveData.hiredFigures)) hiredFigures = saveData.hiredFigures;
    if (typeof saveData.stocksUpdateCount === 'number') stocksUpdateCount = saveData.stocksUpdateCount;
    if (typeof saveData.currentRegion === 'string') currentRegion = saveData.currentRegion;
    if (Array.isArray(saveData.rupeeHistory)) rupeeHistory = saveData.rupeeHistory;

    if (saveData.regions && typeof saveData.regions === 'object') {
        Object.keys(regions).forEach(regionId => {
            if (saveData.regions[regionId]?.buildings) {
                Object.keys(regions[regionId].buildings).forEach(buildingId => {
                    if (saveData.regions[regionId].buildings[buildingId]?.level) {
                        regions[regionId].buildings[buildingId].level = saveData.regions[regionId].buildings[buildingId].level;
                    }
                });
            }
        });
    }

    if (saveData.upgrades && typeof saveData.upgrades === 'object') {
        Object.keys(upgrades).forEach(upgradeId => {
            if (saveData.upgrades[upgradeId]?.level) {
                upgrades[upgradeId].level = saveData.upgrades[upgradeId].level;
            }
        });
    }

    if (Array.isArray(saveData.stocks)) {
        saveData.stocks.forEach((savedStock, index) => {
            if (stocks[index] && typeof savedStock === 'object') {
                stocks[index].price = savedStock.price || stocks[index].price;
                stocks[index].owned = savedStock.owned || stocks[index].owned;
                stocks[index].history = Array.isArray(savedStock.history) ? savedStock.history : stocks[index].history;
                stocks[index].lastPrice = savedStock.lastPrice || stocks[index].lastPrice;
            }
        });
    }

    updateAllDisplays();
}

// Modified deleteAccount to use Backendless
function deleteAccount() {
    if (!currentAccount || currentAccount === "Guest") {
        showMessage("Cannot delete Guest account");
        return;
    }
    
    if (!confirm(`Delete account "${currentAccount}" and all its data?`)) {
        return;
    }

    const whereClause = `accountName = '${currentAccount}'`;
    const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);

    Backendless.Data.of("GameSaves").find(queryBuilder)
        .then(function(results) {
            if (results.length > 0) {
                Backendless.Data.of("GameSaves").remove(results[0])
                    .then(function() {
                        // Also remove local if exists
                        const allSaves = JSON.parse(localStorage.getItem('rupeeClickerSaves')) || {};
                        delete allSaves[currentAccount];
                        localStorage.setItem('rupeeClickerSaves', JSON.stringify(allSaves));
                        
                        currentAccount = "Guest";
                        document.getElementById('account-name').value = "";
                        resetGameState();
                        updateAllDisplays();
                        updateAccountList();
                        showMessage(`Deleted account ${currentAccount} from cloud`);
                    })
                    .catch(function(error) {
                        console.error('Error deleting from Backendless:', error);
                        showMessage("Failed to delete from cloud!");
                    });
            } else {
                showMessage(`No cloud data for ${currentAccount}`);
            }
        })
        .catch(function(error) {
            console.error('Error finding account to delete:', error);
            showMessage("Failed to delete! Check connection.");
        });
}

function resetGameState() {
    rupees = 0;
    rupeesPerClick = 1;
    dailyBonusStreak = 0;
    lastClaimedDate = null;
    prestigePoints = 0;
    prestigeMultiplier = 1;
    activePowerUps = [];
    activeEvents = [];
    hiredFigures = [];
    stocksUpdateCount = 0;
    currentRegion = "north";
    rupeeHistory = [];
    
    Object.values(regions).forEach(region => {
        Object.values(region.buildings).forEach(building => {
            building.level = 0;
        });
    });
    
    Object.values(upgrades).forEach(upgrade => {
        upgrade.level = 0;
    });
    
    stocks.forEach(stock => {
        stock.price = stock.basePrice;
        stock.owned = 0;
        stock.history = [stock.basePrice];
    });
}

function updateAllDisplays() {
    updateDisplay();
    updateMapVisuals();
    showRegionDetails(currentRegion);
    renderUpgrades();
    renderPowerUps();
    renderStocks();
    renderHistoricalFigures();
    if (!rupeesChart) initializeRupeesChart();
    updateRupeesChart();
}

function updateAccountList() {
    const select = document.getElementById('account-select');
    if (!select) return;
    
    const allSaves = JSON.parse(localStorage.getItem('rupeeClickerSaves')) || {};
    select.innerHTML = '<option value="">Select Account</option>';
    
    Object.keys(allSaves).forEach(account => {
        const option = document.createElement('option');
        option.value = account;
        option.textContent = account;
        select.appendChild(option);
    });
    
    // Select current account if it exists
    if (allSaves[currentAccount]) {
        select.value = currentAccount;
    }
}

function showMessage(text) {
    const message = document.getElementById('message');
    if (!message) return;
    
    message.textContent = text;
    message.style.display = 'block';
    message.classList.remove('exit');
    
    setTimeout(() => {
        message.classList.add('exit');
        setTimeout(() => message.style.display = 'none', 300);
    }, 3000);
}

function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.warn(`Audio play failed: ${e}`));
    }
}

function setupEventListeners() {
    try {
        const clickButton = document.getElementById('click-button');
        if (clickButton) clickButton.addEventListener('click', clickRupee);
        
        const prestigeButton = document.getElementById('prestige-button');
        if (prestigeButton) prestigeButton.addEventListener('click', prestige);
        
        const luckyDrawButton = document.getElementById('lucky-draw-button');
        if (luckyDrawButton) luckyDrawButton.addEventListener('click', playLuckyDraw);
        
        const gambleButton = document.getElementById('gamble-button');
        if (gambleButton) gambleButton.addEventListener('click', playGamble);
        
        const dailyBonusButton = document.getElementById('daily-bonus-button');
        if (dailyBonusButton) dailyBonusButton.addEventListener('click', claimDailyBonus);
        
        const howToPlayBtn = document.getElementById('how-to-play-btn');
        const popup = document.getElementById('how-to-play-popup');
        const closePopup = document.querySelector('.close-popup');
        if (howToPlayBtn && popup && closePopup) {
            howToPlayBtn.addEventListener('click', () => popup.classList.add('active'));
            closePopup.addEventListener('click', () => popup.classList.remove('active'));
        }
        
        const tabButtons = document.querySelectorAll('.tab-buttons button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
                
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                const tabContent = document.getElementById(button.dataset.tab);
                if (tabContent) tabContent.classList.add('active');
            });
        });
        
        const regionTabs = document.querySelectorAll('.region-tab');
        regionTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                if (tab.dataset.region) showRegionDetails(tab.dataset.region);
            });
        });
        
        const regionsElements = document.querySelectorAll('.region');
        regionsElements.forEach(region => {
            region.addEventListener('click', () => {
                if (region.dataset.region) showRegionDetails(region.dataset.region);
            });
        });
        
        const accountNameInput = document.getElementById('account-name');
        if (accountNameInput) {
            accountNameInput.addEventListener('change', () => {
                const newName = accountNameInput.value.trim();
                if (!newName) {
                    currentAccount = "Guest";
                } else {
                    currentAccount = newName;
                }
                updateDisplay();
            });
        }
        
        const accountSelect = document.getElementById('account-select');
        if (accountSelect) {
            accountSelect.addEventListener('change', function() {
                if (this.value) {
                    currentAccount = this.value;
                    document.getElementById('account-name').value = this.value;
                    loadGame(this.value);
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const popup = document.getElementById('how-to-play-popup');
                if (popup?.classList.contains('active')) popup.classList.remove('active');
            }
            if (e.key === 'Enter' && document.activeElement.classList.contains('persistent-nav-btn')) {
                document.activeElement.click();
            }
        });

        document.querySelectorAll('.persistent-nav-btn').forEach(btn => btn.setAttribute('tabindex', '0'));
    } catch (e) {
        console.error('Error setting up event listeners:', e);
    }
}

// Game loops
const gameLoop = setInterval(() => {
    try {
        rupees += calculateRPS();
        updateRupeeHistory();
        updateDisplay();
    } catch (e) {
        console.error('Error in game loop:', e);
    }
}, 1000);

const eventLoop = setInterval(() => {
    try {
        triggerRandomEvent();
    } catch (e) {
        console.error('Error in event loop:', e);
    }
}, 60000);

const stockLoop = setInterval(() => {
    try {
        updateStocks();
    } catch (e) {
        console.error('Error in stock loop:', e);
    }
}, 60000);

const powerUpLoop = setInterval(() => {
    try {
        updatePowerUps();
    } catch (e) {
        console.error('Error in power-up loop:', e);
    }
}, 1000);

const autosaveInterval = setInterval(() => {
    try {
        saveGame();
    } catch (e) {
        console.error('Error in autosave:', e);
    }
}, 30000);

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    try {
        initBackendless(); // Initialize Backendless here
        setupEventListeners();
        showPage('home');
        updateAccountList();
        updateAllDisplays();
    } catch (e) {
        console.error('Error initializing game:', e);
    }
});

// Mini-game functions (assuming they exist in your original code)
function playLuckyDraw() {
    if (rupees < 50) {
        showMessage("Need ₹50 to play Lucky Draw!");
        return;
    }
    rupees -= 50;
    const reward = Math.floor(Math.random() * 200);
    rupees += reward;
    updateDisplay();
    showMessage(`Lucky Draw! Won ₹${formatNumber(reward)}!`);
    playSound('luck-sound');
}

function playGamble() {
    if (rupees < 100) {
        showMessage("Need ₹100 to gamble!");
        return;
    }
    rupees -= 100;
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    if (dice1 === 6 && dice2 === 6) {
        const reward = 1000;
        rupees += reward;
        showMessage(`Double Sixes! Won ₹${formatNumber(reward)}!`);
    } else {
        showMessage(`Rolled ${dice1} and ${dice2}. Better luck next time!`);
    }
    updateDisplay();
    playSound('dice-sound');
}

function claimDailyBonus() {
    const now = new Date();
    if (lastClaimedDate && now.toDateString() === new Date(lastClaimedDate).toDateString()) {
        showMessage("You've already claimed today's bonus!");
        return;
    }
    const bonus = 100 * (dailyBonusStreak + 1);
    rupees += bonus;
    dailyBonusStreak++;
    lastClaimedDate = now;
    updateDisplay();
    showMessage(`Claimed daily bonus! +₹${formatNumber(bonus)} (Streak: ${dailyBonusStreak})`);
    playSound('bonus-sound');
}

function triggerRandomEvent() {
    if (Math.random() < 0.3 && activeEvents.length === 0) {
        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        activeEvents.push({ ...event, remaining: Math.floor(event.duration / 1000), startTime: Date.now() });
        showEventNotification(event);
        updateDisplay();
    }
}

function showEventNotification(event) {
    const notification = document.createElement('div');
    notification.className = 'event-notification';
    notification.innerHTML = `
        <div class="event-icon">${event.icon}</div>
        <div class="event-content">
            <h4>${event.name}</h4>
            <p>${event.effect.description}</p>
        </div>
        <div class="event-timer" style="animation-duration: ${event.duration}ms"></div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, event.duration);
    activeEvents.forEach(e => e.remaining = Math.floor((event.duration - (Date.now() - e.startTime)) / 1000));
}