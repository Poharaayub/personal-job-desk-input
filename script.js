const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const previewList = document.getElementById('previewList');

let capturedImages = [];

// === Inisialisasi Kamera Belakang ===
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: "environment" } },
  audio: false
})
.then((stream) => {
  video.srcObject = stream;
})
.catch((err) => {
  alert("Gagal mengakses kamera: " + err.message);
});

// === Simpan ke localStorage ===
function saveToLocal() {
  localStorage.setItem("capturedImages", JSON.stringify(capturedImages));
}

// === Load dari localStorage saat halaman dimuat ===
function loadFromLocal() {
  const data = localStorage.getItem("capturedImages");
  if (data) {
    capturedImages = JSON.parse(data);
    capturedImages.forEach(img => addImageToPreview(img));
  }
}

// === Tambahkan gambar ke tampilan preview ===
function addImageToPreview(imageData) {
  const wrapper = document.createElement('div');
  wrapper.className = "preview-item";

  const img = document.createElement('img');
  img.src = imageData;

  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = "Hapus";
  deleteBtn.className = "delete-btn";
  deleteBtn.onclick = () => {
    previewList.removeChild(wrapper);
    capturedImages = capturedImages.filter((img) => img !== imageData);
    saveToLocal();
  };

  wrapper.appendChild(img);
  wrapper.appendChild(deleteBtn);
  previewList.appendChild(wrapper);
}

// === Fungsi Ambil Foto ===
captureBtn.addEventListener('click', () => {
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Tambahkan stamp hari + waktu
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayName = days[now.getDay()];
  const stampText = `${dayName}, ${now.toLocaleString()}`;

  context.fillStyle = 'white';
  context.font = '24px Arial';
  context.fillText(stampText, 10, canvas.height - 20);

  const imageData = canvas.toDataURL('image/jpeg');
  capturedImages.push(imageData);
  addImageToPreview(imageData);
  saveToLocal();
});

// === Fungsi Download PDF ===
downloadPdfBtn.addEventListener('click', async () => {
  if (capturedImages.length === 0) {
    alert("Belum ada foto yang diambil.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  for (let i = 0; i < capturedImages.length; i++) {
    const imgData = capturedImages[i];
    const img = new Image();
    img.src = imgData;

    await new Promise((resolve) => {
      img.onload = () => {
        const imgWidth = 210;
        const ratio = img.height / img.width;
        const imgHeight = imgWidth * ratio;

        if (i > 0) pdf.addPage();
        pdf.addImage(img, 'JPEG', 0, 0, imgWidth, imgHeight);
        resolve();
      };
    });
  }

  pdf.save("foto-stamp.pdf");
});

// === Fungsi Hapus Semua ===
clearAllBtn.addEventListener('click', () => {
  if (confirm("Yakin ingin menghapus semua foto?")) {
    capturedImages = [];
    previewList.innerHTML = "";
    localStorage.removeItem("capturedImages");
  }
});

// === Load saat halaman dibuka ===
window.addEventListener('load', loadFromLocal);