// Constants and utility functions
const DECIMAL_PLACES = 2;

const formatNumber = (num) => parseFloat(num.toFixed(DECIMAL_PLACES));

const calculateStandard = (backStake, backOdds, layOdds, commission) => {
  // Step 1: Calculate Lay Stake
  const layStake = formatNumber((backStake * backOdds) / layOdds);

  // Step 2: Calculate Liability
  const liability = formatNumber(layStake * (layOdds - 1));

  // Step 3: Calculate Bookmaker Wins
  const bookmakerWin = formatNumber((backOdds - 1) * backStake - liability);

  // Step 4: Calculate Exchange Lay Wins
  const layWinningsBeforeCommission = layStake; // Winning lay bet returns the stake
  const commissionAmount = formatNumber(layWinningsBeforeCommission * (commission / 100));
  const exchangeLayWin = formatNumber(layWinningsBeforeCommission - commissionAmount - backStake);

  return {
      layStake,
      liability,
      bookmakerWin,
      exchangeLayWin
  };
};

const calculateUnderlay = (backStake, backOdds, layOdds, commission) => {
    const layStake = formatNumber((backStake * backOdds) / layOdds * (1 + (backOdds - 1) / (layOdds - 1)));
    const liability = formatNumber(layStake * (layOdds - 1));
    
    const bookmakerWin = formatNumber((backStake * backOdds) - backStake - liability);
    
    const layWinnings = layStake;
    const commissionAmount = formatNumber(layWinnings * (commission / 100));
    const exchangeLayWin = formatNumber(layWinnings - commissionAmount - backStake);
    
    return {
        layStake,
        liability,
        bookmakerWin,
        exchangeLayWin
    };
};

const calculateOverlay = (backStake, backOdds, layOdds, commission) => {
    const layStake = formatNumber(backStake / (layOdds - 1));
    const liability = formatNumber(layStake * (layOdds - 1));
    
    const bookmakerWin = formatNumber((backStake * backOdds) - backStake - liability);
    
    const layWinnings = layStake;
    const commissionAmount = formatNumber(layWinnings * (commission / 100));
    const exchangeLayWin = formatNumber(layWinnings - commissionAmount - backStake);
    
    return {
        layStake,
        liability,
        bookmakerWin,
        exchangeLayWin
    };
};

// Input validation
const validateInputs = (backStake, backOdds, layOdds, commission) => {
    const errors = [];
    
    if (backStake <= 0) errors.push('Back stake must be greater than 0');
    if (backOdds <= 1) errors.push('Back odds must be greater than 1');
    if (layOdds <= 1) errors.push('Lay odds must be greater than 1');
    if (commission < 0 || commission > 100) errors.push('Commission must be between 0 and 100');
    
    return errors;
};

// Function to update the UI for a specific panel
const updatePanel = (prefix, results) => {
    const elements = ['LayStake', 'Liability', 'BookmakerWin', 'ExchangeLayWin'];
    elements.forEach(element => {
        const elementId = `${prefix}${element}`;
        const value = results[element.charAt(0).toLowerCase() + element.slice(1)];
        document.getElementById(elementId).textContent = value.toFixed(DECIMAL_PLACES);
    });
};

const initializeSlider = (standardLayStake, backStake, backOdds, layOdds, commission) => {
  const slider = document.getElementById('layStakeSlider');
  const sliderValue = document.getElementById('layStakeValue');
  const sliderLiability = document.getElementById('sliderLiability');
  const sliderBookmakerWin = document.getElementById('sliderBookmakerWin');
  const sliderExchangeLayWin = document.getElementById('sliderExchangeLayWin');

  // Set slider properties
  slider.value = standardLayStake;
  slider.min = (standardLayStake * 0.8).toFixed(2); // Allow a 20% range below
  slider.max = (standardLayStake * 1.2).toFixed(2); // Allow a 20% range above
  sliderValue.textContent = standardLayStake.toFixed(2);

  // Function to update the wins dynamically
  const updateDynamicResults = (layStake) => {
      const liability = layStake * (layOdds - 1);
      const bookmakerWin = formatNumber((backOdds - 1) * backStake - liability);
      
      const layWinnings = layStake;
      const commissionAmount = layWinnings * (commission / 100);
      const exchangeLayWin = formatNumber(layWinnings - commissionAmount - backStake);
      
      sliderLiability.textContent = liability.toFixed(DECIMAL_PLACES);
      sliderBookmakerWin.textContent = bookmakerWin.toFixed(DECIMAL_PLACES);
      sliderExchangeLayWin.textContent = exchangeLayWin.toFixed(DECIMAL_PLACES);
  };

  // Initial update
  updateDynamicResults(parseFloat(slider.value));

  // Add event listener for slider changes
  slider.addEventListener('input', (e) => {
      const newLayStake = parseFloat(e.target.value);
      sliderValue.textContent = newLayStake.toFixed(DECIMAL_PLACES);
      updateDynamicResults(newLayStake);
  });
};


// Main calculator function
const matchedBettingCalculator = (e) => {
    e.preventDefault();
    
    // Get and parse form values
    const formValues = {
        betType: document.getElementById('betType').value,
        backOdds: parseFloat(document.getElementById('backOdds').value),
        layOdds: parseFloat(document.getElementById('layOdds').value),
        backStake: parseFloat(document.getElementById('backStake').value),
        commission: parseFloat(document.getElementById('commission').value || 0)
    };
    
    // Validate inputs
    const errors = validateInputs(
        formValues.backStake,
        formValues.backOdds,
        formValues.layOdds,
        formValues.commission
    );
    
    if (errors.length > 0) {
        const errorMessage = errors.join('\n');
        if (document.getElementById('errorDisplay')) {
            document.getElementById('errorDisplay').textContent = errorMessage;
        } else {
            alert(errorMessage);
        }
        return;
    }
    
    // Calculate results for all three strategies
    const results = {
        underlay: calculateUnderlay(formValues.backStake, formValues.backOdds, formValues.layOdds, formValues.commission),
        standard: calculateStandard(formValues.backStake, formValues.backOdds, formValues.layOdds, formValues.commission),
        overlay: calculateOverlay(formValues.backStake, formValues.backOdds, formValues.layOdds, formValues.commission)
    };
    
    // Update all panels
    updatePanel('underlay', results.underlay);
    updatePanel('standard', results.standard);
    updatePanel('overlay', results.overlay);

     // Initialize the slider
     initializeSlider(results.standard.layStake, formValues.backStake, formValues.backOdds, formValues.layOdds, formValues.commission);
};

// Event listener
document.getElementById('calculatorForm').addEventListener('submit', matchedBettingCalculator);