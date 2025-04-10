import React, { useState, useEffect, useRef } from 'react';
import itemsData from '../Data/all_items_data.json';
import '../Styles/itemViewer.css'; 

function ItemSearch({ onItemSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const results = Object.keys(itemsData).filter((guid) => {
      const item = itemsData[guid];
      const itemNameLower = item.itemName ? item.itemName.toLowerCase() : '';
      const nameLower = item.name ? item.name.toLowerCase() : '';
      const searchLower = searchTerm.toLowerCase();
      return itemNameLower.includes(searchLower) || nameLower.includes(searchLower);
    });
    setFilteredItems(results);
    setIsDropdownOpen(searchTerm.length > 0 && results.length > 0);
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleItemClick = (guid) => {
    onItemSelect(guid);
    setIsDropdownOpen(false); // Close the dropdown on selection
    setSearchTerm(''); // Optionally clear the search term
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchInputRef, resultsRef]);

  return (
    <div className="search-container">
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search for items..."
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setIsDropdownOpen(searchTerm.length > 0 && filteredItems.length > 0)}
      />
      {isDropdownOpen && (
        <div ref={resultsRef} className="search-results dropdown">
          <ul>
            {filteredItems.map((guid) => {
              const itemRarity = itemsData[guid].rarity
                ? itemsData[guid].rarity.toLowerCase()
                : 'common';
              return (
                <ul key={guid}>
                  <li
                    onClick={() => handleItemClick(guid)}
                    className={`search-result-item ${itemRarity}`}
                  >
                    {itemsData[guid].name || itemsData[guid].itemName}
                  </li>
                </ul>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ItemSearch;