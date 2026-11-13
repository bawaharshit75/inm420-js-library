
'use strict';


/* ---------- shared data ---------- */

const DESTINATIONS = [
  { name: 'Lisbon', coords: [38.7223, -9.1393], blurb: 'Hilltop viewpoints, tram 28 and pastéis de nata.' },
  { name: 'Sintra', coords: [38.7980, -9.3880], blurb: 'Fairy-tale palaces and misty gardens.' },
  { name: 'Porto', coords: [41.1579, -8.6291], blurb: 'Tiled churches and port-wine cellars.' },
  { name: 'Douro Valley', coords: [41.1906, -7.5464], blurb: 'Terraced vineyards and river cruises.' },
  { name: 'Lagos', coords: [37.1028, -8.6730], blurb: 'Golden sea stacks and surf breaks.' },
  { name: 'Évora', coords: [38.5714, -7.9135], blurb: 'Roman temple inside medieval walls.' }
];

// approximate lisbon climate averages
const LISBON_CLIMATE = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  highC: [15, 16, 19, 20, 23, 26, 28, 28, 27, 23, 18, 15],
  rainMm: [100, 86, 58, 64, 50, 16, 4, 6, 32, 98, 114, 122]
};

const TYPED_STRINGS = [
  'Ride Lisbon\'s yellow trams.',
  'Surf the Algarve coast.',
  'Sip port in Porto.',
  'Get lost in Sintra\'s palaces.'
];

const COLORS = {
  ocean: '#0b3d5c',
  terracotta: '#d9643a',
  oceanFaded: 'rgba(11, 61, 92, 0.25)',
  grid: '#e3e8ec',
  muted: '#55636e'
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;


/* ---------- helpers ---------- */

/**
 * returns true when a library's global variable exists.
 * logs a warning (not an error) if a cdn failed so the page keeps working.
 */
function isLoaded(globalName) {
  const loaded = typeof window[globalName] !== 'undefined';

  if (!loaded) {
    console.warn(`${globalName} did not load, skipping that feature.`);
  }

  return loaded;
}

/**
 * parses a yyyy-mm-dd string into a date, or returns null if it is not a
 * real calendar date (e.g. 2026-02-31).
 */
function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  const isRealDate = date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;

  return isRealDate ? date : null;
}


/* ---------- navigation (no library) ---------- */

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#site-nav');

  if (!toggle || !nav) {
    return;
  }

  const setOpen = (isOpen) => {
    toggle.setAttribute('aria-expanded', String(isOpen));
    nav.classList.toggle('site-nav--open', isOpen);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // close the mobile menu after a link is chosen
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setOpen(false);
    }
  });

  // close with the escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
    }
  });
}


/* ---------- 1. glide.js: destinations carousel ---------- */

function initCarousel() {
  if (!document.querySelector('#destinations-glide') || !isLoaded('Glide')) {
    return;
  }

  // glide breakpoints are max-width values, so they read from large to small
  const glide = new Glide('#destinations-glide', {
    type: 'carousel',
    perView: 3,
    gap: 24,
    autoplay: prefersReducedMotion ? false : 5000,
    hoverpause: true,
    breakpoints: {
      1023: { perView: 2 },
      767: { perView: 1, peek: { before: 0, after: 48 }, gap: 16 }
    }
  });

  glide.mount();
}


/* ---------- 2. fslightbox: photo gallery ---------- */

function initLightbox() {
  // fslightbox wires up every [data-fslightbox] link on its own when it
  // loads. refreshing here makes sure links added before this point are
  // registered; without the library the links still open the full image.
  if (typeof window.refreshFsLightbox === 'function') {
    window.refreshFsLightbox();
  } else {
    console.warn('fslightbox did not load, gallery links will open normally.');
  }
}


/* ---------- 3. leaflet: interactive map ---------- */

