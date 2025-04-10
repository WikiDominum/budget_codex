import React, { useState, useEffect } from 'react';

function PowerCalc({ selectedItemStats, selectedRarity }) {
  const [intStrength, setIntStrength] = useState(0);
  const [powerRating, setPowerRating] = useState(0);
  const [manualTotalPower, setManualTotalPower] = useState(0);
  const [itemMinPower, setItemMinPower] = useState(null);
  const [itemMaxPower, setItemMaxPower] = useState(null);

  useEffect(() => {
    calculateManualTotalPower(intStrength, powerRating);

    if (selectedItemStats) {
      let minIntStr = 0;
      let maxIntStr = 0;
      let minPowerRating = 0;
      let maxPowerRating = 0;

      if (selectedItemStats?.Strength?.values) {
        minIntStr = selectedItemStats.Strength.values[`${selectedRarity}Min`] || selectedItemStats.Strength.values[`${selectedRarity}Max`] || 0;
        maxIntStr = selectedItemStats.Strength.values[`${selectedRarity}Max`] || selectedItemStats.Strength.values[`${selectedRarity}Min`] || 0;
      } else if (selectedItemStats?.Intelligence?.values) {
        minIntStr = selectedItemStats.Intelligence.values[`${selectedRarity}Min`] || selectedItemStats.Intelligence.values[`${selectedRarity}Max`] || 0;
        maxIntStr = selectedItemStats.Intelligence.values[`${selectedRarity}Max`] || selectedItemStats.Intelligence.values[`${selectedRarity}Min`] || 0;
      } else if (typeof selectedItemStats?.intStrength === 'number') {
        minIntStr = selectedItemStats.intStrength;
        maxIntStr = selectedItemStats.intStrength;
      } else if (typeof selectedItemStats?.intStrength === 'object' && selectedItemStats?.intStrength !== null) {
        minIntStr = selectedItemStats.intStrength.min || 0;
        maxIntStr = selectedItemStats.intStrength.max || 0;
      }

      const magicalPower = selectedItemStats?.MagicalPowerRating?.values;
      const physicalPower = selectedItemStats?.PhysicalPowerRating?.values;

      if (magicalPower) {
        minPowerRating = magicalPower[`${selectedRarity}Min`] || magicalPower[`${selectedRarity}Max`] || 0;
        maxPowerRating = magicalPower[`${selectedRarity}Max`] || magicalPower[`${selectedRarity}Min`] || 0;
      } else if (physicalPower) {
        minPowerRating = physicalPower[`${selectedRarity}Min`] || physicalPower[`${selectedRarity}Max`] || 0;
        maxPowerRating = physicalPower[`${selectedRarity}Max`] || physicalPower[`${selectedRarity}Min`] || 0;
      } else if (typeof selectedItemStats?.powerRating === 'number') {
        minPowerRating = selectedItemStats.powerRating;
        maxPowerRating = selectedItemStats.powerRating;
      } else if (typeof selectedItemStats?.powerRating === 'object' && selectedItemStats?.powerRating !== null) {
        minPowerRating = selectedItemStats.powerRating.min || 0;
        maxPowerRating = selectedItemStats.powerRating.max || 0;
      }

      const calculatedMinPower = (minIntStr * 3 + minPowerRating) / 50;
      const calculatedMaxPower = (maxIntStr * 3 + maxPowerRating) / 50;

      setItemMinPower(calculatedMinPower.toFixed(2));
      setItemMaxPower(calculatedMaxPower.toFixed(2));
    } else {
      setItemMinPower(null);
      setItemMaxPower(null);
    }
  }, [selectedItemStats, intStrength, powerRating, selectedRarity]);

  const handleIntStrengthChange = (event) => {
    const value = parseInt(event.target.value, 10) || 0;
    setIntStrength(value);
  };

  const handlePowerRatingChange = (event) => {
    const value = parseInt(event.target.value, 10) || 0;
    setPowerRating(value);
  };

  const calculateManualTotalPower = (intStr, power) => {
    const powerFromIntStrength = intStr * 3;
    const totalPowerRating = power + powerFromIntStrength;
    const calculatedTotalPower = totalPowerRating / 50;
    setManualTotalPower(calculatedTotalPower.toFixed(2));
  };

  return (
    <div className="power-calc">
      <h2>Power Calculator</h2>
      <div>
        <label htmlFor="intStrength">Int/Strength:</label>
        <input
          type="number"
          id="intStrength"
          value={intStrength}
          onChange={handleIntStrengthChange}
        />
      </div>
      <div>
        <label htmlFor="powerRating">Power Rating:</label>
        <input
          type="number"
          id="powerRating"
          value={powerRating}
          onChange={handlePowerRatingChange}
        />
      </div>

      <div className="results">
        <h3>Manual Calculation</h3>
        <p>Total Power: {manualTotalPower}</p>
      </div>

      {itemMinPower !== null && itemMaxPower !== null && (
        <div className="item-power-range">
          <h3>Selected Item Power Range</h3>
          <p>Min Power: {itemMinPower}</p>
          <p>Max Power: {itemMaxPower}</p>
        </div>
      )}
      {itemMinPower === null && (
        <p>Select an item to see its power range.</p>
      )}
    </div>
  );
}

export default PowerCalc;