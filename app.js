let invoices = JSON.parse(
  localStorage.getItem("invoiceManagerInvoices")
) || [];


// ------------------------------
// INITIALIZE
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {

  renderInvoices();
  updateDashboard();

  const form = document.getElementById("invoiceFormElement");

  form.addEventListener("submit", createInvoice);

  document
    .getElementById("filterStatus")
    .addEventListener("change", renderInvoices);

  document
    .getElementById("searchInput")
    .addEventListener("input", renderInvoices);

  document
    .getElementById("signature")
    .addEventListener("input", updateSignaturePreview);

  closeInvoiceForm();

});


// ------------------------------
// OPEN FORM
// ------------------------------

function openInvoiceForm() {

  document.getElementById("invoiceForm").style.display = "block";

  document
    .getElementById("invoiceForm")
    .scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

}


// ------------------------------
// CLOSE FORM
// ------------------------------

function closeInvoiceForm() {

  document.getElementById("invoiceForm").style.display = "none";

}


// ------------------------------
// CREATE INVOICE
// ------------------------------

function createInvoice(event) {

  event.preventDefault();

  const customerName =
    document.getElementById("customerName").value.trim();

  const customerEmail =
    document.getElementById("customerEmail").value.trim();

  const customerPhone =
    document.getElementById("customerPhone").value.trim();

  const invoiceNumber =
    document.getElementById("invoiceNumber").value.trim();

  const amount =
    parseFloat(
      document.getElementById("invoiceAmount").value
    );

  const dueDate =
    document.getElementById("dueDate").value;

  const status =
    document.getElementById("invoiceStatus").value;

  const signature =
    document.getElementById("signature").value.trim();


  if (!customerName ||
      !customerEmail ||
      !customerPhone ||
      !invoiceNumber ||
      !amount ||
      !dueDate ||
      !signature) {

    alert("Please complete all required fields.");

    return;
  }


  const invoice = {

    id: Date.now(),

    customerName,

    customerEmail,

    customerPhone,

    invoiceNumber,

    amount,

    dueDate,

    status,

    signature,

    createdAt: new Date().toISOString()

  };


  invoices.unshift(invoice);

  saveInvoices();

  renderInvoices();

  updateDashboard();


  document
    .getElementById("invoiceFormElement")
    .reset();


  updateSignaturePreview();


  closeInvoiceForm();


  alert("Invoice created successfully!");

}


// ------------------------------
// SAVE
// ------------------------------

function saveInvoices() {

  localStorage.setItem(
    "invoiceManagerInvoices",
    JSON.stringify(invoices)
  );

}


// ------------------------------
// RENDER
// ------------------------------

function renderInvoices() {

  const tbody =
    document.getElementById("invoiceTableBody");

  const emptyState =
    document.getElementById("emptyState");

  const filter =
    document.getElementById("filterStatus").value;

  const search =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase()
      .trim();


  let filteredInvoices = invoices.filter(invoice => {

    const matchesStatus =
      filter === "All" ||
      invoice.status === filter;

    const matchesSearch =
      invoice.customerName
        .toLowerCase()
        .includes(search) ||

      invoice.invoiceNumber
        .toLowerCase()
        .includes(search) ||

      invoice.customerEmail
        .toLowerCase()
        .includes(search);


    return matchesStatus && matchesSearch;

  });


  tbody.innerHTML = "";


  if (filteredInvoices.length === 0) {

    emptyState.style.display = "block";

    return;

  }


  emptyState.style.display = "none";


  filteredInvoices.forEach(invoice => {

    const row =
      document.createElement("tr");


    const statusClass =
      invoice.status === "Paid"
        ? "status-paid"
        : "status-pending";


    row.innerHTML = `

      <td>
        <strong>${escapeHTML(invoice.invoiceNumber)}</strong>
      </td>

      <td>
        ${escapeHTML(invoice.customerName)}
      </td>

      <td>
        ${escapeHTML(invoice.customerPhone)}
      </td>

      <td>
        $${Number(invoice.amount).toFixed(2)}
      </td>

      <td>
        ${formatDate(invoice.dueDate)}
      </td>

      <td>
        <span class="status ${statusClass}">
          ${escapeHTML(invoice.status)}
        </span>
      </td>

      <td>

        <div class="action-buttons">

          <button
            class="action-btn print-btn"
            onclick="printInvoice(${invoice.id})"
          >
            Print
          </button>

          <button
            class="action-btn delete-btn"
            onclick="deleteInvoice(${invoice.id})"
          >
            Delete
          </button>

        </div>

      </td>

    `;


    tbody.appendChild(row);

  });

}


