import { useEffect, useMemo, useRef, useState } from 'react';
import './little-black-book.css';

const DB_NAME = 'wildcarddev-little-black-book';
const DB_VERSION = 1;
const STORE_NAME = 'state';
const STORE_KEY = 'app';
const SAVE_DELAY_MS = 200;

const STARTER_BILLS = [
  ['starter-rent', 'Rent / Mortgage'],
  ['starter-electric', 'Electric'],
  ['starter-water', 'Water'],
  ['starter-gas', 'Gas'],
  ['starter-internet', 'Internet'],
  ['starter-phone', 'Phone'],
  ['starter-insurance', 'Insurance'],
  ['starter-groceries', 'Groceries'],
  ['starter-transportation', 'Transportation'],
  ['starter-subscriptions', 'Subscriptions'],
  ['starter-savings', 'Savings'],
  ['starter-other', 'Other'],
];

function makeStarterBills() {
  return STARTER_BILLS.map(([id, label]) => ({
    id,
    label,
    amount: '',
    dueDate: '',
    paid: false,
    custom: false,
  }));
}

function defaultData() {
  return {
    planner: {},
    bills: {
      moneyHave: '',
      rows: makeStarterBills(),
    },
    contacts: [],
  };
}

function normalizeData(value) {
  const fallback = defaultData();
  if (!value || typeof value !== 'object') return fallback;

  return {
    planner: value.planner && typeof value.planner === 'object' ? value.planner : {},
    bills: {
      moneyHave: value.bills?.moneyHave ?? '',
      rows: Array.isArray(value.bills?.rows) && value.bills.rows.length
        ? value.bills.rows
        : fallback.bills.rows,
    },
    contacts: Array.isArray(value.contacts) ? value.contacts : [],
  };
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function dateFromKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function shiftDateKey(key, amount) {
  const date = dateFromKey(key);
  date.setDate(date.getDate() + amount);
  return localDateKey(date);
}

function uniqueId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return prefix + '-' + crypto.randomUUID();
  }
  return prefix + '-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isFinite(value) ? value : 0);
}

function moneyNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open IndexedDB'));
  });
}

function readDatabase(db) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(STORE_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Could not read IndexedDB'));
  });
}

function writeDatabase(db, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(data, STORE_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Could not write IndexedDB'));
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB write aborted'));
  });
}

function computeCalculator(left, right, operator) {
  if (operator === '+') return left + right;
  if (operator === '−') return left - right;
  if (operator === '×') return left * right;
  if (operator === '÷') return right === 0 ? null : left / right;
  return right;
}

