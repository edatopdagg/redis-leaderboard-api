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

const Message = styled.div`
  margin-top: 0.5rem;
  color: ${({ error }) => (error ? "#e63946" : "#38b000")};
  font-weight: 600;
  font-size: 1.05rem;
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

export function ScoreUpdateForm({ onSuccess }) {
  const [updateTable, setUpdateTable] = useState("");
  const [updateUser, setUpdateUser] = useState("");
  const [updateScore, setUpdateScore] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [updateErr, setUpdateErr] = useState(false);
  const [timeBased, setTimeBased] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateMsg("");
    setUpdateErr(false);
    try {
      const endpoint = timeBased 
        ? `http://localhost:5020/scores/increment-time-based/${updateTable}`
        : `http://localhost:5020/scores/update/${updateTable}`;
        
      const data = timeBased 
        ? { username: updateUser, increment: Number(updateScore) }
        : { username: updateUser, score: Number(updateScore) };
        
      const method = timeBased ? 'put' : 'put';
      
      await axios[method](endpoint, data);
      
      const successMessage = timeBased 
        ? "Skor başarıyla artırıldı! (Zaman bazlı tablolarda da güncellendi)"
        : "Skor başarıyla güncellendi!";
        
      setUpdateMsg(successMessage);
      setUpdateErr(false);
      setUpdateTable("");
      setUpdateUser("");
      setUpdateScore("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setUpdateMsg("Skor güncellenirken hata oluştu.");
      setUpdateErr(true);
    }
  };

  return (
    <Form onSubmit={handleUpdate}>
      <h3>Skor Güncelle</h3>
      <Input
        type="text"
        placeholder="Tablo Adı (örn: game1)"
        value={updateTable}
        onChange={(e) => setUpdateTable(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Kullanıcı Adı"
        value={updateUser}
        onChange={(e) => setUpdateUser(e.target.value)}
        required
      />
      <Input
        type="number"
        placeholder={timeBased ? "Artırılacak Skor" : "Yeni Skor"}
        value={updateScore}
        onChange={(e) => setUpdateScore(e.target.value)}
        required
        min="0"
      />
      <CheckboxContainer>
        <Checkbox
          type="checkbox"
          id="updateTimeBased"
          checked={timeBased}
          onChange={(e) => setTimeBased(e.target.checked)}
        />
        <CheckboxLabel htmlFor="updateTimeBased">
          Zaman bazlı tablolarda da güncelle
        </CheckboxLabel>
      </CheckboxContainer>
      <Button type="submit">{timeBased ? "➕ Artır" : "🔄 Güncelle"}</Button>
      {updateMsg && <Message error={updateErr}>{updateMsg}</Message>}
    </Form>
  );
}

export function ScoreDeleteForm({ onSuccess }) {
  const [deleteTable, setDeleteTable] = useState("");
  const [deleteUser, setDeleteUser] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");
  const [deleteErr, setDeleteErr] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    setDeleteMsg("");
    setDeleteErr(false);
    try {
      await axios.delete(`http://localhost:5020/scores/delete/${deleteTable}/${deleteUser}`);
      setDeleteMsg("Skor başarıyla silindi!");
      setDeleteErr(false);
      setDeleteTable("");
      setDeleteUser("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setDeleteMsg("Skor silinirken hata oluştu.");
      setDeleteErr(true);
    }
  };

  return (
    <Form onSubmit={handleDelete}>
      <h3>Skor Sil</h3>
      <Input
        type="text"
        placeholder="Tablo Adı (örn: game1)"
        value={deleteTable}
        onChange={(e) => setDeleteTable(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Kullanıcı Adı"
        value={deleteUser}
        onChange={(e) => setDeleteUser(e.target.value)}
        required
      />
      <Button type="submit">❌ Sil</Button>
      {deleteMsg && <Message error={deleteErr}>{deleteMsg}</Message>}
    </Form>
  );
} 