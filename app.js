'use strict';

// 本文件仅使用演示数据，不调用项目的订单、用户或支付接口。
const icons = {
  home: '<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
  ship: '<path d="M5 13V6h14v7M9 6V3h6v3M3 14l9-3 9 3-3 6H6zM3 21q3-2 6 0 3-2 6 0 3-2 6 0"/>',
  ticket: '<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4z"/><path d="M14 5v2m0 3v2m0 3v2m0 2v0M6 9h4m-4 6h4"/>',
  alarm: '<path d="M5 17v-5a7 7 0 0 1 14 0v5l2 2H3zM10 22h4M13 8l-3 5h4l-3 4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18M8 15h2m4 0h2m-8 3h2"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="m15 4-8 8 8 8"/>',
  swap: '<path d="M3 7h18l-4-4M21 17H3l4 4"/>',
  weather: '<path d="M4 17a4 4 0 0 1 0-8h1a6 6 0 1 1 11 4h1a4 4 0 0 1 0 8M3 21q3-2 6 0 3-2 6 0 3-2 6 0"/>',
  star: '<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  book: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8m-8 4h8m-8 4h4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  sort: '<path d="M5 5v14l-3-3m3 3 3-3M12 5h9m-9 7h6m-6 7h3"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
  signal: '<path d="M3 18v-4m5 4V10m5 8V6m5 12V3"/>',
  wifi: '<path d="M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0m-9 4a4 4 0 0 1 6 0m-3 3v.1"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.ship}</svg>`;
const ports = { all: '全部码头', jishi: '积石码头', dongbi: '东壁码头', sansha: '三沙码头' };
const types = { all: '全部船型', ferry: '客渡船', speed: '快艇拼船', sym: '山海交响号', star: '北礵之星' };
const samples = [
  { id: 'f1', type: 'ferry', name: '福宁客渡 01', port: 'jishi', time: '07:30', price: 30, minutes: 80, stock: 18, one: true, round: false },
  { id: 's0', type: 'speed', name: '快艇拼船', port: 'dongbi', time: '08:30', price: 50, minutes: 30, stock: 0, one: false, round: true },
  { id: 'b1', type: 'star', name: '北礵之星', port: 'sansha', time: '09:00', price: 58, minutes: 45, stock: 6, one: true, round: false },
  { id: 's1', type: 'speed', name: '快艇拼船', port: 'sansha', time: '09:30', price: 50, minutes: 30, stock: 8, one: false, round: true },
  { id: 'm1', type: 'sym', name: '山海交响号', port: 'sansha', time: '10:00', price: 68, minutes: 50, stock: 23, one: true, round: true, sameDay: true },
  { id: 'f2', type: 'ferry', name: '福宁客渡 01', port: 'jishi', time: '13:20', price: 30, minutes: 80, stock: 28, one: true, round: false },
  { id: 's2', type: 'speed', name: '快艇拼船', port: 'dongbi', time: '14:30', price: 50, minutes: 30, stock: 4, one: false, round: true },
];
const DAYS = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 9, 8 + i));
  return { i, full: date.toISOString().slice(0, 10), label: `${date.getUTCMonth() + 1}.${String(date.getUTCDate()).padStart(2, '0')}`, week: i === 0 ? '今天' : i === 1 ? '明天' : ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getUTCDay()] };
});
const timeMinutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const timeString = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
function initialState() {
  return { dateIndex: 1, direction: 'out', port: 'all', type: 'all', sort: 'time', selected: 's1', mode: 'round', returnDateIndex: 1, returnId: 's1-1-1', view: 'home', overlay: null };
}
let state = initialState();
let toastTimer;
let focusReturn = null;
let calendarMonth = 9;

