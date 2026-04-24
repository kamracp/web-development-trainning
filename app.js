const profiles = {
  pump: { intensity: 0.58, unit: 'm³/h' },
  compressor: { intensity: 0.95, unit: 'Nm³/h' },
  fan: { intensity: 0.43, unit: 'm³/h' },
  conveyor: { intensity: 0.52, unit: 't/h' },
};

const num = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function value(id) {
  return Number(document.querySelector(id).value);
}

function write(id, text) {
  document.querySelector(id).textContent = text;
}

function setupModuleSwitching() {
  const buttons = [...document.querySelectorAll('.module-btn')];
  const panels = {
    sizing: document.querySelector('#module-sizing'),
    air: document.querySelector('#module-air'),
    saving: document.querySelector('#module-saving'),
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const module = button.dataset.module;
      buttons.forEach((b) => {
        const active = b === button;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      Object.entries(panels).forEach(([key, panel]) => {
        const visible = key === module;
        panel.classList.toggle('is-visible', visible);
        panel.hidden = !visible;
      });
    });
  });
}

function setupSizingModule() {
  document.querySelector('#sizingForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const equipment = document.querySelector('#sizingEquipment').value;
    const throughput = value('#throughput');
    const utilization = value('#utilization') / 100;
    const margin = value('#margin') / 100;
    const efficiency = value('#efficiency') / 100;
    const hours = value('#hours');
    const price = value('#powerPrice');

    const profile = profiles[equipment];
    const installedCapacity = throughput * (1 + margin);
    const shaftPower = installedCapacity * utilization * profile.intensity;
    const motorRating = shaftPower / efficiency;
    const dailyEnergy = motorRating * hours;
    const dailyCost = dailyEnergy * price;

    write('#sizingCapacity', `${num.format(installedCapacity)} ${profile.unit}`);
    write('#sizingMotor', `${num.format(motorRating)} kW`);
    write('#sizingEnergy', `${num.format(dailyEnergy)} kWh/day`);
    write('#sizingCost', `${money.format(dailyCost)}/day`);
  });
}

function setupAirAuditModule() {
  document.querySelector('#airForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const pressure = value('#pressure');
    const leakArea = value('#leakArea');
    const specificPower = value('#specificPower');
    const hours = value('#airHours');
    const price = value('#airPrice');

    const leakFlowM3Min = 0.0065 * leakArea * Math.sqrt(pressure * 14.5);
    const leakPower = leakFlowM3Min * specificPower;
    const annualEnergy = leakPower * hours;
    const annualCost = annualEnergy * price;

    write('#airFlow', `${num.format(leakFlowM3Min)} m³/min`);
    write('#airPower', `${num.format(leakPower)} kW`);
    write('#airEnergy', `${num.format(annualEnergy)} kWh/year`);
    write('#airCost', `${money.format(annualCost)}/year`);
  });
}

function setupEnergySavingModule() {
  document.querySelector('#savingForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const baselineSec = value('#baseSec');
    const improvedSec = value('#improvedSec');
    const production = value('#production');
    const tariff = value('#savePrice');
    const projectCost = value('#projectCost');

    const secDelta = baselineSec - improvedSec;
    const annualEnergySaved = secDelta * production;
    const annualCostSaved = annualEnergySaved * tariff;
    const annualCo2SavedTons = (annualEnergySaved * 0.7) / 1000;
    const paybackYears = annualCostSaved > 0 ? projectCost / annualCostSaved : 0;

    write('#saveEnergy', `${num.format(annualEnergySaved)} kWh/year`);
    write('#saveCost', `${money.format(annualCostSaved)}/year`);
    write('#saveCo2', `${num.format(annualCo2SavedTons)} tCO₂/year`);
    write('#savePayback', `${num.format(paybackYears)} years`);
  });
}

setupModuleSwitching();
setupSizingModule();
setupAirAuditModule();
setupEnergySavingModule();
