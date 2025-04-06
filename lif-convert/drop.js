document.addEventListener("DOMContentLoaded", function () {

  const dropZone = document.getElementById('lifInput');

  // Prevent default behavior for drag events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => e.preventDefault());
  });

  // Highlight when dragging
  dropZone.addEventListener('dragover', () => {
    dropZone.style.border = '2px dashed #4caf50';
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.border = '';
  });

  dropZone.addEventListener('drop', (e) => {
    dropZone.style.border = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('text')) {
      const reader = new FileReader();
      reader.onload = function(event) {
        dropZone.value = event.target.result;
      };
      reader.readAsText(file);
    } else {
      alert("Please drop a text file.");
    }
  });

});