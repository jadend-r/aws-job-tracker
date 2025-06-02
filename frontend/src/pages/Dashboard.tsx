import { useEffect, useState } from "react";
import { getJobs, addJob, updateJobStatus } from "../api/jobs";
import type { Job } from "../types/job";
import AddJobModal from "../components/AddJobModal";
import { toast } from "react-toastify";

const statusColors: Record<Job['status'], string> = {
    Applied: 'bg-blue-100 text-blue-700',
    Interview: 'bg-yellow-100 text-yellow-700',
    Offer: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
};

const Dashboard = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isAddJobModalOpen, setIsAddJobModalOpen] = useState<boolean>(false);

    //const [isLoading, setIsLoading] = useState<boolean>(true);

    const total = jobs.length;
    const interviews = jobs.filter(j => j.status === 'Interview').length;
    const offers = jobs.filter(j => j.status === 'Offer').length;
    const rejected = jobs.filter(j => j.status === 'Rejected').length;

    useEffect(() => {
        getJobs()
            .then(setJobs)
            .finally(() => {/*setIsLoading(false)*/ });
    }, []);

    const handleAddJob = (job: Omit<Job, 'jobId'>, resumeFile?: File) => {
        addJob(job, resumeFile)
            .then((savedJob) => {
                toast.success(`Successfully added job: ${savedJob.company} - ${savedJob.position}`);
                setJobs([...jobs, savedJob]);
            })
            .catch(() => {
                toast.error("Failed to save job. Please try again");
            });
    };

    const handleStatusUpdate = (jobId: string, editedStatus: Job['status']) => {
        updateJobStatus(jobId, editedStatus)
            .then(() => {
                toast.success("Updated!");
                setJobs(
                    jobs.map(job =>
                        job.jobId === jobId ? { ...job, status: editedStatus } : job
                    )
                );
            })
            .catch(() => {
                toast.error("Failed to update job status. Please try again");
            });
    };


    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Job Tracker Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total" value={total} />
                <StatCard label="Interviews" value={interviews} />
                <StatCard label="Offers" value={offers} />
                <StatCard label="Rejected" value={rejected} />
            </div>

            {/* Add Job Button */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Applications</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow" onClick={() => { setIsAddJobModalOpen(true) }}>
                    + Add Job
                </button>
            </div>

            {/* Job Table */}
            <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left">Company</th>
                            <th className="py-3 px-4 text-left">Position</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left">Date Applied</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map((job, idx) => (
                            <tr key={idx} className="border-t">
                                <td className="py-3 px-4">{job.company}</td>
                                <td className="py-3 px-4">{job.position}</td>
                                <td className="py-3 px-4">
                                    <select
                                        className={`appearance-none px-3 py-1 rounded-full text-sm font-medium border ${statusColors[job.status]}`}
                                        value={job.status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value as Job['status'];
                                            if (newStatus !== job.status) {
                                                handleStatusUpdate(job.jobId, newStatus);
                                            }
                                        }}
                                    >
                                        {(Object.keys(statusColors) as Job['status'][]).map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                <td className="py-3 px-4">{job.dateApplied}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddJobModal
                isOpen={isAddJobModalOpen}
                onClose={() => setIsAddJobModalOpen(false)}
                onSubmit={handleAddJob}
            />

        </div>
    );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
    <div className="bg-white p-4 rounded-lg shadow text-center">
        <h3 className="text-sm text-gray-500">{label}</h3>
        <p className="text-2xl font-semibold">{value}</p>
    </div>
);

export default Dashboard;