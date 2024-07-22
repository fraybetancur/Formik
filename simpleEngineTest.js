const { Engine } = require('json-rules-engine');

const engine = new Engine();

engine.addRule({
  conditions: {
    all: [
      {
        fact: 'age',
        operator: 'greaterThan',
        value: 18
      }
    ]
  },
  event: {
    type: 'is-adult',
    params: {
      message: 'User is an adult'
    }
  }
});

const facts = { age: 20 };

engine
  .run(facts)
  .then(({ events }) => {
    events.map(event => console.log(event.params.message));
  })
  .catch(console.log);
