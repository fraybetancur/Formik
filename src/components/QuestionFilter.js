import FlexSearch from 'flexsearch';

const index = new FlexSearch.Index({
  encode: "balance",
  tokenize: "forward",
  threshold: 0,
  depth: 3,
  doc: {
    id: "_id",
    field: ["CaseID", "QuestionID", "Response"]
  }
});

const indexQuestions = (questions) => {
  questions.forEach(q => {
    index.add(q);
  });
};

const parseDependency = (dependency) => {
  let operator;
  let value;
  let fact;

  if (dependency.includes('=')) {
    [fact, value] = dependency.split('=').map(s => s.trim().replace(/"/g, ''));
    operator = '==';
  } else if (dependency.includes('<>')) {
    [fact, value] = dependency.split('<>').map(s => s.trim().replace(/"/g, ''));
    operator = '!=';
  } else if (dependency.includes('>=')) {
    [fact, value] = dependency.split('>=').map(s => s.trim());
    operator = '>=';
  } else if (dependency.includes('<=')) {
    [fact, value] = dependency.split('<=').map(s => s.trim());
    operator = '<=';
  } else if (dependency.includes('>')) {
    [fact, value] = dependency.split('>').map(s => s.trim());
    operator = '>';
  } else if (dependency.includes('<')) {
    [fact, value] = dependency.split('<').map(s => s.trim());
    operator = '<';
  }

  return { fact, operator, value };
};

const evaluateDependency = (factValue, operator, value) => {
  switch (operator) {
    case '==':
      return factValue === value;
    case '!=':
      return factValue !== value;
    case '>':
      return factValue > value;
    case '>=':
      return factValue >= value;
    case '<':
      return factValue < value;
    case '<=':
      return factValue <= value;
    default:
      return false;
  }
};

const fetchFilteredQuestions = (questions, filters, caseID, responseDict) => {
  indexQuestions(questions);

  const query = filters.query || "";
  const results = index.search(query, { enrich: true });
  const resultDocs = results.flatMap(result => result.result);

  const newFilteredQuestions = [];

  for (const q of resultDocs) {
    if (filters.organization && q.Organization !== filters.organization) continue;
    if (filters.program && q.Program !== filters.program) continue;
    if (filters.formId && q.FormID !== filters.formId) continue;
    if (filters.location && q.Location !== filters.location) continue;
    if (filters.interviewer && q.Interviewer !== filters.interviewer) continue;

    let includeQuestion = true;
    if (q.ResponseDependencies) {
      const dependencies = q.ResponseDependencies.split(',').map(dep => dep.trim());
      for (let dep of dependencies) {
        const { fact, operator, value } = parseDependency(dep);
        const factValue = responseDict[fact];
        if (!evaluateDependency(factValue, operator, value)) {
          includeQuestion = false;
          break;
        }
      }
    }

    if (includeQuestion) newFilteredQuestions.push(q);
  }

  return newFilteredQuestions;
};

export default fetchFilteredQuestions;