function initMap() {
  const mapElement = document.querySelector('#leaflet-map');
  const listElement = document.querySelector('#map-list');

  if (!mapElement || !isLoaded('L')) {
    return;
  }

  // scroll-wheel zoom is off so the page scrolls normally past the map
  const map = L.map(mapElement, { scrollWheelZoom: false });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const markers = DESTINATIONS.map((place, index) => {
    const icon = L.divIcon({
      className: 'map-pin',
      html: String(index + 1),
      iconSize: [30, 30]
    });

    return L.marker(place.coords, { icon, title: place.name })
      .addTo(map)
      .bindPopup(`<h3 class="map-popup__title">${place.name}</h3><p>${place.blurb}</p>`);
  });

  const allBounds = L.latLngBounds(DESTINATIONS.map((place) => place.coords));
  map.fitBounds(allBounds, { padding: [30, 30] });

  if (!listElement) {
    return;
  }

  // build one "fly to" button per destination
  DESTINATIONS.forEach((place, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'map-list__button';
    button.textContent = `${index + 1}. ${place.name}`;

    button.addEventListener('click', () => {
      listElement.querySelectorAll('.map-list__button--active').forEach((active) => {
        active.classList.remove('map-list__button--active');
      });
      button.classList.add('map-list__button--active');

      map.flyTo(place.coords, 11, { duration: prefersReducedMotion ? 0 : 1.5 });
      markers[index].openPopup();
    });

    item.append(button);
    listElement.append(item);
  });
}


/* ---------- 4. chart.js: climate chart ---------- */

