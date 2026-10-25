const svgNS = 'http://www.w3.org/2000/svg';
const diagramRows = [
  ['1', '2', '3', 'A'],
  ['4', '5', '6', 'B'],
  ['7', '8', '9', 'C'],
  ['*', '0', '#', 'D']
];
diagramRows.forEach((row, r) => row.forEach((key, c) => {
  const x = 49 + c * 36,
    y = 120 + r * 42;
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', '29');
  rect.setAttribute('height', '33');
  rect.setAttribute('rx', '5');
  rect.setAttribute('fill', 'ABCD*#'.includes(key) ? '#d45b59' : '#2877b7');
  rect.setAttribute('stroke', '#9bbbd0');
  document.getElementById('diagramKeys').appendChild(rect);
  const t = document.createElementNS(svgNS, 'text');
  t.setAttribute('x', x + 14.5);
  t.setAttribute('y', y + 21);
  t.setAttribute('text-anchor', 'middle');
  t.setAttribute('font-size', '13');
  t.setAttribute('font-weight', '800');
  t.setAttribute('fill', '#fff');
  t.textContent = key;
  document.getElementById('diagramKeys').appendChild(t)
}));
for (let r = 0; r < 5; r++)
  for (let c = 0; c < 5; c++) {
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', 330 + c * 15);
    dot.setAttribute('cy', 174 + r * 15);
    dot.setAttribute('r', '3');
    dot.setAttribute('fill', (r + c) % 3 === 0 ? '#ff655b' : '#713b3a');
    document.getElementById('diagramLeds').appendChild(dot)
  }
const catalog = {
  '1234': {
    name: 'Apple',
    price: 1.50
  },
  '1324': {
    name: 'Banana',
    price: .75
  },
  '2468': {
    name: 'Milk',
    price: 2
  },
  '5678': {
    name: 'Bread',
    price: 1.25
  },
  '9876': {
    name: 'Chocolate',
    price: 1
  }
};
const keyRows = [
  ['1', '2', '3', 'A'],
  ['4', '5', '6', 'B'],
  ['7', '8', '9', 'C'],
  ['*', '0', '#', 'D']
];
let code = '',
  selected = null;
const cart = {};
const $ = id => document.getElementById(id);

function lcd(a, b, msg) {
  $('lcd1').textContent = String(a).slice(0, 16);
  $('lcd2').textContent = String(b).slice(0, 16);
  $('status').textContent = msg
}

function count() {
  $('count').textContent = code.length + ' / 4 digits'
}

function cartSum() {
  return Object.values(cart).reduce((sum, p) => sum + p.price * p.qty, 0)
}

function drawCart() {
  const body = $('cart');
  body.innerHTML = '';
  const items = Object.values(cart);
  if (!items.length) {
    body.innerHTML = '<tr><td colspan="3" class="sub">No items yet. Enter a code and press A, then C.</td></tr>'
  }
  items.forEach(p => {
    const tr = document.createElement('tr');
    [p.name, p.qty, '$' + (p.price * p.qty).toFixed(2)].forEach(v => {
      const td = document.createElement('td');
      td.textContent = v;
      tr.appendChild(td)
    });
    body.appendChild(tr)
  });
  $('total').textContent = 'Total: $' + cartSum().toFixed(2)
}

function press(k) {
  if (/^\d$/.test(k)) {
    if (code.length < 4) {
      code += k;
      selected = null;
      lcd('Code: ' + code, 'Press A to find', 'Typing product code…')
    } else lcd('Code complete', 'Press A to find', 'Four digits are entered. Press A.')
  } else if (k === '*' || k === '#') {
    code = '';
    selected = null;
    lcd('Code cleared', 'Enter code', 'Only the current product code was cleared.')
  } else if (k === 'B') {
    Object.keys(cart).forEach(name => delete cart[name]);
    drawCart();
    lcd('List emptied', 'Total: $0.00', 'Shopping list emptied. Your current code is unchanged.')
  } else if (k === 'A') {
    if (code.length !== 4) lcd('Enter 4 digits', 'Then press A', 'Please enter exactly four digits.');
    else if (!catalog[code]) {
      lcd('Invalid code', 'Try again', 'No product matches ' + code + '.');
      code = '';
      selected = null
    } else {
      selected = catalog[code];
      lcd('Found: ' + selected.name, '$' + selected.price.toFixed(2) + ' Press C', 'Found ' + selected.name + '. Press C to add it.')
    }
  } else if (k === 'C') {
    if (!selected) lcd('Find item first', 'Press A', 'Enter a code and press A before adding.');
    else {
      if (!cart[selected.name]) cart[selected.name] = {
        ...selected,
        qty: 0
      };
      cart[selected.name].qty++;
      lcd('Added: ' + selected.name, 'Press D for total', 'Added ' + selected.name + ' to the list. Press D to calculate total.');
      selected = null;
      code = '';
      drawCart()
    }
  } else if (k === 'D') {
    const sum = cartSum();
    lcd('List total: $' + sum.toFixed(2), Object.values(cart).reduce((n, p) => n + p.qty, 0) + ' item(s)', 'Calculated shopping-list total: $' + sum.toFixed(2));
  }
  count()
}
keyRows.flat().forEach(k => {
  const b = document.createElement('button');
  b.className = 'key ' + ('ABCD'.includes(k) || k === '*' || k === '#' ? 'special' : '');
  b.textContent = k;
  b.setAttribute('aria-label', 'Key ' + k);
  b.onclick = () => press(k);
  $('keys').appendChild(b)
});
$('empty').onclick = () => press('B');
$('demo').onclick = () => {
  if (!cart.Apple) cart.Apple = {
    ...catalog['1234'],
    qty: 0
  };
  cart.Apple.qty++;
  if (!cart.Banana) cart.Banana = {
    ...catalog['1324'],
    qty: 0
  };
  cart.Banana.qty++;
  drawCart();
  lcd('Sample added', 'Press D for total', 'Sample Apple and Banana added. Press D to calculate total.');
};
document.querySelector('#keys + .help').textContent = 'Enter code → A finds product → C adds it to the list. D calculates the list total. * clears only the current code; B empties the shopping list.';
count();
drawCart();
