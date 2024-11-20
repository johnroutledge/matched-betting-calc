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
  // Calculate the lay stake to ensure exchange lay win is £0
  const layStake = formatNumber(backStake / (layOdds - 1)); // Adjusted formula
  const liability = formatNumber(layStake * (layOdds - 1));
  
  const bookmakerWin = formatNumber((backStake * backOdds) - backStake - liability); // Adjusted to calculate correctly
  const layWinnings = layStake;
  const commissionAmount = formatNumber(layWinnings * (commission / 100));
  const exchangeLayWin = formatNumber(layWinnings - commissionAmount - backStake); // Exchange lay win should be £0

  return {
      layStake,
      liability,
      bookmakerWin,
      exchangeLayWin
  };
};
const calculateOverlay = (backStake, backOdds, layOdds, commission) => {
  // Calculate lay stake to ensure bookmaker win is £0
  const layStake = formatNumber((backStake * (backOdds - 1)) / layOdds);
  const liability = formatNumber(layStake * (layOdds - 1));
  
  // Bookmaker Win should be £0
  const bookmakerWin = 0; 
  
  // Calculate exchange lay win
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

const calculateFreeBetSNR = (backStake, backOdds, layOdds, commission) => {
  // Step 1: Calculate Lay Stake
  const layStake = formatNumber((backStake * (backOdds - 1)) / layOdds);

  // Step 2: Calculate Liability
  const liability = formatNumber(layStake * (layOdds - 1));

  // Step 3: Calculate Bookmaker Wins
  const bookmakerWin = formatNumber((backOdds - 1) * backStake - liability);

  // Step 4: Calculate Exchange Lay Wins
  const layWinningsBeforeCommission = layStake; // Winning lay bet returns the stake
  const commissionAmount = formatNumber(layWinningsBeforeCommission * (commission / 100));
  const exchangeLayWin = formatNumber(layWinningsBeforeCommission - commissionAmount);

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
  const sliderBookmakerWin = document.getElementById('sliderBookmakerWin');
  const sliderExchangeLayWin = document.getElementById('sliderExchangeLayWin');
  const sliderLiability = document.getElementById('sliderLiability');
  const sliderBookmakerWinPoundSign = document.getElementById('sliderBookmakerWinPoundSign');
  const sliderExchangeLayWinPoundSign = document.getElementById('sliderExchangeLayWinPoundSign');
  

  // Set slider properties
  slider.value = standardLayStake;
  slider.min = (standardLayStake * 0.5).toFixed(2); // Allow a 20% range below
  slider.max = (standardLayStake * 1.5).toFixed(2); // Allow a 20% range above
  sliderValue.textContent = standardLayStake.toFixed(2);

  const updateColor = (element, value) => {  
    // Apply color based on the value
    if (value < 0) {
      element.style.color = 'red';  // Negative values turn red
    } else {
      element.style.color = 'green';  // Positive values turn green
    }
  };

  // Function to update the wins dynamically
  const updateDynamicResults = (layStake) => {
      const liability = layStake * (layOdds - 1);
      const bookmakerWin = formatNumber((backOdds - 1) * backStake - liability);
      
      const layWinnings = layStake;
      const commissionAmount = layWinnings * (commission / 100);
      const exchangeLayWin = formatNumber(layWinnings - commissionAmount - backStake);
      
      sliderBookmakerWin.textContent = bookmakerWin.toFixed(DECIMAL_PLACES);
      sliderExchangeLayWin.textContent = exchangeLayWin.toFixed(DECIMAL_PLACES);
      sliderLiability.textContent = liability.toFixed(DECIMAL_PLACES);

      // updateColor(sliderLiability, liability);
      updateColor(sliderBookmakerWin, bookmakerWin);
      updateColor(sliderExchangeLayWin, exchangeLayWin);
      updateColor(sliderBookmakerWinPoundSign, bookmakerWin);
      updateColor(sliderExchangeLayWinPoundSign, exchangeLayWin);
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

// Function to initialize the slider for Free Bet SNR
const initializeSliderForFreeBetSNR = (backStake, backOdds, layOdds, commission) => {
  const slider = document.getElementById('layStakeSlider');
  const sliderValue = document.getElementById('layStakeValue');
  const sliderBookmakerWin = document.getElementById('sliderBookmakerWin');
  const sliderExchangeLayWin = document.getElementById('sliderExchangeLayWin');
  const sliderLiability = document.getElementById('sliderLiability');
  const sliderBookmakerWinPoundSign = document.getElementById('sliderBookmakerWinPoundSign');
  const sliderExchangeLayWinPoundSign = document.getElementById('sliderExchangeLayWinPoundSign');

  // Calculate Free Bet SNR results
  const { layStake, liability, bookmakerWin, exchangeLayWin } = calculateFreeBetSNR(backStake, backOdds, layOdds, commission);

  // Set slider properties for Free Bet SNR
  slider.value = layStake;
  slider.min = (layStake * 0.5).toFixed(2); // Allow a 50% range below
  slider.max = (layStake * 1.5).toFixed(2); // Allow a 50% range above
  sliderValue.textContent = layStake.toFixed(DECIMAL_PLACES);

  const updateColor = (element, value) => {
    // Apply color based on the value
    if (value < 0) {
      element.style.color = 'red';  // Negative values turn red
    } else {
      element.style.color = 'green';  // Positive values turn green
    }
  };

  // Function to update the wins dynamically
  const updateDynamicResults = (layStake) => {
      const newLiability = layStake * (layOdds - 1);
      const newBookmakerWin = formatNumber((backOdds - 1) * backStake - newLiability);
      
      const layWinnings = layStake;
      const commissionAmount = formatNumber(layWinnings * (commission / 100));
      const newExchangeLayWin = formatNumber(layWinnings - commissionAmount);

      // Update UI dynamically
      sliderBookmakerWin.textContent = newBookmakerWin.toFixed(DECIMAL_PLACES);
      sliderExchangeLayWin.textContent = newExchangeLayWin.toFixed(DECIMAL_PLACES);
      sliderLiability.textContent = newLiability.toFixed(DECIMAL_PLACES);
      // Update UI dynamically and apply color based on positive/negative values
      // updateColor(sliderLiability, newLiability);
      updateColor(sliderBookmakerWin, newBookmakerWin);
      updateColor(sliderExchangeLayWin, newExchangeLayWin);
      updateColor(sliderBookmakerWinPoundSign, newBookmakerWin);
      updateColor(sliderExchangeLayWinPoundSign, newExchangeLayWin);
  };

  // Initial update for slider values
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

    let results;
    
    if (formValues.betType === 'freeBetSNR') {
        // Calculate specifically for Free Bet SNR
        results = calculateFreeBetSNR(formValues.backStake, formValues.backOdds, formValues.layOdds, formValues.commission);
        // Update the UI specifically for free bet
        updatePanel('standard', results); // Assuming standard panel displays the main results
        initializeSliderForFreeBetSNR(formValues.backStake, formValues.backOdds, formValues.layOdds, formValues.commission);

    } else {
        // Calculate results for all three strategies
        results = {
            underlay: calculateUnderlay(formValues.backStake, formValues.backOdds, formValues.layOdds, formValues.commission),
            standard: calculateStandard(formValues.backStake, formValues.backOdds, formValues.layOdds, formValues.commission),
            overlay: calculateOverlay(formValues.backStake, formValues.backOdds, formValues.layOdds, formValues.commission)
        };

        // Update all panels
        updatePanel('underlay', results.underlay);
        updatePanel('standard', results.standard);
        updatePanel('overlay', results.overlay);
        initializeSlider(results.standard.layStake, formValues.backStake, formValues.backOdds, formValues.layOdds, formValues.commission);

    }

};

// Event listener
document.getElementById('calculatorForm').addEventListener('submit', matchedBettingCalculator);