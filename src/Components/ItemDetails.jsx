import React, { useState, useEffect, useCallback } from 'react';
import itemsData from '../Data/all_items_data.json';
import enchantmentData from '../Data/enchantment_data.json';
import '../Styles/itemViewer.css';

const imagePath = require.context('../Data/I/', false, /\.(png|jpg|jpeg|gif|svg)$/);

function formatStatName(name) {
  return name.replace(/([A-Z])/g, ' $1').trim();
}

function ItemDetails({ selectedItemGuid, selectedRarity, enchantLevel, onEnchantedStatsChange }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [previousEnchantedStats, setPreviousEnchantedStats] = useState(null); 

  useEffect(() => {
    if (selectedItemGuid) {
      const item = itemsData[selectedItemGuid];
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
      if (onEnchantedStatsChange) onEnchantedStatsChange(null);
      setPreviousEnchantedStats(null); // Reset previous stats
    }
  }, [selectedItemGuid, onEnchantedStatsChange]);

  const getEnchantedStats = useCallback((item, enchantLevel) => {
    const baseStats = item?.stats || {};
    if (!item?.enchantGuid || enchantLevel === 0) {
      return baseStats;
    }

    const enchantData = enchantmentData[item.enchantGuid];
    if (!enchantData) {
      console.warn(`Enchantment data not found for GUID: ${item.enchantGuid}`);
      return baseStats;
    }

    const levelKeys = Object.keys(enchantData.levels);
    if (enchantLevel > levelKeys.length) {
      console.warn(`Enchant level ${enchantLevel} is out of bounds for item ${item.name}`);
      return baseStats;
    }

    const levelGuid = levelKeys[enchantLevel - 1];
    const levelData = enchantData.levels[levelGuid];

    if (!levelData) {
      console.warn(
        `Enchantment level data not found for level: ${enchantLevel} and GUID: ${levelGuid}`
      );
      return baseStats;
    }

    const enchantedStats = {};
    for (const statName in baseStats) {
      const statEntry = baseStats[statName];

      if (statName === 'MaxDurability' && statEntry && statEntry.values) {
        enchantedStats[statName] = statEntry;
        continue;
      } else if (statName === "archetype") {
        enchantedStats[statName] = statEntry;
        continue;
      }

      if (statEntry && statEntry.values) {
        const statValues = statEntry.values;
        const PrimaryStatIncrease = levelData.PrimaryStatIncrease || 0;
        const enchantedValues = {};
        for (const rarity in statValues) {
          if (rarity.endsWith('Min')) {
            const baseValue = statValues[rarity];
            enchantedValues[rarity] = Math.round(baseValue * (1 + PrimaryStatIncrease));
          } else if (rarity.endsWith('Max')) {
            const baseValue = statValues[rarity];
            enchantedValues[rarity] = Math.round(baseValue * (1 + PrimaryStatIncrease));
          } else {
            enchantedValues[rarity] = statValues[rarity];
          }
        }
        enchantedStats[statName] = { values: enchantedValues, archetype: statEntry.archetype };
      }
    }
    return enchantedStats;
  }, [enchantmentData]);

  useEffect(() => {
    if (selectedItem) {
      const enchantedStats = getEnchantedStats(selectedItem, enchantLevel);

      // Compare current and previous enchanted stats
      const areStatsEqual = (obj1, obj2) => {
        if (obj1 === null && obj2 === null) return true;
        if (obj1 === null || obj2 === null) return false;
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;
        for (const key of keys1) {
          if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
            if (!areStatsEqual(obj1[key], obj2[key])) return false;
          } else if (obj1[key] !== obj2[key]) {
            return false;
          }
        }
        return true;
      };

      if (!areStatsEqual(enchantedStats, previousEnchantedStats)) {
        if (onEnchantedStatsChange) {
          onEnchantedStatsChange(enchantedStats);
        }
        setPreviousEnchantedStats(enchantedStats); // Update previous stats
      }
    } else {
      if (onEnchantedStatsChange) onEnchantedStatsChange(null);
      setPreviousEnchantedStats(null); // Reset previous stats
    }
  }, [selectedItem, enchantLevel, onEnchantedStatsChange, previousEnchantedStats, getEnchantedStats]);

  const extractDisplayName = (rawDisplayName) => {
    const match = rawDisplayName.match(/NSLOCTEXT\([^,]+, [^,]+, "([^"]+)"\)/);
    return match ? match[1] : rawDisplayName;
  };

  const renderStat = (statName, statValues, rarity) => {
    if (statValues) {
      if (
        statValues[`${rarity}Min`] !== undefined &&
        statValues[`${rarity}Max`] !== undefined
      ) {
        return (
          <li key={statName} className="base-stat">
            <span className="stat-name">{formatStatName(statName)}: </span>
            <span className={`stat-value ${rarity}`}>
              {statValues[`${rarity}Min`]} - {statValues[`${rarity}Max`]}
            </span>
          </li>
        );
      } else if (statValues[rarity] !== undefined) {
        return (
          <li key={statName} className="set-bonus-stat-value">
            <span className="stat-name">{formatStatName(statName)}</span>
            <span className={rarity}>{statValues[rarity]}</span>
          </li>
        );
      }
    }
    return null;
  };

  const renderSetBonusStatsInline = (setBonus) => {
    if (!setBonus || Object.keys(setBonus).length === 0) {
      return null;
    }

    const bonusElements = [];
    for (const setNameGuid in setBonus) {
      const bonusDetails = setBonus[setNameGuid];
      const displayName = extractDisplayName(bonusDetails.displayName);
      bonusElements.push(
        <h4 key={setNameGuid} className="set-bonus-title">
          {displayName}
        </h4>
      );
      for (const pieceCount in bonusDetails.effects) {
        const effects = bonusDetails.effects[pieceCount];
        const pieceEffectsList = Object.entries(effects)
          .map(([statName, statValues]) => {
            const statDisplayName = formatStatName(statName);
            const statValue = statValues[selectedRarity];
            return (
              <li key={`${pieceCount}-${statName}`} className="set-bonus-effect">
                {pieceCount} Piece: {statDisplayName} - {statValue}
              </li>
            );
          })
          .filter(Boolean);

        if (pieceEffectsList.length > 0) {
          bonusElements.push(
            <ul key={`pieces-${pieceCount}`} className="set-bonus-effects">
              {pieceEffectsList}
            </ul>
          );
        }
      }
    }
    return <div className="set-bonus-container">{bonusElements}</div>;
  };

  let maxDurability = null;
  if (selectedItem?.stats?.MaxDurability) {
    maxDurability = selectedItem.stats.MaxDurability.values?.[selectedRarity + 'Min'] ?? selectedItem.stats.MaxDurability.values?.[selectedRarity + 'Max'] ?? null;
  }

  const enchantedStats = getEnchantedStats(selectedItem, enchantLevel);

  const getItemStat = (statName) => {
    return enchantedStats?.[statName]?.values?.[selectedRarity + 'Min'] !== undefined
      ? enchantedStats[statName].values[selectedRarity + 'Min']
      : enchantedStats?.[statName]?.values?.[selectedRarity + 'Max'];
  };

  const itemRarity = selectedRarity?.toLowerCase() || 'common';
  const itemName = selectedItem?.name || selectedItem?.itemName || 'Unknown Item';
  const itemDescription = selectedItem?.itemDescription;
  const itemLevel = selectedItem?.level;
  const itemType = selectedItem?.itemTypeTags[0];
  const itemIconFileName = selectedItem?.displayIcon || "NA";
  const itemIconUrl = itemIconFileName !== "NA" ? imagePath(`./${itemIconFileName}.png`) : null;

  return (
    <div className="box-shadow relative overflow-hidden rounded-lg border border-gray bg-card-dark tracking-wider text-primary md:w-[420px]">
      <div className="bg-cover md:min-h-[84px]">
        <div className="text-shadow h-full border-b-2 border-[#6A6A6A]/50 from-1% to-90% bg-gradient-to-b from-[\#1f3a1a\]/10 to-[\#1f3a1a\] p-2">
          <div className="flex items-center gap-2">
            <div
              className="h-16 w-16 shrink-0 overflow-hidden"
              style={{ boxShadow: 'inset 0 0 5px 2px black, 0 0 0 1px black' }}
            >
              <div
                className="relative overflow-hidden rounded-sm !from-black from-40% bg-gradient-to-b from-[#333333]/10 to-[#333333]"
                style={{ width: '64px', height: '64px', border: '1px solid #6A6A6A' }}
              >
                {itemIconUrl && (
                  <img
                    src={itemIconUrl}
                    alt={itemName}
                    loading="lazy"
                    className="w-[64px] h-[64px]"
                    style={{ filter: 'drop-shadow(0px 0px 1px rgba(255, 255, 255, 0.1))' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                )}
                {!itemIconUrl && (
                  <div
                    style={{ width: '64px', height: '64px', display: 'flex' }}
                    className="-ml-[2px] -mt-[2px] items-center justify-center"
                  >
                    {/* Placeholder for when image is "NA" */}
                    NA
                  </div>
                )}
              </div>
            </div>
            <div>
              <h1 className="font-game small-caps mb-1 text-2xl">{itemName}</h1>
              <div className="flex items-center text-lg" style={{ color: `var(--rarity-${itemRarity}, #6A6A6A)` }}>
                {itemRarity.charAt(0).toUpperCase() + itemRarity.slice(1)} {itemType}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-dark text-secondary">
        <div className="px-4 py-2">
          <div className="grid grid-cols-2 text-xl" style={{ gridTemplateColumns: 'auto minmax(0, 1fr)' }}>
            {Object.entries(enchantedStats || {})
            .filter(([statName]) => statName !== 'MaxDurability' && statName !== 'archetype')
            .sort(([, statA], [, statB]) => {
              const archetypeA = statA?.archetype;
              const archetypeB = statB?.archetype;

              if (archetypeA === 'Core' && archetypeB !== 'Core') {
                return 1;
              }
              if (archetypeA !== 'Core' && archetypeB === 'Core') {
                return -1;
              }
              return 0;
            })
            .map(([statName, statDetails]) => {
              const statValue = statDetails?.values?.[selectedRarity + 'Min'] !== undefined
                ? statDetails.values[selectedRarity + 'Min']
                : statDetails?.values?.[selectedRarity + 'Max'];
              const archetypeClass = statDetails?.archetype === 'Core' ? 'core-stat' : 'primary-stat';

            if (statValue !== undefined) {
              return (
                <React.Fragment key={statName}>
                  <div className={archetypeClass}> {/* Apply archetype class to the container */}
                    <div className="flex w-32 items-center gap-2">
                      <div className="h-2 w-2 rotate-45 bg-white"></div>
                      <span>{statValue}</span>
                    </div>
                  </div>
                  <div className={`w-full text-lg ${archetypeClass}`} tabIndex="0"> {/* Apply archetype class here too for styling the name */}
                    {formatStatName(statName)}
                  </div>
                </React.Fragment>
              );
            }
            return null;
          })} 
          </div>
          {renderSetBonusStatsInline(selectedItem?.setBonus)}
        </div>
        <div className="fade-both mx-2 border-b border-t border-neutral-700 bg-neutral-700 px-6 py-2 text-xl">
          {/* Spacer or additional info */}
        </div>
      </div>
      <div className="font-game mt-4 px-4 italic">{itemDescription}</div>
      <div className="fade-both mx-2 mt-4 border-b border-t border-neutral-700 bg-neutral-700 px-2 py-0">
        <div className="p-2 text-right">
          {itemLevel !== undefined && <div>Item Level - {itemLevel}</div>}
          {maxDurability !== undefined && <div className="bg-black-500">Max Durability {maxDurability}</div>}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 border-t border-gray p-2">
        <div className="flex h-8 w-8 items-center rounded-md border border-gray p-1 text-secondary hover:cursor-help" tabIndex="0">
          <svg width="24" height="24" stroke="currentColor" strokeWidth="2" className="lucide-icon lucide lucide-hand-helping" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14"></path><path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"></path><path d="m2 13 6 6"></path></svg>
        </div>
        <div className="flex h-8 items-center gap-1 rounded-md border border-gray p-1 text-secondary hover:cursor-help" tabIndex="0">
          <svg width="24" height="24" stroke="currentColor" strokeWidth="2" className="lucide-icon lucide lucide-hand-coins" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"></path><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"></path><path d="m2 16 6 6"></path><circle cx="16" cy="9" r="2.9"></circle><circle cx="6" cy="5" r="3"></circle></svg>
        </div>
        <div className="flex h-8 items-center gap-1 rounded-md border border-gray p-1 px-2 text-secondary hover:cursor-help" tabIndex="0">
          1 <svg width="24" height="24" stroke="currentColor" strokeWidth="2" className="lucide-icon lucide lucide-layers h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path></svg>
        </div>
        <div className="flex h-8 items-center gap-1 rounded-md border border-gray p-1 px-2 text-secondary hover:cursor-help" tabIndex="0">
          1x1 <svg width="24" height="24" stroke="currentColor" strokeWidth="2" className="lucide-icon lucide lucide-blocks h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="14" y="3" rx="1"></rect><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"></path></svg>
        </div>
        <div className="ml-auto text-secondary">BudgetCodex.com</div>
      </div>
    </div>
  );
}

export default ItemDetails;