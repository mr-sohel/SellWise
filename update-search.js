const fs = require('fs');

const path = 'C:/Users/mrsoh/SDP/SellWise.Web/Views/Shared/_Layout.cshtml';
let html = fs.readFileSync(path, 'utf8');

const icons = {
    product: `<svg class="me-2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    order: `<svg class="me-2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
    customer: `<svg class="me-2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
};

const newJS = `                            if (data.products && data.products.length) {
                                html += '<li><h6 class="dropdown-header px-3 mt-1 mb-1 text-primary"><small class="fw-bold">PRODUCTS</small></h6></li>';
                                data.products.forEach(p => {
                                    html += \`<li><a class="dropdown-item py-2 px-3" href="\${p.url}">
                                        <div class="d-flex justify-content-between align-items-center w-100">
                                            <div class="d-flex align-items-center">
                                                ${icons.product}
                                                <span class="fw-semibold text-dark">\${p.name}</span>
                                            </div>
                                            <span class="badge bg-light text-muted border">\${p.detail}</span>
                                        </div></a></li>\`;
                                });
                            }

                            if (data.orders && data.orders.length) {
                                if (html) html += '<li><hr class="dropdown-divider my-1"></li>';
                                html += '<li><h6 class="dropdown-header px-3 mt-1 mb-1 text-primary"><small class="fw-bold">ORDERS</small></h6></li>';
                                data.orders.forEach(o => {
                                    html += \`<li><a class="dropdown-item py-2 px-3" href="\${o.url}">
                                        <div class="d-flex justify-content-between align-items-center w-100">
                                            <div class="d-flex align-items-center">
                                                ${icons.order}
                                                <span class="fw-semibold text-dark">\${p.name || o.name}</span>
                                            </div>
                                            <span class="badge bg-light text-muted border">\${o.detail}</span>
                                        </div></a></li>\`;
                                });
                            }

                            if (data.customers && data.customers.length) {
                                if (html) html += '<li><hr class="dropdown-divider my-1"></li>';
                                html += '<li><h6 class="dropdown-header px-3 mt-1 mb-1 text-primary"><small class="fw-bold">CUSTOMERS</small></h6></li>';
                                data.customers.forEach(c => {
                                    html += \`<li><a class="dropdown-item py-2 px-3" href="\${c.url}">
                                        <div class="d-flex justify-content-between align-items-center w-100">
                                            <div class="d-flex align-items-center">
                                                ${icons.customer}
                                                <span class="fw-semibold text-dark">\${c.name}</span>
                                            </div>
                                            <span class="badge bg-light text-muted border">\${c.detail}</span>
                                        </div></a></li>\`;
                                });
                            }`;

// Replace the block of code inside the fetch processing
const re = /if \(data\.products && data\.products\.length\) \{[\s\S]*?(?=if \(!html\) \{)/g;
html = html.replace(re, newJS + '\n\n                            ');
fs.writeFileSync(path, html);
