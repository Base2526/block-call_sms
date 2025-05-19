import React, { useEffect, useState } from 'react';
import { AutoComplete, Input, Button, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Search } = Input;
const STORAGE_KEY = 'search_history';

interface SearchProps {
  onSearchChange: (e: string) => void;
}

const SearchComponent: React.FC<SearchProps> = ({ onSearchChange }) => {
  const [searchText, setSearchText] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const handleSearch = (value: string) => {
    if (!value.trim()) return;

    setHistory(prev => {
      const updated = [value, ...prev.filter(item => item !== value)];
      return updated.slice(0, 10);
    });

    onSearchChange(value); // trigger search logic
  };

  const handleRemoveHistoryItem = (valueToRemove: string) => {
    setHistory(prev => prev.filter(item => item !== valueToRemove));
  };

  const handleSelect = (value: string) => {
    setSearchText(value);
    onSearchChange(value);
  };

  const handleChange = (value: string) => {
    setSearchText(value);
    onSearchChange(value);
  };

  const options = history.map(term => ({
    value: term,
    label: (
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <span>{term}</span>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveHistoryItem(term);
          }}
        />
      </Space>
    ),
  }));

  return (
    <AutoComplete
      options={options}
      style={{ width: 300 }}
      onSelect={handleSelect}
      onChange={handleChange}
      value={searchText}
    >
      <Search
        placeholder="Search"
        onSearch={handleSearch}
        enterButton
        allowClear
      />
    </AutoComplete>
  );
};

export default SearchComponent;