const Cloudant = require('@cloudant/cloudant');
const fs = require('fs');
const XLSX = require('xlsx');
require('dotenv').config();

const cloudant = new Cloudant({
  url: process.env.CLOUDANT_URL,
  account: process.env.CLOUDANT_ACCOUNT,
  password: process.env.CLOUDANT_PASSWORD
});

const dbNameSurvey = 'survey';
const dbNameChoices = 'choices';

async function createDB(dbName) {
  try {
    await cloudant.db.create(dbName);
    console.log(`${dbName} database created.`);
  } catch (err) {
    if (err.error === 'file_exists') {
      console.log(`${dbName} database already exists.`);
    } else {
      console.error(`Error creating ${dbName} database:`, err);
    }
  }
}

async function insertData(dbName, data) {
  try {
    const db = cloudant.db.use(dbName);
    await db.bulk({ docs: data });
    console.log(`Data inserted into ${dbName} database.`);
  } catch (err) {
    console.error(`Error inserting data into ${dbName} database:`, err);
  }
}

function readExcel(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`File ${filePath} found.`);
    } else {
      console.log(`File ${filePath} not found.`);
      return null;
    }

    const workbook = XLSX.readFile(filePath);
    const surveySheet = workbook.Sheets['Survey'];
    const surveyData = XLSX.utils.sheet_to_json(surveySheet);
    const choicesSheet = workbook.Sheets['Choices'];
    const choicesData = XLSX.utils.sheet_to_json(choicesSheet);
    return { surveyData, choicesData };
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return null;
  }
}

async function main() {
  await createDB(dbNameSurvey);
  await createDB(dbNameChoices);

  const filePath = './survey_data.xlsx'; // Cambia esto a la ruta de tu archivo Excel
  const excelData = readExcel(filePath);

  if (!excelData) {
    console.error('Failed to read Excel file.');
    return;
  }

  const { surveyData, choicesData } = excelData;

  await insertData(dbNameSurvey, surveyData);
  await insertData(dbNameChoices, choicesData);
}

main().catch(err => {
  console.error('Error in main function:', err);
});
