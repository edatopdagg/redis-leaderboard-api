import React, { useState, useEffect } from "react";
import styled, { ThemeProvider as StyledThemeProvider, createGlobalStyle } from "styled-components";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { motion } from "framer-motion";
import LeaderboardTable from "./LeaderboardTable";
import ScoreForm from "./ScoreForm";
import { ScoreUpdateForm, ScoreDeleteForm } from "./ScoreActions";
import TableSelector from "./TableSelector";
import axios from "axios";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  html, body, #root {
    min-height: 100vh;
    font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    transition: background 0.5s cubic-bezier(.77,0,.18,1), color 0.3s;
    scroll-behavior: smooth;
  }
  body::before {
    content: '🏆     ⭐';
    position: fixed;
    left: 10vw;
    top: 20vh;
    font-size: 16vw;
    opacity: 0.06;
    pointer-events: none;
    z-index: 0;
    user-select: none;
    white-space: pre;
  }
  ::selection {
    background: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.text};
  }
  body {
    margin: 0;
    padding: 0;
  }
`;

const Outer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 0 4rem 0;
  background: none;
  @media (max-width: 900px) {
    padding: 1.2rem 0 2.5rem 0;
  }
`;

const Main = styled.div`
  width: 100%;
  max-width: 950px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.8rem;
  @media (max-width: 1100px) {
    max-width: 98vw;
    padding: 0 1vw;
  }
  @media (max-width: 600px) {
    gap: 1.2rem;
    padding: 0 0.5rem;
  }
`;

const HeaderRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2.2rem;
  @media (max-width: 900px) {
    margin-bottom: 1.2rem;
  }
`;

const Title = styled.h1`
  width: 100%;
  font-size: 2.8rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-align: center;
  color: ${({ theme }) => theme.text};
  text-shadow: 0 4px 24px ${({ theme }) => theme.primary}33, 0 1.5px 0 #fff8;
  margin: 0 auto 1.5rem auto;
  @media (max-width: 900px) {
    font-size: 2rem;
  }
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const TimePeriodSelector = styled.select`
  background: ${({ theme }) => theme.button};
  color: ${({ theme }) => theme.buttonText};
  border: none;
  border-radius: 0.8rem;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px ${({ theme }) => theme.primary}22;
  transition: background 0.3s, color 0.3s, box-shadow 0.3s;
  &:hover {
    background: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.text};
    box-shadow: 0 4px 16px ${({ theme }) => theme.accent}44;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.accent};
  }
`;

const SmallButton = styled(motion.button)`
  background: ${({ theme }) => theme.button};
  color: ${({ theme }) => theme.buttonText};
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px ${({ theme }) => theme.primary}22;
  transition: background 0.3s, color 0.3s, box-shadow 0.3s;
  &:hover {
    background: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.text};
    box-shadow: 0 4px 16px ${({ theme }) => theme.accent}44;
  }
  &:active {
    transform: scale(0.97);
  }
`;

const ThreeBoxRow = styled.div`
  width: 100%;
  display: flex;
  gap: 1.5rem;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.2rem;
  }
`;

const SmallCard = styled.div`
  flex: 1;
  min-width: 220px;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BottomRow = styled.div`
  width: 100%;
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  align-items: flex-start;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 1.2rem;
  }
`;

const LargeCard = styled.div`
  flex: 2;
  min-width: 320px;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function ThemedApp() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [refresh, setRefresh] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableNames, setTableNames] = useState([]);
  const [timePeriod, setTimePeriod] = useState("all");
  const [level, setLevel] = useState("");

  
  const fetchTables = () => {
    axios.get("http://localhost:5020/leaderboard/tables")
      .then(res => {
        setTableNames(res.data);
        
        if (selectedTable && !res.data.includes(selectedTable)) {
          setSelectedTable(res.data[0] || "");
        }
      })
      .catch(() => {
        setTableNames([]);
        setSelectedTable("");
      });
  };

  useEffect(() => {
    fetchTables();
  }, []);

  
  const handleRefresh = () => {
    setRefresh(r => !r);
    fetchTables();
  };

  const handleAdminStats = async () => {
    try {
      const res = await fetch("http://localhost:5020/leaderboard/admin-stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error("Yetkiniz yok veya hata oluştu.");
      const data = await res.json();
      alert(`Tablo Sayısı: ${data.TableCount}\nToplam Kullanıcı: ${data.TotalUserCount}\nTablolar: ${data.Tables.join(", ")}`);
    } catch (e) {
      alert("Admin paneline erişim başarısız: " + e.message);
    }
  };

    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      <Outer>
        <Main>
          <HeaderRow>
            <Title>🏆 Liderlik Tablosu 🏆</Title>
            <TopRight>
              {/* Kullanıcı, rol, çıkış ve admin paneli ile ilgili butonlar tamamen kaldırıldı */}
              <TableSelector tableNames={tableNames} value={selectedTable} onChange={setSelectedTable} />
              <TimePeriodSelector 
                value={timePeriod} 
                onChange={(e) => setTimePeriod(e.target.value)}
              >
                <option value="all">Tüm Zamanlar</option>
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </TimePeriodSelector>
              <input
                type="number"
                min="1"
                placeholder="Seviye"
                value={level}
                onChange={e => setLevel(e.target.value.replace(/[^0-9]/g, ''))}
                style={{
                  width: 80,
                  borderRadius: '0.8rem',
                  border: '1px solid #ccc',
                  padding: '0.6rem 0.7rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  marginLeft: 8
                }}
              />
              <SmallButton
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                aria-label="Tema Değiştir"
              >
                {isDark ? "☀️" : "🌙"}
              </SmallButton>
            </TopRight>
          </HeaderRow>
          <ThreeBoxRow>
            <SmallCard>
              <ScoreForm onSuccess={handleRefresh} tableName={selectedTable} />
            </SmallCard>
            <SmallCard>
              <ScoreUpdateForm onSuccess={handleRefresh} />
            </SmallCard>
            <SmallCard>
              <ScoreDeleteForm onSuccess={handleRefresh} />
            </SmallCard>
          </ThreeBoxRow>
          
          {selectedTable ? (
            <BottomRow>
              <LargeCard>
                <h2>📊 Grafik</h2>
                <LeaderboardTable 
                  tableName={selectedTable} 
                  timePeriod={timePeriod}
                  level={level}
                  key={refresh + selectedTable + timePeriod + level + 'chart'} 
                  onlyChart 
                />
              </LargeCard>
              <LargeCard>
                <h2>📋 Tablo</h2>
                <LeaderboardTable 
                  tableName={selectedTable} 
                  timePeriod={timePeriod}
                  level={level}
                  key={refresh + selectedTable + timePeriod + level + 'table'} 
                  onlyTable 
                />
              </LargeCard>
            </BottomRow>
          ) : (
            <div style={{textAlign: 'center', margin: '2rem', fontWeight: 600, fontSize: '1.2rem'}}>
              Lütfen bir tablo seçin.
            </div>
          )}
        </Main>
      </Outer>
    </StyledThemeProvider>
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
