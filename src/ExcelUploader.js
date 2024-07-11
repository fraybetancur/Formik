import React, { useState } from 'react';
import PouchDB from 'pouchdb-browser';
import * as XLSX from 'xlsx';
import pouchdbAdapterHttp from 'pouchdb-adapter-http';

PouchDB.plugin(pouchdbAdapterHttp);

const ExcelUploader = () => {
  const [log, setLog] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const surveySheet = workbook.Sheets['Survey'];
      const surveyData = XLSX.utils.sheet_to_json(surveySheet);

      const choicesSheet = workbook.Sheets['Choices'];
      const choicesData = XLSX.utils.sheet_to_json(choicesSheet);

      const surveyDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/survey`, {
        adapter: 'http',
        auth: {
          username: process.env.REACT_APP_CLOUDANT_APIKEY_SURVEY,
          password: process.env.REACT_APP_CLOUDANT_PASSWORD_SURVEY,
        },
      });

      const choicesDB = new PouchDB(`${process.env.REACT_APP_CLOUDANT_URL}/choices`, {
        adapter: 'http',
        auth: {
          username: process.env.REACT_APP_CLOUDANT_APIKEY_CHOICES,
          password: process.env.REACT_APP_CLOUDANT_PASSWORD_CHOICES,
        },
      });

      const logMessages = [];

      for (const row of surveyData) {
        try {
          await surveyDB.put({
            _id: row.QuestionID,
            ...row
          });
          logMessages.push(`Inserted survey: ${row.QuestionID}`);
        } catch (error) {
          logMessages.push(`Error inserting survey: ${row.QuestionID}`);
        }
      }

      for (const row of choicesData) {
        try {
          await choicesDB.put({
            _id: `${row.QuestionID}-${row.OptionID}`,
            ...row
          });
          logMessages.push(`Inserted choice: ${row.QuestionID}-${row.OptionID}`);
        } catch (error) {
          logMessages.push(`Error inserting choice: ${row.QuestionID}-${row.OptionID}`);
        }
      }

      setLog(logMessages);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <div>
        {log.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    </div>
  );
};

export default ExcelUploader;
