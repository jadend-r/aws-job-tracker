const { defaultHeaders } = require('./lib/response.js');

const { getJobs, getJobById, createJob, updateJob, deleteJob } = require('./routes/jobs.js');
//const { getStats } = require('./routes/stats');
//const { healthCheck } = require('./routes/health');

// Custom lambdalith router
exports.handler = async (event) => {
  const { httpMethod } = event;
  const path = event.pathParameters?.proxy ? `/${event.pathParameters.proxy}` : '/';


  // Options
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: '',
    };
  }

  // Static routes
  if (httpMethod === 'GET' && path === '/jobs') return getJobs(event);
  if (httpMethod === 'POST' && path === '/jobs') return createJob(event);
  //if (httpMethod === 'GET' && path === '/stats') return getStats(event);
  //if (httpMethod === 'GET' && path === '/health') return healthCheck(event);

  // Dynamic route: /jobs/{id}
  const jobIdMatch = path.match(/^\/jobs\/(\d+)$/);
  if (jobIdMatch) {
    const id = parseInt(jobIdMatch[1]);
    if (httpMethod === 'GET') return getJobById(event, id);
    if (httpMethod === 'PUT') return updateJob(event, id);
    if (httpMethod === 'DELETE') return deleteJob(event, id);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Route not found' }),
  };
};
