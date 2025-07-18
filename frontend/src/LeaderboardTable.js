import React, { useEffect, useState } from "react";
import axios from "axios";
import styled, { useTheme } from "styled-components";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${({ theme }) => theme.card};
  box-shadow: 0 4px 24px ${({ theme }) => theme.primary}22;
  margin-bottom: 2rem;
  border-radius: 1.2rem;
  overflow: hidden;
  @media (max-width: 700px) {
    font-size: 0.92rem;
  }
`;

const Th = styled.th`
  padding: 1.1rem 1rem;
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.text};
  font-weight: bold;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  border-bottom: 2px solid ${({ theme }) => theme.accent};
  @media (max-width: 700px) {
    font-size: 0.98rem;
    padding: 0.7rem 0.5rem;
  }
`;

const Td = styled.td`
  padding: 1rem 1.1rem;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
  font-size: 1.05rem;
  background: ${({ theme }) => theme.card};
  transition: background 0.3s;
  @media (max-width: 700px) {
    font-size: 0.92rem;
    padding: 0.6rem 0.4rem;
  }
`;

const Tr = styled.tr`
  &:hover td {
    background: ${({ theme }) => theme.accent}33;
    transition: background 0.3s;
  }
`;

const Error = styled.div`
  color: #e63946;
  margin: 1rem 0;
  font-weight: 600;
`;

const ChartContainer = styled.div`
  width: 100%;
  max-width: 600px;
  height: 320px;
  margin: 0 auto 2rem auto;
  background: ${({ theme }) => theme.card};
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px ${({ theme }) => theme.primary}22;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.4s;
  @media (max-width: 900px) {
    max-width: 98vw;
    height: 220px;
  }
`;

export default function LeaderboardTable({ tableName = "game1", username = "", onlyChart = false, onlyTable = false, timePeriod = "all", level = "" }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();
  const isDark = theme.name === 'dark';

  useEffect(() => {
    setLoading(true);
    setError("");
    
    const fetchData = async () => {
      try {
        let url;
        if (level && !isNaN(Number(level))) {
          url = `http://localhost:5020/leaderboard/level/${tableName}/${level}`;
        } else if (username) {
          if (timePeriod === "all") {
            url = `http://localhost:5020/leaderboard/user/${tableName}/${username}`;
          } else {
            url = `http://localhost:5020/leaderboard/${timePeriod}/user/${tableName}/${username}`;
          }
        } else {
          if (timePeriod === "all") {
            url = `http://localhost:5020/leaderboard/top/${tableName}/10`;
          } else {
            url = `http://localhost:5020/leaderboard/${timePeriod}/${tableName}/10`;
          }
        }
        
        const res = await axios.get(url);
        setScores(Array.isArray(res.data) ? res.data : [res.data]);
        setLoading(false);
      } catch (error) {
        if (username) {
          setScores([]);
          setError("Kullanıcı bulunamadı.");
        } else {
          setError("Skorlar alınamadı.");
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, username, timePeriod, level]);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <Error>{error}</Error>;
  if (!scores.length) return <div>Skor bulunamadı.</div>;

  // Grafik için veriyi hazırla
  const chartData = scores.map((item, idx) => ({
    name: item.Username || item.username,
    score: item.Score || item.score,
    rank: item.Rank || idx + 1
  }));

  // Zaman periyodu/seviye başlığını hazırla
  const getTitle = () => {
    if (level && !isNaN(Number(level))) {
      return `Seviye ${level} Kullanıcıları (Skor: ${(level-1)*5000} - ${level*5000-1})`;
    }
    switch (timePeriod) {
      case "daily": return "Günlük Liderlik Tablosu";
      case "weekly": return "Haftalık Liderlik Tablosu";
      case "monthly": return "Aylık Liderlik Tablosu";
      default: return "Tüm Zamanlar Liderlik Tablosu";
    }
  };

  return (
    <>
      {!onlyTable && (
        <ChartContainer>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '1rem', 
            fontSize: '1.2rem', 
            fontWeight: '600',
            color: theme.text 
          }}>
            {getTitle()}
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#fffefa' : '#a3c4f3'} />
              <XAxis
                type="number"
                dataKey="score"
                stroke={theme.text}
                tick={{ fill: theme.text, fontWeight: 600 }}
                axisLine={{ stroke: isDark ? theme.accent : theme.primary }}
                tickLine={{ stroke: isDark ? theme.accent : theme.primary }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke={theme.text}
                tick={{ fill: theme.text, fontWeight: 600 }}
                width={100}
                axisLine={{ stroke: isDark ? theme.accent : theme.primary }}
                tickLine={{ stroke: isDark ? theme.accent : theme.primary }}
              />
              <Tooltip
                formatter={(value) => [value, "Skor"]}
                contentStyle={{ background: theme.card, color: theme.text, border: `1.5px solid ${theme.accent}` }}
                itemStyle={{ color: theme.text, fontWeight: 600 }}
                labelStyle={{ color: theme.text, fontWeight: 700 }}
                cursor={{ fill: isDark ? '#b8f2e622' : '#a3c4f322' }}
              />
              <Bar
                dataKey="score"
                fill={isDark ? '#b8f2e6' : theme.primary}
                radius={[0, 10, 10, 0]}
                minPointSize={5}
                isAnimationActive={true}
              >
                <LabelList
                  dataKey="score"
                  position="right"
                  style={{
                    fill: isDark ? '#fff' : theme.text,
                    fontWeight: 700,
                    fontSize: 15,
                    textShadow: isDark ? '0 1px 4px #0008' : '0 1px 4px #fff8'
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
      {!onlyChart && (
        <Table>
          <thead>
            <Tr>
              <Th colSpan="5" style={{ textAlign: 'center', fontSize: '1.3rem' }}>
                {getTitle()} Liderlik Tablosu
              </Th>
            </Tr>
            <Tr>
              <Th>Sıra</Th>
              <Th>Kullanıcı</Th>
              <Th>Skor</Th>
            </Tr>
          </thead>
          <tbody>
            {scores.map((item, idx) => (
              <Tr key={item.Username || item.username}>
                <Td>{item.Rank || idx + 1}</Td>
                <Td>{item.Username || item.username}</Td>
                <Td>{item.Score || item.score}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
} 