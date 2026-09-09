const paymentRadios = document.getElementsByName("payment");
const flipCard = document.getElementById("flipCard");
const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");

// ✅ Día mínimo desde hoy
const today = new Date().toISOString().split("T")[0];
dateInput.setAttribute("min", today);

// ✅ Generar horarios 9:00 AM → 8:00 PM cada 20 min
function generarHorarios() {
  let start = 9 * 60; // 9:00 en minutos
  let end = 20 * 60; // 8:00 PM en minutos

  for (let min = start; min <= end; min += 20) {
    let h = Math.floor(min / 60);
    let m = min % 60;
    let hora = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

    // Convertir a formato AM/PM
    let ampm = h >= 12 ? "PM" : "AM";
    let h12 = h % 12 || 12;

    let option = document.createElement("option");
    option.value = hora;
    option.textContent = `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
    timeSelect.appendChild(option);
  }
}

generarHorarios();

// ✅ Girar tarjeta si elige transferencia
paymentRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    if (radio.value === "transferencia") {
      flipCard.classList.add("rotated");
    } else {
      flipCard.classList.remove("rotated");
    }
  });
});

// ✅ Alert en ambos formularios
document.getElementById("appointmentForm").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Cita agendada exitosamente ✅");
});

document.getElementById("transferForm").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Cita agendada exitosamente ✅");
});

//Volver a la car frontal
document.getElementById("volverBtn").addEventListener("click", () => {
  flipCard.classList.remove("rotated");
});