function buildClimateChart(canvas) {
  Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
  Chart.defaults.color = COLORS.muted;

  return new Chart(canvas, {
    data: {
      labels: LISBON_CLIMATE.months,
      datasets: [
        {
          type: 'line',
          label: 'Avg high (°C)',
          data: LISBON_CLIMATE.highC,
          yAxisID: 'yTemp',
          borderColor: COLORS.terracotta,
          backgroundColor: COLORS.terracotta,
          borderWidth: 3,
          pointRadius: 4,
          tension: 0.35,
          order: 1
        },
        {
          type: 'bar',
          label: 'Rainfall (mm)',
          data: LISBON_CLIMATE.rainMm,
          yAxisID: 'yRain',
          backgroundColor: COLORS.oceanFaded,
          hoverBackgroundColor: COLORS.ocean,
          borderRadius: 4,
          order: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: prefersReducedMotion ? false : { duration: 1200 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom' }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        yTemp: {
          type: 'linear',
          position: 'left',
          min: 0,
          max: 35,
          title: { display: true, text: '°C' },
          grid: { color: COLORS.grid }
        },
        yRain: {
          type: 'linear',
          position: 'right',
          min: 0,
          max: 140,
          title: { display: true, text: 'mm' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

function initChart() {
  const canvas = document.querySelector('#climate-chart');

  if (!canvas || !isLoaded('Chart')) {
    return;
  }

  // build the chart only when it scrolls into view so the animation is seen
  if (!('IntersectionObserver' in window)) {
    buildClimateChart(canvas);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      buildClimateChart(canvas);
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(canvas);
}


/* ---------- 5. aos: animate on scroll ---------- */

function initScrollAnimations() {
  if (!isLoaded('AOS')) {
    return;
  }

  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
    disable: prefersReducedMotion
  });
}


/* ---------- 6. cleave.js: input formatting ---------- */

const formatters = {};

function initInputFormatting() {
  if (!isLoaded('Cleave')) {
    return;
  }

  const dateOptions = { date: true, delimiter: '-', datePattern: ['Y', 'm', 'd'] };

  formatters.depart = new Cleave('#depart', dateOptions);
  formatters.return = new Cleave('#return', dateOptions);

  formatters.budget = new Cleave('#budget', {
    numeral: true,
    numeralThousandsGroupStyle: 'thousand',
    numeralPositiveOnly: true,
    numeralDecimalScale: 0,
    prefix: '$',
    noImmediatePrefix: true
  });

  // the phone option needs the separate canadian phone add-on file
  try {
    formatters.phone = new Cleave('#phone', { phone: true, phoneRegionCode: 'CA' });
  } catch (error) {
    console.warn('Cleave phone add-on did not load, phone field left unformatted.');
  }
}


/* ---------- trip form validation (no library) ---------- */

function setFieldError(field, message) {
  const errorElement = document.querySelector(`#${field.id}-error`);

  field.setAttribute('aria-invalid', message ? 'true' : 'false');

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function validateTripForm(form) {
  const fields = form.elements;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const errors = {
    'full-name': fields['full-name'].value.trim() ? '' : 'Please enter your name.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim()) ? '' : 'Please enter a valid email address.',
    phone: '',
    destination: fields.destination.value ? '' : 'Please choose a destination.',
    depart: '',
    return: '',
    budget: ''
  };

  // phone is optional, but if filled in it needs ten digits
  const phoneDigits = fields.phone.value.replace(/\D/g, '');
  if (phoneDigits && phoneDigits.length !== 10) {
    errors.phone = 'Phone numbers need 10 digits.';
  }

  const departDate = parseDate(fields.depart.value);
  const returnDate = parseDate(fields.return.value);

  if (!departDate) {
    errors.depart = 'Use a real date in yyyy-mm-dd format.';
  } else if (departDate < today) {
    errors.depart = 'Departure can\'t be in the past.';
  }

  if (!returnDate) {
    errors.return = 'Use a real date in yyyy-mm-dd format.';
  } else if (departDate && returnDate <= departDate) {
    errors.return = 'Return must be after departure.';
  }

  Object.keys(errors).forEach((id) => {
    setFieldError(fields[id], errors[id]);
  });

  const firstInvalid = Object.keys(errors).find((id) => errors[id]);

  return { isValid: !firstInvalid, firstInvalid, departDate, returnDate };
}

function initTripForm() {
  const form = document.querySelector('#trip-form');
  const status = document.querySelector('#form-status');

  if (!form || !status) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const result = validateTripForm(form);

    if (!result.isValid) {
      status.textContent = '';
      status.classList.remove('form__status--success');
      form.elements[result.firstInvalid].focus();
      return;
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.round((result.returnDate - result.departDate) / msPerDay);
    const name = form.elements['full-name'].value.trim().split(' ')[0];
    const place = form.elements.destination.value;

    status.textContent = `Obrigado, ${name}! Your ${nights}-night ${place} itinerary is on its way to your inbox.`;
    status.classList.add('form__status--success');

    form.reset();

    // keep cleave's internal state in sync with the cleared inputs
    Object.values(formatters).forEach((formatter) => formatter.setRawValue(''));
  });
}


/* ---------- 7. typed.js: hero typing effect ---------- */

function initTypedText() {
  const target = document.querySelector('#typed-text');

  if (!target) {
    return;
  }

  // reduced motion or missing library: show the first line as plain text
  if (prefersReducedMotion || !isLoaded('Typed')) {
    target.textContent = TYPED_STRINGS[0];
    return;
  }

  new Typed('#typed-text', {
    strings: TYPED_STRINGS,
    typeSpeed: 55,
    backSpeed: 30,
    backDelay: 1800,
    startDelay: 400,
    loop: true,
    smartBackspace: true
  });
}


/* ---------- 8. vanilla-tilt.js: 3d card tilt ---------- */

function initCardTilt() {
  // only on mouse devices: tilt feels odd on touch screens
  if (!canHover || prefersReducedMotion || !isLoaded('VanillaTilt')) {
    return;
  }

  // runs after glide so the cloned carousel slides are tilted too
  VanillaTilt.init(document.querySelectorAll('.js-tilt'), {
    max: 8,
    speed: 400,
    scale: 1.02,
    glare: true,
    'max-glare': 0.2
  });
}


/* ---------- footer year ---------- */

function initYear() {
  const yearElement = document.querySelector('#year');

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}


/* ---------- start everything ---------- */

initNav();
initCarousel();
initCardTilt();
initLightbox();
initMap();
initChart();
initInputFormatting();
initTripForm();
initTypedText();
initYear();
initScrollAnimations();
