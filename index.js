const sectors = [
  { color: "#19365F", text: "#FFFFFFFF", label: "Caderno" },
  { color: "#299DF3", text: "#FFFFFFFF", label: "Pen" },
  { color: "#0361E9", text: "#FFFFFFFF", label: "Protetor\n de câmara" },
  { color: "#19365F", text: "#FFFFFFFF", label: "Suporte de\n telemóvel" },
  { color: "#299DF3", text: "#FFFFFFFF", label: "Caneta" },
  { color: "#0361E9", text: "#FFFFFFFF", label: "Fita" },
];

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
    if (this.listeners[eventName]) {
      for (let fn of this.listeners[eventName]) {
        fn(...args);
      }
    }
  },
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;

const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0; // Angular velocity
let ang = 0; // Angle in radians

let spinButtonClicked = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();

  // COLOR
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  // TEXT
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = sector.text;
  ctx.font = "bold 20px 'Montserrat', sans-serif";
  ctx.fillText(sector.label, rad - 10, 10);
  //

  ctx.restore();
}

function rotate() {
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

  spinEl.textContent = !angVel ? "SPIN" : sector.label;
  spinEl.style.background = sector.color;
  spinEl.style.color = sector.text;
}

function frame() {
  // Fire an event after the wheel has stopped spinning
  if (!angVel && spinButtonClicked) {
    const finalSector = sectors[getIndex()];
    events.fire("spinEnd", finalSector);
    spinButtonClicked = false; // reset the flag
    return;
  }

  angVel *= friction; // Decrement velocity by friction
  if (angVel < 0.002) angVel = 0; // Bring to stop
  ang += angVel; // Update angle
  ang %= TAU; // Normalize angle
  rotate();
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

function init() {
  sectors.forEach(drawSector);
  rotate(); // Initial rotation
  engine(); // Start engine
  spinEl.addEventListener("click", () => {
    if (!angVel) angVel = rand(0.25, 0.45);
    spinButtonClicked = true;
  });
}

init();

events.addListener("spinEnd", (sector) => {
  console.log(`Woop! You won ${sector.label}`);
});

function showPopup(prize) {
  // Criar o fundo escuro para o efeito de overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "999";

  // Criar o pop-up
  const popup = document.createElement("div");
  popup.style.background = "#ffffff";
  popup.style.padding = "25px";
  popup.style.borderRadius = "12px";
  popup.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";
  popup.style.textAlign = "center";
  popup.style.width = "300px";
  popup.style.animation = "fadeIn 0.3s ease-in-out";

  // Adicionar o texto do prêmio
  popup.innerHTML = `
  <h2 style="margin: 0; font-size: 22px; color: #19365F; font-family: 'Montserrat', sans-serif;">🎉 Parabéns! 🎉</h2>
  <p style="font-size: 18px; color: #444; font-family: 'Montserrat', sans-serif;">Você ganhou:</p>
  <p style="font-size: 20px; font-weight: bold; color: #0361E9; font-family: 'Montserrat', sans-serif;">${prize}</p>
`;


  // Criar botão de fechar
  const closeButton = document.createElement("button");
  closeButton.textContent = "Fechar";
  closeButton.style.marginTop = "15px";
  closeButton.style.padding = "10px 15px";
  closeButton.style.background = "#299DF3";
  closeButton.style.color = "#ffffff";
  closeButton.style.border = "none";
  closeButton.style.cursor = "pointer";
  closeButton.style.borderRadius = "5px";
  closeButton.style.fontFamily = "'Montserrat', sans-serif";
  closeButton.style.fontSize = "16px";
  closeButton.style.transition = "0.3s";

  // Efeito hover no botão
  closeButton.onmouseover = () => (closeButton.style.background = "#0361E9");
  closeButton.onmouseout = () => (closeButton.style.background = "#299DF3");

  // Fechar pop-up ao clicar no botão
  closeButton.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  popup.appendChild(closeButton);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}

// Evento ao finalizar o giro
events.addListener("spinEnd", (sector) => {
  showPopup(sector.label);
});

const editButton = document.createElement("button");
editButton.textContent = "Alterar Dados";
editButton.style.marginTop = "15px";
editButton.style.padding = "10px 15px";
editButton.style.background = "#19365F";
editButton.style.color = "#ffffff";
editButton.style.border = "none";
editButton.style.cursor = "pointer";
editButton.style.borderRadius = "5px";
editButton.style.fontFamily = "'Montserrat', sans-serif";
editButton.style.fontSize = "16px";
editButton.style.transition = "0.3s";
document.body.appendChild(editButton);

editButton.addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0, 0, 0, 0.5)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "999";

    const popup = document.createElement("div");
    popup.style.background = "#ffffff";
    popup.style.padding = "20px";
    popup.style.borderRadius = "12px";
    popup.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";
    popup.style.textAlign = "center";
    popup.style.fontFamily = "'Montserrat', sans-serif";
    popup.style.width = "350px";
    popup.innerHTML = "<h2 style='color: #19365F;'>Alterar Itens</h2>";

    const inputFields = [];

    sectors.forEach((sector, index) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = sector.label;
        input.style.width = "90%";
        input.style.marginBottom = "10px";
        input.style.padding = "5px";
        input.style.border = "1px solid #ddd";
        input.style.borderRadius = "5px";
        input.style.fontSize = "16px";
        inputFields.push(input);
        popup.appendChild(input);
    });

    const saveButton = document.createElement("button");
    saveButton.textContent = "Salvar";
    saveButton.style.marginTop = "15px";
    saveButton.style.padding = "10px 15px";
    saveButton.style.background = "#299DF3";
    saveButton.style.color = "#ffffff";
    saveButton.style.border = "none";
    saveButton.style.cursor = "pointer";
    saveButton.style.borderRadius = "5px";
    saveButton.style.fontSize = "16px";
    saveButton.style.transition = "0.3s";

    saveButton.addEventListener("click", () => {
        inputFields.forEach((input, index) => {
            sectors[index].label = input.value;
        });
        ctx.clearRect(0, 0, dia, dia);
        sectors.forEach(drawSector);
        document.body.removeChild(overlay);
    });

    popup.appendChild(saveButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
});
