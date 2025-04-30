let fakeDB = [
    { id: 1, company: 'Amazon', role: 'SWE', status: 'Applied', dateApplied: '2025-04-01' },
  ];
  
  exports.getJobs = async () => ({
    statusCode: 200,
    body: JSON.stringify(fakeDB),
  });
  
  exports.getJobById = async (event, id) => {
    const app = fakeDB.find(a => a.id === id);
    return app
      ? { statusCode: 200, body: JSON.stringify(app) }
      : { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  };
  
  exports.createJob = async (event) => {
    const newApp = JSON.parse(event.body || '{}');
    newApp.id = fakeDB.length + 1;
    newApp.dateApplied = newApp.dateApplied || new Date().toISOString().split('T')[0];
    fakeDB.push(newApp);
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Application added', data: newApp }),
    };
  };
  
  exports.updateJob = async (event, id) => {
    const appIndex = fakeDB.findIndex(a => a.id === id);
    if (appIndex === -1) return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  
    const updates = JSON.parse(event.body || '{}');
    fakeDB[appIndex] = { ...fakeDB[appIndex], ...updates };
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Updated', data: fakeDB[appIndex] }),
    };
  };
  
  exports.deleteJob = async (event, id) => {
    const appIndex = fakeDB.findIndex(a => a.id === id);
    if (appIndex === -1) return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  
    const deleted = fakeDB.splice(appIndex, 1)[0];
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Deleted', data: deleted }),
    };
  };
  