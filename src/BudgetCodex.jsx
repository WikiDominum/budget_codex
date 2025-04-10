import React, { useState, useEffect } from 'react';
import ItemSearch from './Components/ItemSearch';
import ItemDetails from './Components/ItemDetails';
import './Styles/itemViewer.css';
import PowerCalc from './Components/PowerCalc';

function BudgetCodex() {
  const [selectedItemGuid, setSelectedItemGuid] = useState(null);
  const [selectedRarity, setSelectedRarity] = useState('common');
  const [enchantLevel, setEnchantLevel] = useState(0);
  const [enchantedItemStatsForCalc, setEnchantedItemStatsForCalc] = useState(null);

  const handleItemSelect = (guid) => {
    setSelectedItemGuid(guid);
  };

  const handleRarityChange = (event) => {
    setSelectedRarity(event.target.value);
  };

  const handleEnchantLevelChange = (event) => {
    setEnchantLevel(parseInt(event.target.value, 10));
  };

  const handleEnchantedStatsChange = (enchantedStats) => {
    setEnchantedItemStatsForCalc(enchantedStats);
  };

  useEffect(() => {
  }, [enchantLevel, enchantedItemStatsForCalc]);

  return (
    <div className="budget-codex-page">
      <div className="item-db-container">
        <div className="item-viewer-header">
          <h1>Item Database</h1>
          <div className="search-and-enchant-container">
            <ItemSearch onItemSelect={handleItemSelect} />
            <div className="filter-container">
              <div className="rarity-filter">
                <label htmlFor="rarity">Rarity:</label>
                <select
                  id="rarity"
                  value={selectedRarity}
                  onChange={handleRarityChange}
                >
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="heroic">Heroic</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                  <option value="artifact">Artifact</option>
                </select>
              </div>

              <div className="enchant-level-filter">
                <label htmlFor="enchant-level">Enchant:</label>
                <select
                  id="enchant-level"
                  value={enchantLevel}
                  onChange={handleEnchantLevelChange}
                >
                  {[
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                    18, 19, 20,
                  ].map((level) => (
                    <option key={level} value={level}>
                      {level === 0 ? 'None' : level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="item-details">
          <ItemDetails
            selectedItemGuid={selectedItemGuid}
            selectedRarity={selectedRarity}
            enchantLevel={enchantLevel}
            onEnchantedStatsChange={handleEnchantedStatsChange}
          />
        </div>
      </div>
      <div className="power-calc-container">
        <PowerCalc selectedItemStats={enchantedItemStatsForCalc} selectedRarity={selectedRarity} />
      </div>
    </div>
  );
}

export default BudgetCodex;