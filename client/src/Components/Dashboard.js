import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './dashboard.css';

const API_BASE_URL = 'http://localhost:6005/api/invoices';

const Dashboard = () => {
  // State for storing invoices
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    dueDate: '',
  });

  // State for popup message
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Fetch invoices from backend API
  const fetchInvoices = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (Add a new invoice)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_BASE_URL, formData);
      setInvoices([...invoices, response.data]);
      setFormData({ recipient: '', amount: '', dueDate: '' });
    } catch (error) {
      console.error('Error adding invoice:', error);
    }
  };

  // Handle invoice deletion
  const handleDelete = async (invoiceId) => {
    try {
      await axios.delete(`${API_BASE_URL}/${invoiceId}`);
      setInvoices(invoices.filter(invoice => invoice._id !== invoiceId));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  // Show Popup Notification
  const showReminderPopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // Auto-hide after 3 seconds
  };

  // Trigger Invoice Reminder via Zapier
  const sendReminder = async (invoiceId) => {
    try {
      await axios.post(`${API_BASE_URL}/trigger-reminder`, { invoiceId });
      showReminderPopup('Invoice reminder sent successfully!'); // Show popup instead of alert
    } catch (error) {
      console.error('Error sending reminder:', error);
      showReminderPopup('Failed to send invoice reminder.');
    }
  };

  return (
    <>
      <div className="dashboard-container">
        <h2 className="dashboard-title">Invoice Dashboard</h2>

        <div className="form-container">
          <h3>Add New Invoice</h3>
          <form onSubmit={handleSubmit} className="invoice-form">
            <input
              type="text"
              name="recipient"
              placeholder="Recipient Email"
              value={formData.recipient}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount ($)"
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
            <button type="submit" className="submit-button">
              Add Invoice
            </button>
          </form>
        </div>
        {/* Popup Notification */}
        {showPopup && (
          <div className="popup-container">
            <div className="popup-message">{popupMessage}</div>
          </div>
        )}
        <div className="table-container">
          <h3>Invoices</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>{invoice._id}</td>
                    <td>{invoice.recipient}</td>
                    <td>${invoice.amount}</td>
                    <td>{invoice.dueDate}</td>
                    <td>
                      <button
                        className="action-button reminder"
                        onClick={() => sendReminder(invoice._id)}
                      >
                        Send Reminder
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleDelete(invoice._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-invoices">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


      </div>
    </>
  );
};

export default Dashboard;
