/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent } from '@mui/material';
import { finalDB, QuestionContext } from './QuestionContext';
import { css, Global } from '@emotion/react';

const LoanSummary = ({ participantId }) => {
  const [loanData, setLoanData] = useState(null);
  const [followUpData, setFollowUpData] = useState([]);
  const { questions } = useContext(QuestionContext);

  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        const result = await finalDB.find({
          selector: {
            caseID: participantId,
            formID: 'Registro'
          }
        });

        if (result.docs.length > 0) {
          const loanInfo = {};
          for (const doc of result.docs) {
            for (const response of doc.responses) {
              if (response.QuestionID === 'Q70') {
                loanInfo.date = response.Response;
              } else if (response.QuestionID === 'Q71') {
                loanInfo.loanAmount = parseFloat(response.Response.replace(/[^0-9.-]+/g, ""));
              } else if (response.QuestionID === 'Q72') {
                loanInfo.type = response.Response;
              }
            }
          }
          console.log('Loan Info:', loanInfo); // Verificar datos de préstamo
          setLoanData(loanInfo);
        }
      } catch (error) {
        console.error('Error fetching loan data:', error);
      }
    };

    const fetchFollowUpData = async () => {
      try {
        const result = await finalDB.find({
          selector: {
            caseID: participantId,
            formID: 'Seguimiento'
          },
          fields: ['responses'] // Asegurarse de que solo recuperamos los campos necesarios
        });

        console.log('Follow-Up Raw Data:', result.docs); // Verificar datos brutos de seguimiento

        const followUps = result.docs.flatMap(doc => {
          const dateResponse = doc.responses.find(response => response.QuestionID === 'Q73');
          const amountResponse = doc.responses.find(response => response.QuestionID === 'Q74');
          const date = dateResponse ? dateResponse.Response : null;
          const amount = amountResponse ? parseFloat(amountResponse.Response.replace(/[^0-9.-]+/g, "")) : null;
          if (date && amount !== null) {
            return [{ date, amount }];
          } else {
            console.log('Missing Q73 or Q74 in document:', doc); // Verificar documentos faltantes
            return [];
          }
        });

        console.log('Processed Follow-Up Data:', followUps); // Verificar datos procesados de seguimiento
        setFollowUpData(followUps);
      } catch (error) {
        console.error('Error fetching follow-up data:', error);
      }
    };

    if (participantId) {
      fetchLoanData();
      fetchFollowUpData();
    }
  }, [participantId]);

  const calculateBalance = (loanAmount, followUpData) => {
    const totalFollowUp = followUpData.reduce((acc, item) => acc + item.amount, 0);
    return loanAmount * 1.2 - totalFollowUp;
  };

  const calculatePayment = (loanAmount, type) => {
    if (type) {
      if (type.toLowerCase() === 'diario') {
        return (loanAmount * 1.2) / 60;
      } else if (type.toLowerCase() === 'semanal') {
        return ((loanAmount * 1.2) / 60) * 7;
      }
    }
    return 0;
  };

  if (!loanData) {
    return <div>Loading...</div>;
  }

  const balance = calculateBalance(loanData.loanAmount, followUpData);
  const payment = calculatePayment(loanData.loanAmount, loanData.type);

  return (
    <>
      <Global
        styles={css`
          .css-1ex1afd-MuiTableCell-root {
            padding: 0px !important;
          }
        `}
      />
      {/* El resto del contenido del componente */}
      <Box css={styles.container}>
        <Card css={styles.card}>
          <CardContent>
            <Typography variant="h6" css={styles.cardTitle}>Loan Summary</Typography>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>{loanData.date}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Prestamo</TableCell>
                  <TableCell>{`$ ${loanData.loanAmount.toFixed(2)}`}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>{loanData.type}</TableCell>
                </TableRow>
                {loanData.type && (
                  <TableRow>
                    <TableCell>{`Pago ${loanData.type.toLowerCase()}`}</TableCell>
                    <TableCell>{`$ ${payment.toFixed(2)}`}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell>Saldo</TableCell>
                  <TableCell>{`$ ${balance.toFixed(2)}`}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
  
        <Typography variant="h6" css={styles.sectionTitle}>Seguimiento</Typography>
        <Table css={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {followUpData.map((followUp, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{followUp.date}</TableCell>
                <TableCell>{`$ ${followUp.amount.toFixed(2)}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </>
  );
};

const styles = {
  container: css`
    padding: 0px;
  `,
  card: css`
    margin-bottom: 16px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  `,
  cardTitle: css`
    margin-bottom: 8px;
  `,
  sectionTitle: css`
    margin-top: 16px;
    margin-bottom: 8px;
  `,
  table: css`
    width: 100%;
    padding: 0px !important;
    border-collapse: collapse;
    & th, & td {
      padding: 0px !important;
      border: 1px solid #ddd;
    }
  `
};

export default LoanSummary;
