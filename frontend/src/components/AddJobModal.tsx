import React, { useState } from 'react';
import type { Job } from '../types/job';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: Omit<Job, 'jobId'>, resumeFile?: File) => void;
};

const AddJobModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState<Omit<Job, 'jobId'>>({
    company: '',
    position: '',
    status: 'Applied',
    dateApplied: new Date().toLocaleDateString()
  });

  const [resumeFile, setResumeFile] = useState<File | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    } else {
      setResumeFile(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.position) return;
    onSubmit(form, resumeFile);
    onClose();
    setForm({ company: '', position: '', status: 'Applied', dateApplied: new Date().toLocaleDateString() });
    setResumeFile(undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Add Job</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Company"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
          <input
            name="position"
            value={form.position}
            onChange={handleChange}
            placeholder="Position"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
          <div>
            <label className="block mb-1 font-medium">Resume (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full"
            />
            {resumeFile && (
              <p className="text-sm text-gray-600 mt-1">Selected: {resumeFile.name}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobModal;