function schedules(day = state.dateIndex) {
  if (day === 0 || day === 3) return [];
  return samples.map((sample) => ({ ...sample, time: state.direction === 'out' ? sample.time : timeString(timeMinutes(sample.time) + 90), stock: sample.stock === 0 ? 0 : Math.max(1, sample.stock - (day - 1) % 5) }));
}
function filteredSchedules(day = state.dateIndex) {
  return schedules(day).filter((s) => (state.port === 'all' || s.port === state.port) && (state.type === 'all' || s.type === state.type)).sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || (state.sort === 'price' ? shownPrice(a) - shownPrice(b) || a.time.localeCompare(b.time) : a.time.localeCompare(b.time)));
}
function selectedSchedule() { return schedules().find((s) => s.id === state.selected); }
function shownPrice(s) { return s.one ? s.price : s.price * 2; }
function available(day) { return filteredSchedules(day).some((s) => s.stock > 0); }
function nextAvailable() { return DAYS.find((d) => d.i >= state.dateIndex && available(d.i))?.i ?? DAYS.find((d) => available(d.i))?.i; }
function route(s) { return state.direction === 'out' ? [ports[s.port], '北礵码头'] : ['北礵码头', ports[s.port]]; }
function returnOptions(s) {
  if (!s || !s.round || state.returnDateIndex < state.dateIndex || (s.sameDay && state.returnDateIndex !== state.dateIndex) || !schedules(state.returnDateIndex).length) return [];
  const times = state.direction === 'out' ? ['12:00', '15:15', '16:45'] : ['13:00', '16:00', '18:00'];
  return times.map((time, index) => ({ id: `${s.id}-${state.returnDateIndex}-${index}`, time, stock: index === 0 ? 0 : index === 1 ? 9 : 5, price: s.price }))
    .filter((r) => state.returnDateIndex > state.dateIndex || timeMinutes(r.time) >= timeMinutes(s.time) + s.minutes + 30);
}
function currentReturn(s) { return returnOptions(s).find((r) => r.id === state.returnId && r.stock > 0); }
function validSelection() { const s = selectedSchedule(); return Boolean(s && s.stock > 0 && (state.mode === 'one' ? s.one : s.round && currentReturn(s))); }
function totalPrice(s) { return s.price + (state.mode === 'round' ? currentReturn(s)?.price || 0 : 0); }
function clearSelection() { state.selected = null; state.returnId = null; state.mode = 'one'; state.returnDateIndex = state.dateIndex; }
function notify(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}
function showView(view, pulse = false) {
  state.view = view;
  document.querySelectorAll('.view-column').forEach((column) => column.classList.toggle('active', column.id === `column-${view}`));
  document.querySelectorAll('.view-tabs button').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  if (pulse) {
    const device = document.getElementById(`${view}-device`);
    device.classList.add('pulse');
    setTimeout(() => device.classList.remove('pulse'), 1200);
    if (window.matchMedia('(max-width:760px)').matches) document.querySelector('.view-tabs').scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
}
function statusBar() { return `<div class="status-bar"><span>9:41</span><span class="status-icons">${icon('signal')}${icon('wifi')}<span class="battery"></span></span></div>`; }
function capsule() { return '<span class="mini-capsule" aria-hidden="true">•••<i></i><b></b></span>'; }
function navbar(title, back = false) { return `<div class="app-navbar">${back ? `<button class="nav-back" data-action="view" data-view="home" aria-label="返回首页">${icon('back')}</button>` : ''}${title}${capsule()}</div>`; }
function bottomNav(active) {
  return `<nav class="app-bottom-nav" aria-label="应用导航">${[['home','首页'],['ship','行程'],['ticket','船票'],['alarm','报警'],['user','会员中心']].map(([name, label]) => `<button class="${name === active ? 'active' : ''} ${name === 'ticket' ? 'ticket-tab' : ''}" data-action="${name === 'home' || name === 'ticket' ? 'view' : 'feature'}" ${name === 'home' || name === 'ticket' ? `data-view="${name === 'home' ? 'home' : 'tickets'}"` : `data-feature="${label}"`} ${name === active ? 'aria-current="page"' : ''}>${name === 'ticket' ? `<span class="ticket-bubble">${icon(name)}</span>` : icon(name)}<span>${label}</span></button>`).join('')}<span class="safe-line"></span></nav>`;
}
function renderHome() {
  const day = DAYS[state.dateIndex];
  document.getElementById('home-screen').innerHTML = `${statusBar()}<div class="app-scroll home-scroll"><div class="home-hero"><div class="home-top"><span class="home-location">${icon('pin')}霞浦 · 海上游</span>${capsule()}</div><div class="hero-copy"><div class="hero-kicker">XIAPU ISLAND ESCAPE</div><h2>去海岛，<br>过慢一点。</h2><p>一张船票，出发去看海。</p></div><span class="hero-label">四礵列岛 · 北礵</span></div><div class="home-content"><div class="quick-card"><div class="quick-title">${icon('ticket')}船票预订<span>官方票务</span></div><div class="quick-routes"><button class="location-select" data-action="open-ports" data-host="home"><span class="field-label">${state.direction === 'out' ? '从哪里出发' : '出发地'}</span><strong>${state.direction === 'out' ? state.port === 'all' ? '全部出发码头' : ports[state.port].replace('码头','') : '北礵岛'}<span class="chevron">⌄</span></strong></button><span class="query-arrow">→</span><button class="location-select" data-action="open-route" data-host="home"><span class="field-label">${state.direction === 'out' ? '去哪里' : '目的地'}</span><strong>${state.direction === 'out' ? '北礵岛' : '大陆码头'}<span class="chevron">⌄</span></strong></button></div><button class="query-date" data-action="calendar" data-host="home">${icon('calendar')}<b>${day.full.slice(5).replace('-','月')}日</b><span>${day.week}出发</span><span class="chevron">⌄</span></button><button class="primary-button" data-action="search">查看可购船票${icon('arrow')}</button><p class="availability-note">${!available(state.dateIndex) ? '当前筛选暂无可购班次，可在船票页调整条件' : state.dateIndex === 1 ? '今天演示班次已结束，默认展示明天可购班次' : '多码头、多船型一起看，选择更轻松'}</p></div><div class="home-tools">${[['book','登岛预约','purple'],['star','景区票务','green'],['weather','潮汐天气','sky'],['ticket','船票预订','peach'],['more','更多','neutral']].map(([name,label,color]) => `<button data-action="${name === 'ticket' ? 'search' : 'feature'}" data-feature="${label}"><span class="tool-icon ${color}">${icon(name)}</span>${label}</button>`).join('')}</div><div class="section-title"><h3>海岛体验</h3><button data-action="open-experiences" data-host="home"><span>更多玩法 ›</span></button></div><div class="experience-grid"><button class="experience-card" data-action="experience" data-feature="四礵列岛环岛游" data-host="home"><h3>四礵列岛环岛游</h3><p>海上环岛 · 8人成团</p><small>探索无人岛海岸 →</small>${icon('ship')}</button><button class="experience-card" data-action="experience" data-feature="西洋列岛精品一日游" data-host="home"><h3>西洋列岛一日游</h3><p>海岛漫游 · 一站式行程</p><small>发现海岛慢生活 →</small>${icon('weather')}</button></div><p class="home-company">霞浦县福宁船务有限公司<br>官方指定票务平台</p></div></div>${bottomNav('home')}`;
}
function bookingControls() {
  return `<div class="booking-controls"><div class="direction-row"><div class="direction-tabs"><button class="${state.direction === 'out' ? 'active' : ''}" data-action="direction" data-direction="out" aria-pressed="${state.direction === 'out'}">上岛</button><button class="${state.direction === 'in' ? 'active' : ''}" data-action="direction" data-direction="in" aria-pressed="${state.direction === 'in'}">离岛</button></div><button class="switch-route" data-action="open-route" data-host="tickets">${icon('swap')}切换航线</button></div><div class="destination-line"><span class="destination-text">${state.direction === 'out' ? '前往北礵岛' : '离岛回大陆'}<small>${state.direction === 'out' ? '选一个合适的班次，海岛等你来。' : '回程班次与实际到达码头一起看。'}</small></span><span class="port-summary">${state.port === 'all' ? '3 个大陆码头' : ports[state.port]}</span></div><div class="date-row">${DAYS.slice(0,5).map((day) => `<button class="date-button ${day.i === state.dateIndex ? 'active' : ''} ${available(day.i) ? '' : 'unavailable'}" data-action="date" data-day="${day.i}" aria-pressed="${day.i === state.dateIndex}"><span class="date-week">${day.week}</span><b>${day.label}</b><span class="date-stock">${available(day.i) ? '有票' : day.i === 0 ? '已结束' : '无班次'}</span></button>`).join('')}<button class="date-more ${state.dateIndex >= 5 ? 'active' : ''}" data-action="calendar" data-host="tickets" aria-label="选择更多出发日期">${icon('calendar')}${state.dateIndex >= 5 ? DAYS[state.dateIndex].label : '更多'}</button></div><p class="date-context">${state.dateIndex === 1 && available(state.dateIndex) ? '今日演示班次已结束，已为你展示最近可购日期' : `已选 ${DAYS[state.dateIndex].full} · ${DAYS[state.dateIndex].week}`} · 演示数据</p></div>`;
}
function filters() {
  return `<div class="ticket-filterbar"><div class="filter-top">${['all','ferry','speed'].map((key) => `<button class="filter-chip ${state.type === key ? 'active' : ''}" data-action="type" data-type="${key}" aria-pressed="${state.type === key}">${types[key]}</button>`).join('')}<button class="filter-chip ${['sym','star'].includes(state.type) ? 'active' : ''}" data-action="open-types" data-host="tickets">${['sym','star'].includes(state.type) ? types[state.type] : '更多'}⌄</button><button class="filter-sort" data-action="sort" aria-label="${state.sort === 'time' ? '切换为价格排序' : '切换为时间排序'}">${state.sort === 'time' ? '时间' : '价格'}${icon('sort')}</button></div><div class="port-chips">${Object.entries(ports).map(([key,name]) => `<button class="filter-chip ${state.port === key ? 'active' : ''}" data-action="port" data-port="${key}" aria-pressed="${state.port === key}">${key === 'all' ? '全部码头' : name.replace('码头','')}</button>`).join('')}</div></div>`;
}
function card(s, passive = false) {
  const [from,to] = route(s);
  return `<article class="schedule-card ${s.id === state.selected ? 'featured' : ''} ${s.stock === 0 ? 'soldout' : ''}" data-schedule="${s.id}"><div class="schedule-top"><div class="schedule-time"><strong>${s.time}</strong><small>约 ${s.minutes} 分钟</small></div><div class="schedule-main"><span class="ship-type ${s.type}">${types[s.type]}</span><h3>${s.name}</h3><div class="schedule-route">${icon('pin')}${from.replace('码头','')} → ${to.replace('码头','')}</div></div><div class="schedule-price"><strong><small>¥</small>${shownPrice(s)}</strong><span class="price-unit">${s.one ? '成人单程' : '成人往返'} / 人</span><span class="stock ${s.stock === 0 ? 'out' : s.stock <= 5 ? 'low' : ''}">${s.stock === 0 ? '已售罄' : s.stock <= 5 ? `仅剩 ${s.stock} 张` : `余票 ${s.stock} 张`}</span></div></div><div class="schedule-bottom"><span>${s.type === 'speed' ? '往返接驳 · 拼船需二次确认' : s.type === 'sym' ? '休闲观光 · 支持当日往返' : '固定班次 · 定点登船'}</span><button class="purchase" data-action="select" data-id="${s.id}" ${s.stock === 0 || passive ? 'disabled' : ''}>${s.stock === 0 ? '已售罄' : '选购'}</button></div></article>`;
}
function renderTickets() {
  const list = filteredSchedules();
  const count = list.filter((s) => s.stock > 0).length;
  document.getElementById('tickets-screen').innerHTML = `${statusBar()}${navbar('船票预订',true)}${bookingControls()}${filters()}<div class="app-scroll results-scroll"><div class="results-label"><span><b>${count} 个可购班次</b> · ${state.sort === 'time' ? '可购优先 · 时间排序' : '可购优先 · 价格排序'}</span><button data-action="open-experiences" data-host="tickets">包船 / 海岛游 ›</button></div>${list.length ? list.map((s) => card(s)).join('') : `<div class="empty-state">${icon('calendar')}<h3>${state.dateIndex === 0 ? '今天的班次已结束' : '这个日期暂无可购班次'}</h3><p>试试其他日期，或查看全部码头与船型。</p><button data-action="next-date">查看最近有票日期</button><br><button data-action="clear-filters">查看全部码头与船型</button></div>`}<div class="notice-inline">${icon('info')}快艇下单成功后仍需确认成团，请留意通知。</div><p class="more-help">已展示当前条件下的全部演示班次</p></div>${bottomNav('ticket')}`;
}
function confirmationMarkup(s) {
  const [from,to] = route(s);
  const rets = returnOptions(s);
  const ret = currentReturn(s);
  const total = totalPrice(s);
  const returnDates = DAYS.filter((day) => day.i >= state.dateIndex && day.i <= state.dateIndex + 2 && (!s.sameDay || day.i === state.dateIndex));
  return `<div class="confirmation-panel"><span class="sheet-handle"></span><div class="sheet-header"><div><h2>确认行程</h2><p>选好班次，再填写乘船人</p></div><button class="close-button" data-action="close-confirm" aria-label="关闭行程确认">${icon('close')}</button></div><div class="sheet-content"><div class="ticket-summary"><div class="summary-title"><span class="ship-type ${s.type}">${types[s.type]}</span><span>${s.name === types[s.type] ? '行程信息' : s.name}</span><small>去程</small></div><div class="summary-route"><div class="summary-port"><strong>${from.replace('码头','')}</strong><small>${from}</small></div><div class="summary-cross"><b>${s.time}</b><div class="route-line"></div>约 ${s.minutes} 分钟</div><div class="summary-port"><strong>${to.replace('码头','')}</strong><small>${to}</small></div></div><div class="summary-date"><span>${DAYS[state.dateIndex].full.slice(5).replace('-','月')}日 · ${DAYS[state.dateIndex].week}</span><b>${s.time} 出发</b></div></div><div class="sheet-label">购票方式<small>以所选班次支持的方式为准</small></div><div class="mode-choices"><button class="mode-choice ${state.mode === 'one' ? 'active' : ''}" data-action="mode" data-mode="one" ${s.one ? '' : 'disabled'} aria-pressed="${state.mode === 'one'}"><b>单程票</b><small>${s.one ? `¥${s.price} / 成人` : '本班次暂不支持'}</small></button><button class="mode-choice ${state.mode === 'round' ? 'active' : ''}" data-action="mode" data-mode="round" ${s.round ? '' : 'disabled'} aria-pressed="${state.mode === 'round'}"><b>往返票</b><small>${s.round ? `¥${s.price * 2} / 成人${s.sameDay ? ' · 当日' : ''}` : '本班次暂不支持'}</small></button></div>${state.mode === 'round' ? `<div class="sheet-label">选择返程<small>到达后预留 30 分钟换乘</small></div><div class="return-date-row">${returnDates.map((day) => `<button class="return-date ${day.i === state.returnDateIndex ? 'active' : ''}" data-action="return-date" data-day="${day.i}" aria-pressed="${day.i === state.returnDateIndex}">${day.i === state.dateIndex ? '同日' : day.i === state.dateIndex + 1 ? '次日' : '第三天'} · ${day.label}</button>`).join('')}</div>${rets.length ? `<div class="return-list">${rets.map((r) => `<button class="return-chip ${r.id === state.returnId ? 'active' : ''}" data-action="return" data-id="${r.id}" ${r.stock ? '' : 'disabled'} aria-pressed="${r.id === state.returnId}">${r.time}<small>${r.stock ? `余票 ${r.stock} 张` : '已售罄'}</small></button>`).join('')}</div>` : '<div class="return-empty">当日没有符合时间条件的返程，请选择更早的去程或其他可售返程日期。</div>'}<p class="return-route">${to} → ${from} · ${ret ? `${ret.time} 出发` : '请选择有票的返程班次'}</p>` : `<div class="return-empty" style="margin-top:14px">本次购买单程船票。需要离岛时，可在船票页切换「离岛」查看返程。</div>`}${s.type === 'speed' ? `<div class="warning-card">${icon('info')}<div><b>快艇拼船需二次确认</b><br>下单成功不等于成团，实际成团及出发安排以平台通知为准。</div></div>` : '<div class="warning-card">'+icon('info')+'<div>出发前请留意班次通知，提前到指定码头候船。</div></div>'}<div class="billing"><span>成人 ${state.mode === 'round' ? '往返' : '单程'}参考价 · 1 人</span><b>${state.mode === 'round' ? `去程 ¥${s.price} + ${ret ? `返程 ¥${ret.price}` : '返程待选'}` : `单程 ¥${s.price}`}</b></div></div><div class="sheet-bottom"><div class="total"><span>${state.mode === 'round' && !ret ? '请选择返程' : '参考合计'}</span><strong><small>${state.mode === 'round' && !ret ? '' : '¥'}</small>${state.mode === 'round' && !ret ? '—' : total}</strong><em>/ 人</em></div><button class="primary-button" data-action="passengers" ${validSelection() ? '' : 'disabled'}>${state.mode === 'round' && !ret ? '请先选择返程' : '填写乘船人'}${icon('arrow')}</button><span class="safe-line"></span></div></div>`;
}
function renderConfirm() {
  const s = selectedSchedule();
  const background = `<div class="confirm-background" inert aria-hidden="true">${statusBar()}${navbar('船票预订')}${bookingControls()}${filters()}<div class="results-scroll">${filteredSchedules().slice(0,3).map((item) => card(item,true)).join('')}</div>${bottomNav('ticket')}</div>`;
  document.getElementById('confirm-screen').innerHTML = `${background}${s ? '<div class="confirm-scrim"></div>'+confirmationMarkup(s) : `<div class="confirm-idle">${icon('ticket')}<h3>选好班次，就能确认行程</h3><p>在船票页点击「选购」，<br>这里会展示对应的单程或往返方案。</p><button data-action="view" data-view="tickets">去选择班次 →</button></div>`}`;
}
function sheet(content) { return `<div class="overlay-sheet" role="dialog" aria-modal="true" aria-label="${state.overlay.label}"><div class="overlay-heading"><div><h3>${state.overlay.label}</h3><p>同页选择，随时调整</p></div><button class="close-button" data-action="close-overlay" aria-label="关闭弹层">${icon('close')}</button></div>${content}</div>`; }
function renderOverlay() {
  if (!state.overlay) return;
  const o = state.overlay;
  let content = '';
  if (o.kind === 'ports') content = Object.entries(ports).map(([key,name]) => `<button class="option-row ${state.port === key ? 'active' : ''}" data-action="port" data-port="${key}"><span>${key === 'all' ? '全部出发码头' : name}<small>${key === 'all' ? '同时比较三个码头的可购班次' : key === 'jishi' ? '客渡船固定班次' : key === 'dongbi' ? '快艇拼船接驳' : '快艇拼船、山海交响号、北礵之星'}</small></span>${state.port === key ? '✓' : '›'}</button>`).join('');
  if (o.kind === 'route') content = ['out','in'].map((direction) => `<button class="option-row ${state.direction === direction ? 'active' : ''}" data-action="direction" data-direction="${direction}"><span>${direction === 'out' ? '上岛 · 前往北礵岛' : '离岛 · 返回大陆码头'}<small>${direction === 'out' ? '聚合积石、东壁、三沙出发班次' : '从北礵码头出发，比较大陆到达码头'}</small></span>${state.direction === direction ? '✓' : '›'}</button>`).join('') + '<p class="overlay-note">其他目的地与环岛行程，请从「海岛体验」入口查看。</p>';
  if (o.kind === 'types') content = Object.entries(types).map(([key,name]) => `<button class="option-row ${state.type === key ? 'active' : ''}" data-action="type" data-type="${key}">${name}<span>${state.type === key ? '✓' : '›'}</span></button>`).join('');
  if (o.kind === 'calendar') {
    const first = new Date(Date.UTC(2026, calendarMonth, 1)).getUTCDay();
    const count = new Date(Date.UTC(2026, calendarMonth + 1, 0)).getUTCDate();
    content = `<div class="calendar-title"><button data-action="month" data-delta="-1" ${calendarMonth === 9 ? 'disabled' : ''} aria-label="上个月">‹</button><b>2026 年 ${calendarMonth + 1} 月</b><button data-action="month" data-delta="1" ${calendarMonth === 10 ? 'disabled' : ''} aria-label="下个月">›</button></div><div class="calendar-grid">${['日','一','二','三','四','五','六'].map((w) => `<span class="calendar-week">${w}</span>`).join('')}${'<span></span>'.repeat(first)}${Array.from({length:count},(_,i) => {
      const d = DAYS.find((day) => day.full === `2026-${String(calendarMonth + 1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`);
      return `<button class="calendar-day ${d && state.dateIndex === d.i ? 'active' : ''}" data-action="date" ${d ? `data-day="${d.i}"` : 'disabled'}>${i+1}<small>${d ? available(d.i) ? '有票' : '无班次' : '—'}</small></button>`;
    }).join('')}</div><p class="overlay-note">演示开放日期：10 月 8 日至 21 日。无班次的日期可查看空态，不会自动替用户更改日期。</p>`;
  }
  if (o.kind === 'experiences') content = [['包船出游','整船预订，按出行需求选择'],['四礵列岛环岛游','8人成团 · 海上环岛约90分钟'],['西洋列岛精品一日游','独立行程产品，含多站游览']].map(([title,desc]) => `<button class="option-row" data-action="experience" data-feature="${title}" data-host="${o.host}"><span>${title}<small>${desc}</small></span>›</button>`).join('') + '<p class="overlay-note">交通船票与游览产品保留独立入口，避免混淆班次和成团规则。</p>';
  if (o.kind === 'experience') content = `<div class="passenger-summary">${o.feature === '四礵列岛环岛游' ? '北礵码头登船，海上环岛约90分钟，8人成团。沿途观看岛屿，全程不登无人岛。' : o.feature === '包船出游' ? '按出行日期、人数与目的地查看包船方案，由独立包船流程完成预订。' : '从外浒码头出发，串联西洋列岛游览与海岛行程，由独立旅游产品流程完成预订。'}</div><button class="primary-button" data-action="experience-preview">了解预订流程 ${icon('arrow')}</button><p class="overlay-note">这里只展示入口和产品定位；详细产品预订沿用现有业务流程。</p>`;
  if (o.kind === 'passengers') {
    const s = selectedSchedule();
    if (!validSelection()) { state.overlay = null; return; }
    const [from,to] = route(s);
    content = `<div class="passenger-summary">${DAYS[state.dateIndex].full} · ${s.time}<br>${from} → ${to}<br>${types[s.type]} · ${state.mode === 'round' ? `往返 · 返程 ${DAYS[state.returnDateIndex].label} ${currentReturn(s).time}` : '单程'} · 成人参考价 ¥${totalPrice(s)}/人</div><form class="passenger-form" id="passenger-form"><label>乘船人（示例）<input value="体验乘客" readonly aria-label="演示乘船人"></label><label>联系方式（示例）<input value="138 **** 0000" readonly aria-label="演示联系方式"></label><button class="primary-button" type="submit">完成流程体验 ${icon('check')}</button></form><p class="passenger-note">此处仅示意进入填写乘船人的页面，正式页面沿用实名信息、票种及退改规则。不会创建订单或发起支付。</p>`;
  }
  if (o.kind === 'success') content = `<div class="demo-success">${icon('check')}<h3>购票流程体验完成</h3><p>你已经从聚合班次页进入乘船人填写。<br>这是界面原型，未创建订单或发起付款。</p><button class="primary-button" data-action="close-overlay">返回行程确认</button></div>`;
  const overlay = document.createElement('div');
  overlay.className = 'screen-overlay';
  overlay.dataset.action = 'dismiss-backdrop';
  overlay.innerHTML = sheet(content);
  document.getElementById(`${o.host}-screen`).append(overlay);
}
function render() {
  // 重绘时保留手机内容的滚动位置，避免筛选和关闭弹层造成跳动。
  const scrolls = new Map(Array.from(document.querySelectorAll('.app-scroll,.sheet-content')).map((el) => [`${el.closest('.device-screen').id}-${el.className}`, el.scrollTop]));
  renderHome(); renderTickets(); renderConfirm(); renderOverlay(); showView(state.view);
  document.querySelectorAll('.app-scroll,.sheet-content').forEach((el) => { el.scrollTop = scrolls.get(`${el.closest('.device-screen').id}-${el.className}`) || 0; });
  if (state.overlay) document.querySelector('.screen-overlay .close-button')?.focus({ preventScroll: true });
}
function openOverlay(kind, host, label, feature) { focusReturn = document.activeElement?.dataset.action; state.overlay = {kind,host,label,feature}; render(); }
function closeOverlay() {
  const host = state.overlay?.host;
  state.overlay = null; render();
  if (host && focusReturn) document.getElementById(`${host}-screen`).querySelector(`[data-action="${focusReturn}"]`)?.focus({preventScroll:true});
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled || button.closest('.confirm-background')) return;
  const action = button.dataset.action;
  if (action === 'dismiss-backdrop') { if (event.target === button) closeOverlay(); return; }
  if (state.overlay && !button.closest('.screen-overlay')) return;
  if (action === 'view') { showView(button.dataset.view,true); return; }
  if (action === 'feature') { notify(`${button.dataset.feature}保留现有入口，本原型聚焦船票购票。`); return; }
  if (action === 'experience-preview') { notify('该产品进入独立预订流程，本原型展示入口与定位。'); return; }
  if (action === 'open-ports') { openOverlay('ports',button.dataset.host,'选择大陆码头'); return; }
  if (action === 'open-route') { openOverlay('route',button.dataset.host,'选择出行方向'); return; }
  if (action === 'open-types') { openOverlay('types',button.dataset.host,'选择船型'); return; }
  if (action === 'calendar') { calendarMonth = 9; openOverlay('calendar',button.dataset.host,'选择出发日期'); return; }
  if (action === 'open-experiences') { openOverlay('experiences',button.dataset.host,'包船与海岛体验'); return; }
  if (action === 'experience') { openOverlay('experience',button.dataset.host,button.dataset.feature,button.dataset.feature); return; }
  if (action === 'month') { calendarMonth = Math.max(9,Math.min(10,calendarMonth+Number(button.dataset.delta))); render(); return; }
  if (action === 'close-overlay') { closeOverlay(); return; }
  if (action === 'passengers') { if (validSelection()) openOverlay('passengers','confirm','填写乘船人 · 流程示意'); return; }
  if (action === 'reset') { state = initialState(); render(); notify('已恢复默认演示。'); return; }
  if (action === 'search') { clearSelection(); state.overlay = null; render(); showView('tickets',true); return; }
  if (['date','type','port','direction','clear-filters'].includes(action)) {
    if (action === 'date') { const day = Number(button.dataset.day); if (!DAYS[day]) return; state.dateIndex = day; }
    if (action === 'type') { if (!types[button.dataset.type]) return; state.type = button.dataset.type; }
    if (action === 'port') { if (!ports[button.dataset.port]) return; state.port = button.dataset.port; }
    if (action === 'direction') { if (!['out','in'].includes(button.dataset.direction)) return; state.direction = button.dataset.direction; }
    if (action === 'clear-filters') { state.type = 'all'; state.port = 'all'; }
    state.overlay = null; clearSelection(); render(); return;
  }
  if (action === 'next-date') { const day = nextAvailable(); if (day !== undefined) { state.dateIndex = day; clearSelection(); } else notify('当前码头与船型没有可售班次，请查看全部码头与船型。'); render(); return; }
  if (action === 'sort') { state.sort = state.sort === 'time' ? 'price' : 'time'; render(); return; }
  if (action === 'select') {
    const s = filteredSchedules().find((item) => item.id === button.dataset.id && item.stock > 0);
    if (!s) return;
    state.selected = s.id; state.mode = s.one ? 'one' : 'round'; state.returnDateIndex = state.dateIndex; state.returnId = null; render(); showView('confirm',true); return;
  }
  if (action === 'close-confirm') { clearSelection(); render(); showView('tickets',true); return; }
  if (action === 'mode') {
    const s = selectedSchedule();
    if (!s || (button.dataset.mode === 'one' && !s.one) || (button.dataset.mode === 'round' && !s.round)) return;
    state.mode = button.dataset.mode; state.returnId = null; render(); return;
  }
  if (action === 'return-date') { const s = selectedSchedule(); const day = Number(button.dataset.day); if (!s || !DAYS[day] || day < state.dateIndex || day > state.dateIndex + 2 || (s.sameDay && day !== state.dateIndex)) return; state.returnDateIndex = day; state.returnId = null; render(); return; }
  if (action === 'return') { const s = selectedSchedule(); const r = returnOptions(s).find((item) => item.id === button.dataset.id && item.stock > 0); if (!r) return; state.returnId = r.id; render(); }
});
document.addEventListener('submit', (event) => {
  if (event.target.id !== 'passenger-form') return;
  event.preventDefault();
  if (!validSelection()) return;
  state.overlay = {kind:'success',host:'confirm',label:'流程体验'}; render();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (state.overlay) closeOverlay();
    else if (state.view === 'confirm') { clearSelection(); render(); showView('tickets'); }
  }
  if (event.key === 'Tab' && state.overlay) {
    const dialog = document.querySelector('.screen-overlay [role="dialog"]');
    const controls = Array.from(dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),a[href]'));
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
render();
