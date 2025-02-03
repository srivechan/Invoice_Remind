const axios = require('axios');
const Invoice = require('./invoice.model');

const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/21546403/2fpawkn/";

// Get all invoices
exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Add a new invoice and notify Zapier
exports.addInvoice = async (req, res) => {
    try {
        const { recipient, amount, dueDate } = req.body;
        const newInvoice = new Invoice({ recipient, amount, dueDate });
        await newInvoice.save();

        await axios.post(ZAPIER_WEBHOOK_URL, {
            event: "invoice_created",
            invoice: newInvoice
        });

        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(400).json({ error: 'Error adding invoice' });
    }
};

// Delete an invoice and notify Zapier
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        await Invoice.findByIdAndDelete(req.params.id);

        await axios.post(ZAPIER_WEBHOOK_URL, {
            event: "invoice_deleted",
            invoiceId: req.params.id
        });

        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting invoice' });
    }
};

// Manually trigger an invoice reminder via Zapier
exports.triggerInvoiceReminder = async (req, res) => {
    try {
        const { invoiceId } = req.body;
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        await axios.post(ZAPIER_WEBHOOK_URL, {
            event: "invoice_reminder",
            invoice: invoice
        });

        res.json({ success: true, message: "Reminder sent via Zapier" });
    } catch (error) {
        res.status(500).json({ error: 'Error triggering Zapier' });
    }
};
