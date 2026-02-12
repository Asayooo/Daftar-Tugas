function ambilTugas() {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}

function simpanTugas(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function hitungSisaHari(deadline) {
  const d = new Date(deadline);
  const today = new Date();
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function tampilkanNotifikasi(tasks) {
  const box = document.getElementById("notif");
  let pesan = [];

  const today = new Date().toISOString().split("T")[0];

  tasks.forEach(t => {
    if (!t.selesai) {
      if (t.deadline === today) {
        pesan.push(`⚠️ "${t.nama}" deadline HARI INI`);
      } else if (t.deadline < today) {
        pesan.push(`⛔ "${t.nama}" sudah TELAT`);
      }
    }
  });

  if (pesan.length > 0) {
    box.style.display = "block";
    box.innerHTML = pesan.join("<br>");
  } else {
    box.style.display = "none";
  }
}

function render(tasks = ambilTugas()) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tampilkanNotifikasi(tasks);

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

// PENCARIAN
document.addEventListener("DOMContentLoaded", () => {
  render();

  const search = document.getElementById("search");
  if (search) {
    search.addEventListener("input", () => {
      const keyword = search.value.toLowerCase();
      const tasks = ambilTugas().filter(t =>
        t.nama.toLowerCase().includes(keyword) ||
        t.mapel.toLowerCase().includes(keyword)
      );
      render(tasks);
    });
  }
});

if ("Notification" in window) {
  Notification.requestPermission();
}

async function smartReminder() {
  const tasks = ambilTugas();
  const today = new Date().toISOString().split("T")[0];

  const sw = await navigator.serviceWorker.ready;

  tasks.forEach(t => {
    if (t.selesai) return;

    const sisa = hitungSisaHari(t.deadline);

    const notifKey = `notif-${t.nama}-${today}`;
    if (localStorage.getItem(notifKey)) return;

    let title = "";
    let body = "";

    if (sisa === 3) {
      title = "⏳ 3 Hari Lagi";
      body = `"${t.nama}" tinggal 3 hari lagi`;
    }
    else if (sisa === 1) {
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

    if (title) {
      sw.active.postMessage({
        type: "SMART_REMINDER",
        title,
        body
      });

      localStorage.setItem(notifKey, "sent");
    }
  });
}

// cek tiap 5 menit
setInterval(smartReminder, 5 * 60 * 1000);

