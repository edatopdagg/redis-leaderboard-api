import React from "react";
import styled from "styled-components";

const Select = styled.select`
  padding: 0.8rem 1.2rem;
  border-radius: 1.2rem;
  border: 1.5px solid ${({ theme }) => theme.primary};
  font-size: 1.08rem;
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  box-shadow: 0 2px 8px ${({ theme }) => theme.primary}22;
  margin-bottom: 1.5rem;
  outline: none;
  transition: border 0.3s, box-shadow 0.3s;
  &:focus, &:hover {
    border: 1.5px solid ${({ theme }) => theme.accent};
    box-shadow: 0 4px 16px ${({ theme }) => theme.accent}33;
  }
`;

export default function TableSelector({ tableNames, value, onChange }) {
  return (
    <Select value={value} onChange={e => onChange(e.target.value)}>
      {tableNames.map((name) => (
        <option key={name} value={name}>{name}</option>
      ))}
    </Select>
  );
} 