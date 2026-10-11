/*
  PAVYNTRIX STUDIO — configuration
  1) Set WHATSAPP_NUMBER to your business number in international format.
     Example for India: "919876543210" (country code + number, no +, spaces, or dashes).
  2) Set CONTACT_EMAIL to an inbox you control before publishing.
  3) This static version does not store enquiries. It opens WhatsApp with a prefilled message,
     or lets the visitor copy the enquiry when WhatsApp is not configured.
*/
const WHATSAPP_NUMBER = "919314664227"; // Add business number in international digits-only format (e.g. India: 919876543210)
const CONTACT_EMAIL = "nivowebsiteb@gmail.com"; // Add a business email (e.g. hello@yourdomain.com) before publishing

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const themeToggle = document.querySelector('.theme-toggle');
const toast = document.querySelector('#toast');
const contactForm = document.querySelector('#contact-form');
const feedback = document.querySelector('#form-feedback');
const copyButton = document.querySelector('#copy-message');
const packageSelect = document.querySelector('#package-select');
const whatsappCard = document.querySelector('#contact-whatsapp-card');
const whatsappLabel = document.querySelector('#contact-whatsapp-label');
const emailCard = document.querySelector('#contact-email-card');
const emailLabel = document.querySelector('#contact-email-label');
let currentEnquiryMessage = '';
let toastTimeout;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('show'), 3200);
}

function closeMenu() {
  navLinks?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Open navigation');
}

menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });

function setTheme(theme) {
  if (theme === 'light') {
    document.body.dataset.theme = 'light';
    themeToggle?.setAttribute('aria-label', 'Switch to dark theme');
    themeToggle?.setAttribute('title', 'Switch to dark theme');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F6FAFF');
  } else {
    delete document.body.dataset.theme;
    themeToggle?.setAttribute('aria-label', 'Switch to light theme');
    themeToggle?.setAttribute('title', 'Switch to light theme');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0b0c12');
  }
}

try {
  const savedTheme = localStorage.getItem('pavyntrix-theme');
  setTheme(savedTheme === 'dark' ? 'dark' : 'light');
} catch (error) { setTheme('light'); /* Storage can be disabled; keep the positive palette. */ }

themeToggle?.addEventListener('click', () => {
  const next = document.body.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(next);
  try { localStorage.setItem('pavyntrix-theme', next); } catch (error) { /* Theme still changes for this page view. */ }
});

// Interactive concept gallery filters.
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.project-card').forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !show);
    });
  });
});
document.querySelectorAll('.filter-btn').forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));

// Package cards preselect the user's choice in the project enquiry form.
document.querySelectorAll('.package-select').forEach(button => {
  button.addEventListener('click', () => {
    const packageName = button.dataset.package || '';
    const serviceSelect = contactForm?.elements.namedItem('service');
    if (packageSelect && Array.from(packageSelect.options).some(option => option.value === packageName)) {
      packageSelect.value = packageName;
    }
    if (serviceSelect) {
      if (packageName === 'Basic') serviceSelect.value = 'Landing page';
      else if (packageName === 'Business' || packageName === 'Premium') serviceSelect.value = 'Business website';
      else if (packageName.toLowerCase().includes('custom') || packageName.toLowerCase().includes('e-commerce')) serviceSelect.value = 'E-commerce website';
    }
  });
});

function buildMessage(formData) {
  const purpose = formData.get('service') === 'Share feedback about a project'
    ? 'I would like to share feedback about a previous project.'
    : 'I would like to enquire about a website project.';
  return [
    `Hello Pavyntrix Studio! ${purpose}`,
    '',
    `Name: ${formData.get('name')}`,
    `Email: ${formData.get('email')}`,
    `Project type: ${formData.get('service')}`,
    `Preferred package: ${formData.get('package') || 'Not sure yet'}`,
    `Budget: ${formData.get('budget')}`,
    `Timeline: ${formData.get('timeline')}`,
    '',
    'Project details / feedback:',
    `${formData.get('details')}`
  ].join('\n');
}

function sendToWhatsApp(message) {
  const phone = WHATSAPP_NUMBER.replace(/\D/g, '');
  if (!phone) return false;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

contactForm?.addEventListener('submit', event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const formData = new FormData(contactForm);
  currentEnquiryMessage = buildMessage(formData);
  const opened = sendToWhatsApp(currentEnquiryMessage);
  feedback.hidden = false;
  copyButton.hidden = false;
  if (opened) {
    feedback.textContent = 'Your enquiry message has been prepared in WhatsApp. Review it there and press Send to contact the studio.';
    showToast('WhatsApp opened with your enquiry.');
  } else {
    feedback.textContent = 'Your enquiry is ready, but the studio WhatsApp number has not been configured yet. Copy the message below, or add your number to WHATSAPP_NUMBER in script.js to enable direct contact.\n\n' + currentEnquiryMessage;
    showToast('Enquiry prepared — configure WhatsApp to send directly.');
  }
});

copyButton?.addEventListener('click', async () => {
  if (!currentEnquiryMessage) return;
  try {
    await navigator.clipboard.writeText(currentEnquiryMessage);
    showToast('Enquiry message copied.');
  } catch (error) {
    const temporary = document.createElement('textarea');
    temporary.value = currentEnquiryMessage;
    temporary.setAttribute('readonly', '');
    temporary.style.position = 'fixed';
    temporary.style.opacity = '0';
    document.body.appendChild(temporary);
    temporary.select();
    const copied = document.execCommand('copy');
    temporary.remove();
    showToast(copied ? 'Enquiry message copied.' : 'Please select and copy the enquiry message above.');
  }
});

function updateDirectContactCards() {
  const phone = WHATSAPP_NUMBER.replace(/\D/g, '');
  const validPhone = phone.length >= 8 && phone.length <= 15;
  if (whatsappCard && whatsappLabel) {
    if (validPhone) {
      whatsappCard.href = `https://wa.me/${phone}`;
      whatsappCard.target = '_blank';
      whatsappCard.rel = 'noopener noreferrer';
      whatsappLabel.textContent = 'Chat with us directly';
    } else {
      whatsappCard.href = '#contact-form';
      whatsappLabel.textContent = 'Add WHATSAPP_NUMBER in script.js before publishing';
    }
  }
  if (emailCard && emailLabel) {
    const email = CONTACT_EMAIL.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (validEmail) {
      emailCard.href = `mailto:${email}`;
      emailLabel.textContent = email;
    } else {
      emailCard.href = '#contact-form';
      emailLabel.textContent = 'Add CONTACT_EMAIL in script.js before publishing';
    }
  }
}
updateDirectContactCards();

document.querySelector('#feedback-link')?.addEventListener('click', () => {
  const serviceSelect = contactForm?.elements.namedItem('service');
  if (serviceSelect) serviceSelect.value = 'Share feedback about a project';
  const details = contactForm?.elements.namedItem('details');
  if (details) details.placeholder = 'Tell us about your experience, what worked well, and what we could improve.';
});

function quickWhatsApp() {
  const message = 'Hello Pavyntrix Studio! I would like to discuss a website project. Could you share the next steps?';
  if (!sendToWhatsApp(message)) {
    showToast('Add your WhatsApp number in script.js to enable this link.');
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  }
}
document.querySelector('#quick-whatsapp')?.addEventListener('click', quickWhatsApp);

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