export default function LittleBlackBook() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [data, setData] = useState(defaultData);
  const [storageStatus, setStorageStatus] = useState('Loading device storage…');
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));
  const [plannerType, setPlannerType] = useState('task');
  const [plannerTime, setPlannerTime] = useState('');
  const [plannerText, setPlannerText] = useState('');
  const [contactDraft, setContactDraft] = useState({ name: '', phone: '', email: '', notes: '' });
  const [editingContactId, setEditingContactId] = useState(null);
  const [calculator, setCalculator] = useState({ display: '0', stored: null, operator: null, waiting: false });

  const triggerRef = useRef(null);
  const drawerRef = useRef(null);
  const closeRef = useRef(null);
  const dbRef = useRef(null);
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const db = await openDatabase();
        if (cancelled) {
          db.close();
          return;
        }
        dbRef.current = db;
        const saved = await readDatabase(db);
        if (cancelled) return;
        if (saved) setData(normalizeData(saved));
        hydratedRef.current = true;
        setStorageStatus('Saved only on this device ✓');
      } catch {
        hydratedRef.current = true;
        setStorageStatus('Device storage unavailable');
      }
    }

    hydrate();

    return () => {
      cancelled = true;
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current || !dbRef.current) return undefined;

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    setStorageStatus('Saving on this device…');

    saveTimerRef.current = window.setTimeout(async () => {
      try {
        await writeDatabase(dbRef.current, data);
        setStorageStatus('Saved only on this device ✓');
      } catch {
        setStorageStatus('Device storage unavailable');
      }
    }, SAVE_DELAY_MS);

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [data]);

  useEffect(() => {
    if (!isOpen) return undefined;

    closeRef.current?.focus();

    const root = document.getElementById('root');
    const bookRoot = drawerRef.current?.closest('.lbb-root');
    const siblings = root
      ? Array.from(root.children).filter((node) => node !== bookRoot)
      : [];

    siblings.forEach((node) => node.setAttribute('inert', ''));

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        window.setTimeout(() => triggerRef.current?.focus(), 0);
        return;
      }

      if (event.key !== 'Tab' || !drawerRef.current) return;

      const focusable = Array.from(drawerRef.current.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => !element.closest('[hidden]'));

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      siblings.forEach((node) => node.removeAttribute('inert'));
    };
  }, [isOpen]);

  const plannerDay = data.planner[selectedDate] || { items: [], notes: '' };
  const isToday = selectedDate === localDateKey(new Date());
  const selectedDateLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(dateFromKey(selectedDate)),
    [selectedDate],
  );

  const totals = useMemo(() => {
    const totalBills = data.bills.rows.reduce((sum, row) => sum + moneyNumber(row.amount), 0);
    const paid = data.bills.rows.reduce(
      (sum, row) => sum + (row.paid ? moneyNumber(row.amount) : 0),
      0,
    );
    return {
      totalBills,
      paid,
      stillDue: totalBills - paid,
      afterBills: moneyNumber(data.bills.moneyHave) - totalBills,
    };
  }, [data.bills]);

  function closeDrawer() {
    setIsOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  function updatePlannerDay(updater) {
    setData((current) => {
      const currentDay = current.planner[selectedDate] || { items: [], notes: '' };
      const nextDay = updater(currentDay);
      return {
        ...current,
        planner: {
          ...current.planner,
          [selectedDate]: nextDay,
        },
      };
    });
  }

  function addPlannerItem(event) {
    event.preventDefault();
    const text = plannerText.trim();
    if (!text) return;

    updatePlannerDay((day) => ({
      ...day,
      items: [
        ...(day.items || []),
        {
          id: uniqueId('planner'),
          type: plannerType,
          text,
          time: plannerTime,
          done: false,
        },
      ],
    }));
    setPlannerText('');
    setPlannerTime('');
  }

  function updatePlannerItem(id, patch) {
    updatePlannerDay((day) => ({
      ...day,
      items: (day.items || []).map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function deletePlannerItem(id) {
    updatePlannerDay((day) => ({
      ...day,
      items: (day.items || []).filter((item) => item.id !== id),
    }));
  }

  function updateBill(id, patch) {
    setData((current) => ({
      ...current,
      bills: {
        ...current.bills,
        rows: current.bills.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
      },
    }));
  }

  function addBill() {
    setData((current) => ({
      ...current,
      bills: {
        ...current.bills,
        rows: [
          ...current.bills.rows,
          {
            id: uniqueId('bill'),
            label: 'New Bill',
            amount: '',
            dueDate: '',
            paid: false,
            custom: true,
          },
        ],
      },
    }));
  }

  function deleteBill(id) {
    setData((current) => ({
      ...current,
      bills: {
        ...current.bills,
        rows: current.bills.rows.filter((row) => row.id !== id || !row.custom),
      },
    }));
  }

  function submitContact(event) {
    event.preventDefault();
    const name = contactDraft.name.trim();
    if (!name) return;

    const normalized = {
      name,
      phone: contactDraft.phone.trim(),
      email: contactDraft.email.trim(),
      notes: contactDraft.notes.trim(),
    };

    setData((current) => {
      if (editingContactId) {
        return {
          ...current,
          contacts: current.contacts.map((contact) => (
            contact.id === editingContactId ? { ...contact, ...normalized } : contact
          )),
        };
      }

      return {
        ...current,
        contacts: [...current.contacts, { id: uniqueId('contact'), ...normalized }],
      };
    });

    setEditingContactId(null);
    setContactDraft({ name: '', phone: '', email: '', notes: '' });
  }

  function editContact(contact) {
    setEditingContactId(contact.id);
    setContactDraft({
      name: contact.name || '',
      phone: contact.phone || '',
      email: contact.email || '',
      notes: contact.notes || '',
    });
  }

  function cancelContactEdit() {
    setEditingContactId(null);
    setContactDraft({ name: '', phone: '', email: '', notes: '' });
  }

  function deleteContact(id) {
    setData((current) => ({
      ...current,
      contacts: current.contacts.filter((contact) => contact.id !== id),
    }));
    if (editingContactId === id) cancelContactEdit();
  }

  function calculatorDigit(digit) {
    setCalculator((current) => {
      if (current.display === 'Error' || current.waiting) {
        return { ...current, display: digit, waiting: false };
      }
      return {
        ...current,
        display: current.display === '0' ? digit : current.display + digit,
      };
    });
  }

  function calculatorDecimal() {
    setCalculator((current) => {
      if (current.display === 'Error' || current.waiting) {
        return { ...current, display: '0.', waiting: false };
      }
      if (current.display.includes('.')) return current;
      return { ...current, display: current.display + '.' };
    });
  }

  function calculatorOperator(operator) {
    setCalculator((current) => {
      const currentValue = Number.parseFloat(current.display);
      if (!Number.isFinite(currentValue)) {
        return { display: '0', stored: null, operator, waiting: true };
      }

      if (current.stored !== null && current.operator && !current.waiting) {
        const result = computeCalculator(current.stored, currentValue, current.operator);
        if (result === null || !Number.isFinite(result)) {
          return { display: 'Error', stored: null, operator: null, waiting: true };
        }
        return { display: String(result), stored: result, operator, waiting: true };
      }

      return { ...current, stored: currentValue, operator, waiting: true };
    });
  }

  function calculatorEquals() {
    setCalculator((current) => {
      if (current.stored === null || !current.operator || current.display === 'Error') return current;
      const right = Number.parseFloat(current.display);
      if (!Number.isFinite(right)) return current;
      const result = computeCalculator(current.stored, right, current.operator);
      if (result === null || !Number.isFinite(result)) {
        return { display: 'Error', stored: null, operator: null, waiting: true };
      }
      return { display: String(result), stored: null, operator: null, waiting: true };
    });
  }

  function calculatorClear() {
    setCalculator({ display: '0', stored: null, operator: null, waiting: false });
  }

  function calculatorBackspace() {
    setCalculator((current) => {
      if (current.display === 'Error' || current.waiting) return { ...current, display: '0', waiting: false };
      if (current.display.length <= 1 || (current.display.length === 2 && current.display.startsWith('-'))) {
        return { ...current, display: '0' };
      }
      return { ...current, display: current.display.slice(0, -1) };
    });
  }

  return (
    <div className={'lbb-root' + (isOpen ? ' is-open' : '')}>
      <button
        ref={triggerRef}
        className="lbb-edge-tab"
        type="button"
        aria-controls="penny-little-black-book"
        aria-expanded={isOpen}
        aria-label="Open Penny’s Little Black Book"
        tabIndex={isOpen ? -1 : 0}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen(true);
        }}
      >
        <span className="lbb-edge-glyph" aria-hidden="true">♠</span>
        <span className="lbb-edge-label">BOOK</span>
      </button>

      {isOpen && (
        <button
          className="lbb-backdrop"
          type="button"
          aria-label="Close Penny’s Little Black Book"
          tabIndex={-1}
          onClick={closeDrawer}
        />
      )}

      <aside
        id="penny-little-black-book"
        ref={drawerRef}
        className="lbb-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Penny’s Little Black Book"
        aria-hidden={!isOpen}
      >
        <header className="lbb-header">
          <div>
            <p>PENNY // LITTLE BLACK BOOK</p>
            <h2>Plans. Bills. People. Receipts.</h2>
          </div>
          <button
            ref={closeRef}
            className="lbb-close"
            type="button"
            aria-label="Close Penny’s Little Black Book"
            onClick={closeDrawer}
          >
            ×
          </button>
        </header>

        <nav className="lbb-tabs" role="tablist" aria-label="Little Black Book tools">
          {[
            ['today', 'TODAY'],
            ['bills', 'BILLS'],
            ['contacts', 'CONTACTS'],
            ['calculator', 'CALCULATOR'],
          ].map(([id, label]) => (
            <button
              key={id}
              id={'lbb-tab-' + id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={'lbb-panel-' + id}
              tabIndex={activeTab === id ? 0 : -1}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="lbb-scroll">
          <section
            id="lbb-panel-today"
            className="lbb-panel"
            role="tabpanel"
            aria-labelledby="lbb-tab-today"
            hidden={activeTab !== 'today'}
          >
            <div className="lbb-date-switcher">
              <button type="button" aria-label="Previous day" onClick={() => setSelectedDate(shiftDateKey(selectedDate, -1))}>←</button>
              <div>
                <p>{selectedDateLabel}</p>
                <h3>{isToday ? 'TODAY' : 'DAY PLANNER'}</h3>
              </div>
              <button type="button" aria-label="Next day" onClick={() => setSelectedDate(shiftDateKey(selectedDate, 1))}>→</button>
            </div>

            <form className="lbb-planner-add" onSubmit={addPlannerItem}>
              <select value={plannerType} onChange={(event) => setPlannerType(event.target.value)} aria-label="Planner item type">
                <option value="task">Task</option>
                <option value="appointment">Appointment</option>
              </select>
              <input type="time" value={plannerTime} onChange={(event) => setPlannerTime(event.target.value)} aria-label="Optional time" />
              <input
                type="text"
                value={plannerText}
                onChange={(event) => setPlannerText(event.target.value)}
                placeholder="What needs doing?"
                aria-label="Planner item text"
              />
              <button type="submit">ADD</button>
            </form>

            <div className="lbb-planner-items">
              {(plannerDay.items || []).length === 0 && <p className="lbb-empty">Nothing on the books for this date.</p>}
              {(plannerDay.items || []).map((item) => (
                <div key={item.id} className={'lbb-planner-item' + (item.done ? ' is-done' : '')}>
                  <label className="lbb-check" aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}>
                    <input
                      type="checkbox"
                      checked={Boolean(item.done)}
                      onChange={(event) => updatePlannerItem(item.id, { done: event.target.checked })}
                    />
                    <span aria-hidden="true" />
                  </label>
                  <div className="lbb-planner-fields">
                    <small>{item.type === 'appointment' ? 'Appointment' : 'Task'}</small>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(event) => updatePlannerItem(item.id, { text: event.target.value })}
                      aria-label="Planner item text"
                    />
                    <input
                      className="lbb-time"
                      type="time"
                      value={item.time || ''}
                      onChange={(event) => updatePlannerItem(item.id, { time: event.target.value })}
                      aria-label="Planner item time"
                    />
                  </div>
                  <button className="lbb-icon-button" type="button" aria-label="Delete planner item" onClick={() => deletePlannerItem(item.id)}>×</button>
                </div>
              ))}
            </div>

            <label className="lbb-notes">
              <span>NOTES</span>
              <textarea
                rows="5"
                value={plannerDay.notes || ''}
                onChange={(event) => updatePlannerDay((day) => ({ ...day, notes: event.target.value }))}
                placeholder="Notes for this date…"
              />
            </label>
          </section>

          <section
            id="lbb-panel-bills"
            className="lbb-panel"
            role="tabpanel"
            aria-labelledby="lbb-tab-bills"
            hidden={activeTab !== 'bills'}
          >
            <label className="lbb-money-have">
              <span>MONEY I HAVE</span>
              <div>
                <b aria-hidden="true">$</b>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={data.bills.moneyHave}
                  onChange={(event) => setData((current) => ({
                    ...current,
                    bills: { ...current.bills, moneyHave: event.target.value },
                  }))}
                  aria-label="Money I have"
                />
              </div>
            </label>

            <div className="lbb-bill-list">
              {data.bills.rows.map((row) => (
                <div className="lbb-bill-row" key={row.id}>
                  <input
                    className="lbb-bill-label"
                    type="text"
                    value={row.label}
                    onChange={(event) => updateBill(row.id, { label: event.target.value })}
                    aria-label="Bill label"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={row.amount}
                    onChange={(event) => updateBill(row.id, { amount: event.target.value })}
                    placeholder="0.00"
                    aria-label={(row.label || 'Bill') + ' amount'}
                  />
                  <input
                    type="date"
                    value={row.dueDate || ''}
                    onChange={(event) => updateBill(row.id, { dueDate: event.target.value })}
                    aria-label={(row.label || 'Bill') + ' due date'}
                  />
                  <label className="lbb-paid-check">
                    <input
                      type="checkbox"
                      checked={Boolean(row.paid)}
                      onChange={(event) => updateBill(row.id, { paid: event.target.checked })}
                    />
                    <span>Paid</span>
                  </label>
                  {row.custom ? (
                    <button className="lbb-icon-button" type="button" aria-label={'Delete ' + (row.label || 'bill')} onClick={() => deleteBill(row.id)}>×</button>
                  ) : (
                    <span className="lbb-bill-lock" aria-hidden="true">•</span>
                  )}
                </div>
              ))}
            </div>

            <button className="lbb-add-wide" type="button" onClick={addBill}>+ ADD BILL</button>

            <dl className="lbb-totals">
              <div><dt>Total Bills</dt><dd>{formatMoney(totals.totalBills)}</dd></div>
              <div><dt>Paid</dt><dd>{formatMoney(totals.paid)}</dd></div>
              <div><dt>Still Due</dt><dd>{formatMoney(totals.stillDue)}</dd></div>
              <div className="is-emphasis"><dt>Money After Bills</dt><dd>{formatMoney(totals.afterBills)}</dd></div>
            </dl>
            <p className="lbb-rule-note">Money After Bills = Money I Have − Total Bills. Paid status does not remove a bill from the reserved total.</p>
          </section>

          <section
            id="lbb-panel-contacts"
            className="lbb-panel"
            role="tabpanel"
            aria-labelledby="lbb-tab-contacts"
            hidden={activeTab !== 'contacts'}
          >
            <form className="lbb-contact-form" onSubmit={submitContact}>
              <label>
                <span>NAME *</span>
                <input
                  required
                  type="text"
                  value={contactDraft.name}
                  onChange={(event) => setContactDraft((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label>
                <span>PHONE</span>
                <input
                  type="tel"
                  value={contactDraft.phone}
                  onChange={(event) => setContactDraft((current) => ({ ...current, phone: event.target.value }))}
                />
              </label>
              <label>
                <span>EMAIL</span>
                <input
                  type="email"
                  value={contactDraft.email}
                  onChange={(event) => setContactDraft((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label className="lbb-contact-notes">
                <span>NOTES</span>
                <textarea
                  rows="4"
                  value={contactDraft.notes}
                  onChange={(event) => setContactDraft((current) => ({ ...current, notes: event.target.value }))}
                />
              </label>
              <div className="lbb-contact-actions">
                <button type="submit">{editingContactId ? 'SAVE CONTACT' : 'ADD CONTACT'}</button>
                {editingContactId && <button type="button" className="is-secondary" onClick={cancelContactEdit}>CANCEL</button>}
              </div>
            </form>

            <div className="lbb-contact-list">
              {data.contacts.length === 0 && <p className="lbb-empty">No contacts saved yet.</p>}
              {data.contacts.map((contact) => (
                <article className="lbb-contact-card" key={contact.id}>
                  <div className="lbb-contact-card-head">
                    <h3>{contact.name}</h3>
                    <div>
                      <button type="button" onClick={() => editContact(contact)}>EDIT</button>
                      <button type="button" onClick={() => deleteContact(contact.id)}>DELETE</button>
                    </div>
                  </div>
                  <div className="lbb-contact-links">
                    {contact.phone && <a href={'tel:' + contact.phone}>{contact.phone}</a>}
                    {contact.email && <a href={'mailto:' + contact.email}>{contact.email}</a>}
                  </div>
                  {contact.notes && <p>{contact.notes}</p>}
                </article>
              ))}
            </div>
          </section>

          <section
            id="lbb-panel-calculator"
            className="lbb-panel"
            role="tabpanel"
            aria-labelledby="lbb-tab-calculator"
            hidden={activeTab !== 'calculator'}
          >
            <div className="lbb-calculator" aria-label="Calculator">
              <output className="lbb-calc-display" aria-live="polite">{calculator.display}</output>
              <div className="lbb-calc-grid">
                <button type="button" onClick={calculatorClear}>C</button>
                <button type="button" onClick={calculatorBackspace} aria-label="Backspace">⌫</button>
                <button type="button" className="is-operator" onClick={() => calculatorOperator('÷')}>÷</button>
                <button type="button" className="is-operator" onClick={() => calculatorOperator('×')}>×</button>
                <button type="button" onClick={() => calculatorDigit('7')}>7</button>
                <button type="button" onClick={() => calculatorDigit('8')}>8</button>
                <button type="button" onClick={() => calculatorDigit('9')}>9</button>
                <button type="button" className="is-operator" onClick={() => calculatorOperator('−')}>−</button>
                <button type="button" onClick={() => calculatorDigit('4')}>4</button>
                <button type="button" onClick={() => calculatorDigit('5')}>5</button>
                <button type="button" onClick={() => calculatorDigit('6')}>6</button>
                <button type="button" className="is-operator" onClick={() => calculatorOperator('+')}>+</button>
                <button type="button" onClick={() => calculatorDigit('1')}>1</button>
                <button type="button" onClick={() => calculatorDigit('2')}>2</button>
                <button type="button" onClick={() => calculatorDigit('3')}>3</button>
                <button type="button" className="is-equals" onClick={calculatorEquals}>=</button>
                <button type="button" className="is-zero" onClick={() => calculatorDigit('0')}>0</button>
                <button type="button" onClick={calculatorDecimal}>.</button>
              </div>
            </div>
          </section>
        </div>

        <footer className={'lbb-save-status' + (storageStatus.startsWith('Saving') ? ' is-saving' : '')}>
          {storageStatus}
        </footer>
      </aside>
    </div>
  );
}
