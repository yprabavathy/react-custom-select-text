import React, { useState, useEffect, useRef, useMemo } from "react";
import { Checkbox, TextInput } from "flowbite-react";
import "./textinput.css"; // optional custom styles

const CustomSelectwithText = ({
  value = {},
  onChange,
  options = [],
  id,
  name,
  isDisabled = false,
  placeholder = "Select options",
}) => {
  const [inputValues, setInputValues] = useState({});
  const [checkedValues, setCheckedValues] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const optionsMap = useMemo(() => Object.fromEntries(options.map(o => [o.value, o.label])), [options]);

  // Initialize state from `value`
  useEffect(() => {
    if (value && typeof value === "object") {
      setCheckedValues(Object.keys(value).map(k => isNaN(k) ? k : Number(k)));
      setInputValues(value);
    }
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!isDisabled) setIsDropdownVisible(prev => !prev);
  };

  const handleCheckboxChange = (e, optionValue) => {
    const checked = e.target.checked;
    setCheckedValues(prev => 
      checked ? [...prev, optionValue] : prev.filter(val => val !== optionValue)
    );
    setInputValues(prev => {
      const updated = { ...prev };
      if (checked) updated[optionValue] = "1";
      else delete updated[optionValue];
      onChange(updated);
      return updated;
    });
  };

  const handleInputChange = (val, optionValue) => {
    setInputValues(prev => {
      const updated = { ...prev, [optionValue]: val };
      onChange(updated);
      return updated;
    });
  };

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative rounded-lg">
      <div
        id={id}
        name={name}
        className="border border-gray-300 p-2 cursor-pointer flex flex-wrap gap-2"
        onClick={toggleDropdown}
      >
        {checkedValues.length > 0 ? (
          checkedValues.map(item => (
            <div key={item} className="flex items-center bg-gray-100 border p-1 gap-1 rounded-lg">
              <span className="text-xs">{optionsMap[item]} ({inputValues[item] || 0})</span>
              <button
                className="text-red-500 text-xs font-extrabold px-2 hover:bg-red-200 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) {
                    setCheckedValues(prev => prev.filter(val => val !== item));
                    setInputValues(prev => {
                      const updated = { ...prev };
                      delete updated[item];
                      onChange(updated);
                      return updated;
                    });
                  }
                }}
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </div>

      {isDropdownVisible && (
        <div
          ref={dropdownRef}
          className="border border-gray-300 absolute top-full left-0 w-full bg-white p-2 z-[9999] shadow-lg"
        >
          <TextInput
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search options"
            className="custominput mb-2 w-full text-xs"
          />
          {filteredOptions.map(option => (
            <div key={option.value} className="flex items-center mb-2 p-1 overflow-hidden">
              <Checkbox
                checked={checkedValues.includes(option.value)}
                onChange={(e) => handleCheckboxChange(e, option.value)}
                className="mr-2"
              />
              <span className="whitespace-nowrap">{option.label}</span>
              {checkedValues.includes(option.value) && (
                <TextInput
                  type="number"
                  min="1"
                  value={inputValues[option.value] || ''}
                  onChange={(e) => handleInputChange(e.target.value, option.value)}
                  placeholder="Enter value"
                  className="custominput ml-2 w-24 text-xs"
                />
              )}
            </div>
          ))}
          {filteredOptions.length === 0 && <div className="text-gray-500 text-xs">No options found</div>}
        </div>
      )}
    </div>
  );
};

export default CustomSelectwithText;
