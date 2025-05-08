const { defaultHeaders } = require('./lib/response.js');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus
} = require('./services/jobs.js');

exports.handler = async (event) => {
  const { httpMethod, resource, pathParameters } = event;

  // --------------
  // /api/job RESOURCES

  // GET /api/jobs
  if (resource === '/api/jobs' && httpMethod === 'GET') {
    return getJobs(event);
  }

  // POST /api/jobs
  if (resource === '/api/jobs' && httpMethod === 'POST') {
    return createJob(event);
  }

  // GET /api/jobs/{id}
  if (resource === '/api/jobs/{id}' && httpMethod === 'GET') {
    return getJobById(event, parseInt(pathParameters.id));
  }

  // PUT /api/jobs/{id}
  if (resource === '/api/jobs/{id}' && httpMethod === 'PUT') {
    return updateJob(event, parseInt(pathParameters.id));
  }

  // DELETE /api/jobs/{id}
  if (resource === '/api/jobs/{id}' && httpMethod === 'DELETE') {
    return deleteJob(event, parseInt(pathParameters.id));
  }

  // PATCH /api/jobs/{id}/status
  if (resource === '/api/jobs/{id}/status' && httpMethod === 'PATCH') {
    return updateJobStatus(event, parseInt(pathParameters.id));
  }

  // ------------

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Route not found' }),
  };
};
