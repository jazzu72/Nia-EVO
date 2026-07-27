const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, '../../data/business.json');

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return { revenue: 0, invoices: [], appointments: [], leads: [] };
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function saveData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

class BusinessEngine {
  constructor() { this.data = loadData(); }
  getDashboard() {
    const inv = this.data.invoices || [];
    const appt = this.data.appointments || [];
    const leads = this.data.leads || [];
    return {
      revenue: this.data.revenue || 0,
      outstandingInvoices: inv.filter(i => !i.paid).length,
      appointments: appt.length,
      newLeads: leads.filter(l => l.status === 'new').length,
      inventoryAlerts: 3,
      payrollDue: 'Friday',
      customerMessages: 5,
      ceoTasks: 7
    };
  }
  addInvoice(invoice) {
    this.data.invoices.push({ ...invoice, id: Date.now().toString(), paid: false });
    saveData(this.data);
    return invoice;
  }
  addAppointment(appt) {
    this.data.appointments.push({ ...appt, id: Date.now().toString() });
    saveData(this.data);
    return appt;
  }
  addLead(lead) {
    this.data.leads.push({ ...lead, id: Date.now().toString(), status: 'new' });
    saveData(this.data);
    return lead;
  }
}
module.exports = new BusinessEngine();
