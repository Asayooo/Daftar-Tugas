// =====================
// NOTIFICATION SETUP
// =====================

async function initApp() {
  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }

  render();
  smartReminder();
}

async function getSW() {
  return await navigator.serviceWorker.ready;
}

// =====================
// STORAGE
// =====================

function ambilTugas() {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}

function simpanTugas(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// =====================
// UTIL
// =====================

function hitungSisaHari(deadline) {
  const d = new Date(deadline);
  const today = new Date();
  today.setHours(0,0,0,0);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

// =====================
// RENDER
// =====================

function render(tasks = ambilTugas()) {
  const list = document.getElementById("taskList");
  if (!list) return;

  list.innerHTML = "";

  tasks.forEach((t, i) => {
    const sisa = hitungSisaHari(t.deadline);
    const sisaText =
      sisa > 0 ? `${sisa} hari lagi` :
      sisa === 0 ? "HARI INI" :
      `${Math.abs(sisa)} hari TELAT`;

    const div = document.createElement("div");

    let today = new Date().toISOString().split("T")[0];
    let isLate = (!t.selesai && t.deadline < today);

    div.className = "task "
      + (t.selesai ? "done " : "")
      + (isLate ? "late" : "");

    div.innerHTML = `
      <div class="title">${t.nama}</div>
      <div class="meta">📘 ${t.mapel}</div>
      <div class="meta">⏰ Deadline: ${t.deadline}</div>
      <div class="meta">🕒 Sisa: ${sisaText}</div>
      <div class="flex">
        <button class="btn-success" onclick="toggleSelesai(${i})">
          ${t.selesai ? "↩️ Batal" : "☑️ Selesai"}
        </button>
        <button class="btn-warning" onclick="edit(${i})">✏️ Edit</button>
        <button class="btn-danger" onclick="hapus(${i})">🗑️ Hapus</button>
      </div>
    `;
    list.appendChild(div);
  });
}

// =====================
// CRUD
// =====================

function toggleSelesai(i) {
  let tasks = ambilTugas();
  tasks[i].selesai = !tasks[i].selesai;
  simpanTugas(tasks);
  render(tasks);
}

function hapus(i) {
  if (!confirm("Hapus tugas ini?")) return;
  let tasks = ambilTugas();
  tasks.splice(i, 1);
  simpanTugas(tasks);
  render(tasks);
}

function edit(i) {
  window.location.href = "add.html?id=" + i;
}

// =====================
// SMART REMINDER
// =====================

async function smartReminder() {
  if (Notification.permission !== "granted") return;

  const tasks = ambilTugas();
  const sw = await getSW();

  tasks.forEach(t => {
    if (t.selesai) return;

    const sisa = hitungSisaHari(t.deadline);

    let title = "";
    let body = "";

    if (sisa === 1) {
      title = "⚠️ Besok Deadline!";
      body = `"${t.nama}" tinggal 1 hari lagi`;
    }
    else if (sisa === 0) {
      title = "🚨 Deadline Hari Ini!";
      body = `"${t.nama}" harus dikumpulkan hari ini!`;
    }
    else if (sisa < 0) {
      title = "❌ Sudah Telat!";
      body = `"${t.nama}" sudah lewat deadline`;
    }

    if (title && sw.active) {
      sw.active.postMessage({
        type: "SMART_REMINDER",
        title,
        body
      });
    }
  });
}

// =====================
// SOUND HANDLER
// =====================

navigator.serviceWorker.addEventListener("message", event => {
  if (event.data === "PLAY_SOUND") {
    const audio = new Audio("notif.mp3");
    audio.play();
  }
});

// =====================
// INIT
// =====================

document.addEventListener("DOMContentLoaded", initApp);

// cek tiap 5 menit
setInterval(smartReminder, 5 * 60 * 1000);
