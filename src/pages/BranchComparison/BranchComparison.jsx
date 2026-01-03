import React, { useState } from 'react';
import './BranchComparison.scss';

const iitOptions = [
  'IIT Bombay',
  'IIT Delhi',
  'IIT Kanpur',
  'IIT Kharagpur',
  'IIT Madras',
  'IIT Roorkee',
  'IIT Guwahati',
  'IIT Hyderabad',
  'IIT Indore',
  'IIT Varanasi',
  // Add more as needed
];

const branchOptions = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  // Add more as needed
];

const BranchComparison = () => {
  const [iit1, setIit1] = useState('');
  const [iit2, setIit2] = useState('');
  const [branch1, setBranch1] = useState('');
  const [branch2, setBranch2] = useState('');

  return (
    <div className="branch-comparison-bg">
      <div className="branch-comparison-container">
        <h2>Branch Comparison</h2>
        <div className="comparison-form">
          <div className="input-group">
            <label htmlFor="iit1">Select IIT 1</label>
            <select id="iit1" value={iit1} onChange={e => setIit1(e.target.value)}>
              <option value="">Choose IIT</option>
              {iitOptions.map(iit => (
                <option key={iit} value={iit}>{iit}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="branch1">Select Branch 1</label>
            <select id="branch1" value={branch1} onChange={e => setBranch1(e.target.value)}>
              <option value="">Choose Branch</option>
              {branchOptions.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="iit2">Select IIT 2</label>
            <select id="iit2" value={iit2} onChange={e => setIit2(e.target.value)}>
              <option value="">Choose IIT</option>
              {iitOptions.map(iit => (
                <option key={iit} value={iit}>{iit}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="branch2">Select Branch 2</label>
            <select id="branch2" value={branch2} onChange={e => setBranch2(e.target.value)}>
              <option value="">Choose Branch</option>
              {branchOptions.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="comparison-result">
          {/* Placeholder for comparison result */}
          <p>Comparison will be shown after selection.</p>
        </div>
      </div>
    </div>
  );
};

export default BranchComparison;