// ------------------------------
// DASHBOARD
// ------------------------------

function updateDashboard() {

  const total =
    invoices.length;


  const paid =
    invoices.filter(
      invoice => invoice.status === "Paid"
    ).length;


  const pending =
    invoices.filter(
      invoice => invoice.status === "Pending"
    ).length;


  const revenue =
    invoices
      .filter(
        invoice => invoice.status === "Paid"
      )
      .reduce(
        (sum, invoice) =>
          sum + Number(invoice.amount),
        0
      );


  document.getElementById(
    "totalInvoices"
  ).textContent = total;


  document.getElementById(
    "paidInvoices"
  ).textContent = paid;


  document.getElementById(
    "pendingInvoices"
  ).textContent = pending;


  document.getElementById(
    "totalRevenue"
  ).textContent =
    "$" + revenue.toFixed(2);

}


// ------------------------------
// DELETE
// ------------------------------

function deleteInvoice(id) {

  const invoice =
    invoices.find(
      item => item.id === id
    );


  if (!invoice) return;


  const confirmed =
    confirm(
      `Delete invoice ${invoice.invoiceNumber}?`
    );


  if (!confirmed) return;


  invoices =
    invoices.filter(
      item => item.id !== id
    );


  saveInvoices();

  renderInvoices();

  updateDashboard();

}


// ------------------------------
// PRINT
// ------------------------------

function printInvoice(id) {

  const invoice =
    invoices.find(
      item => item.id === id
    );


  if (!invoice) return;


  const printArea =
    document.getElementById("printInvoice");


  printArea.innerHTML = `

    <div class="print-header">

      <div>

        <div class="print-title">
          Invoice
        </div>

        <p>
          Open Source Invoice Manager
        </p>

      </div>

      <div>

        <strong>
          ${escapeHTML(invoice.invoiceNumber)}
        </strong>

        <br>

        Due:
        ${formatDate(invoice.dueDate)}

      </div>

    </div>


    <div class="print-section">

      <h3>Bill To</h3>

      <p>
        <strong>
          ${escapeHTML(invoice.customerName)}
        </strong>
      </p>

      <p>
        ${escapeHTML(invoice.customerEmail)}
      </p>

      <p>
        ${escapeHTML(invoice.customerPhone)}
      </p>

    </div>


    <div class="print-section">

      <table class="print-table">

        <thead>

          <tr>
            <th>Description</th>
            <th>Amount</th>
          </tr>

        </thead>

        <tbody>

          <tr>

            <td>
              Invoice Services
            </td>

            <td>
              $${Number(invoice.amount).toFixed(2)}
            </td>

          </tr>

        </tbody>

      </table>


      <div class="print-total">

        Total:
        $${Number(invoice.amount).toFixed(2)}

      </div>

    </div>


    <div class="print-section">

      <p>
        Status:
        <strong>
          ${escapeHTML(invoice.status)}
        </strong>
      </p>

    </div>


    <div class="print-signature">

      ${escapeHTML(invoice.signature)}

      <br>

      Authorized Signature

    </div>

  `;


  window.print();

}


// ------------------------------
// SIGNATURE PREVIEW
// ------------------------------

function updateSignaturePreview() {

  const value =
    document.getElementById(
      "signature"
    ).value.trim();


  document.getElementById(
    "signaturePreview"
  ).textContent =
    value || "Authorized Signature";

}


// ------------------------------
// DATE FORMAT
// ------------------------------

function formatDate(dateString) {

  if (!dateString) return "-";


  const date =
    new Date(dateString + "T00:00:00");


  return date.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );

}


// ------------------------------
// SECURITY
// ------------------------------

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
