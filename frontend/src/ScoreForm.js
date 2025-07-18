import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";

const Form = styled.form`
  background: ${({ theme }) => theme.card};
  padding: 2.2rem 2rem;
  border-radius: 1.7rem;
  box-shadow: 0 4px 24px ${({ theme }) => theme.primary}22;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  max-width: 420px;
  align-items: center;
`;

const Input = styled.input`
  padding: 0.9rem 1.2rem;
  border-radius: 1.2rem;
  border: 1.5px solid ${({ theme }) => theme.primary};
  font-size: 1.08rem;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  box-shadow: 0 2px 8px ${({ theme }) => theme.primary}11;
  outline: none;
  transition: border 0.3s, box-shadow 0.3s;
  &:focus, &:hover {
    border: 1.5px solid ${({ theme }) => theme.accent};
    box-shadow: 0 4px 16px ${({ theme }) => theme.accent}33;
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.button};
  color: ${({ theme }) => theme.buttonText};
  border: none;
  padding: 0.9rem 1.7rem;
  border-radius: 1.7rem;
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  box-shadow: 0 2px 12px ${({ theme }) => theme.primary}22;
  transition: background 0.3s, color 0.3s, box-shadow 0.3s;
  &:hover {
    background: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.text};
    box-shadow: 0 4px 24px ${({ theme }) => theme.accent}44;
    transform: translateY(-2px) scale(1.04);
  }
  &:active {
    transform: scale(0.97);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
`;

const Message = styled.div`
  margin-top: 0.5rem;
  color: ${({ error }) => (error ? "#e63946" : "#38b000")};
  font-weight: 600;
  font-size: 1.05rem;
`;

export default function ScoreForm({ onSuccess }) {
  const [tableName, setTableName] = useState("");
  const [username, setUsername] = useState("");
  const [score, setScore] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [timeBased, setTimeBased] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);
    try {
      const endpoint = timeBased 
        ? `http://localhost:5020/scores/submit-time-based/${tableName}`
        : `http://localhost:5020/scores/submit/${tableName}`;
      await axios.post(endpoint, {
        username,
        score: Number(score)
      });
      setMessage("Skor başarıyla eklendi!");
      setError(false);
      setTableName("");
      setUsername("");
      setScore("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setMessage("Skor eklenirken hata oluştu.");
      setError(true);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Tablo Adı (örn: game1)"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Kullanıcı Adı"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <Input
        type="number"
        placeholder="Skor"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        required
        min="0"
      />
      <CheckboxContainer>
        <Checkbox
          type="checkbox"
          id="timeBased"
          checked={timeBased}
          onChange={(e) => setTimeBased(e.target.checked)}
        />
        <CheckboxLabel htmlFor="timeBased">
          Zaman bazlı tablolara da ekle (Günlük/Haftalık/Aylık)
        </CheckboxLabel>
      </CheckboxContainer>
      <Button type="submit">➕ Skor Ekle</Button>
      {message && <Message error={error}>{message}</Message>}
    </Form>
  );
} 