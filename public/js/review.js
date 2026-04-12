(function () {
  'use strict';

  // ===== Corner adjustment UI =====
  const img = document.getElementById('originalImg');
  const container = document.getElementById('cornerContainer');
  const cornersInput = document.getElementById('cornersInput');

  if (!img || !container) return;

  let naturalW = 0, naturalH = 0;
  let corners = [[0, 0], [0, 0], [0, 0], [0, 0]];

  function imgToDisplay(nx, ny) {
    const rect = img.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    const scaleX = rect.width / naturalW;
    const scaleY = rect.height / naturalH;
    return [
      (nx * scaleX) + (rect.left - cRect.left),
      (ny * scaleY) + (rect.top - cRect.top),
    ];
  }

  function displayToImg(dx, dy) {
    const rect = img.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    const scaleX = rect.width / naturalW;
    const scaleY = rect.height / naturalH;
    return [
      (dx - (rect.left - cRect.left)) / scaleX,
      (dy - (rect.top - cRect.top)) / scaleY,
    ];
  }

  function positionHandle(handle, nx, ny) {
    const [dx, dy] = imgToDisplay(nx, ny);
    handle.style.left = dx + 'px';
    handle.style.top = dy + 'px';
  }

  function initHandles() {
    if (!naturalW || !naturalH) return;

    // Try to parse saved corners
    const saved = typeof INITIAL_CORNERS !== 'undefined' ? INITIAL_CORNERS : null;
    if (saved && Array.isArray(saved) && saved.length === 4) {
      corners = saved;
    } else {
      // Default: image corners
      corners = [
        [0, 0],
        [naturalW, 0],
        [naturalW, naturalH],
        [0, naturalH],
      ];
    }
    renderHandles();
    updateHiddenInput();
  }

  function renderHandles() {
    [0, 1, 2, 3].forEach(function (i) {
      const h = document.getElementById('h' + i);
      if (h) positionHandle(h, corners[i][0], corners[i][1]);
    });
  }

  function updateHiddenInput() {
    if (cornersInput) cornersInput.value = JSON.stringify(corners);
  }

  // Make handles draggable
  function makeDraggable(handle, idx) {
    let dragging = false;
    let startX, startY, origLeft, origTop;

    handle.addEventListener('mousedown', function (e) {
      e.preventDefault();
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseFloat(handle.style.left) || 0;
      origTop = parseFloat(handle.style.top) || 0;
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newLeft = origLeft + dx;
      const newTop = origTop + dy;
      handle.style.left = newLeft + 'px';
      handle.style.top = newTop + 'px';
      const [nx, ny] = displayToImg(newLeft, newTop);
      corners[idx] = [Math.round(nx), Math.round(ny)];
      updateHiddenInput();
    });

    document.addEventListener('mouseup', function () {
      dragging = false;
    });
  }

  [0, 1, 2, 3].forEach(function (i) {
    const h = document.getElementById('h' + i);
    if (h) makeDraggable(h, i);
  });

  if (img.complete && img.naturalWidth) {
    naturalW = img.naturalWidth;
    naturalH = img.naturalHeight;
    initHandles();
  } else {
    img.addEventListener('load', function () {
      naturalW = img.naturalWidth;
      naturalH = img.naturalHeight;
      initHandles();
    });
  }

  window.addEventListener('resize', renderHandles);

  // ===== Save corners =====
  window.saveCorners = function (photoId) {
    const id = typeof PHOTO_ID !== 'undefined' ? PHOTO_ID : photoId;
    const val = cornersInput ? cornersInput.value : null;
    if (!val) return;
    fetch('/photos/' + id + '/corners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ corners: val }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          alert('Corners saved. Photo will be reprocessed.');
          location.reload();
        }
      })
      .catch(function (err) { console.error(err); });
  };

  window.resetCorners = function () {
    corners = [[0, 0], [naturalW, 0], [naturalW, naturalH], [0, naturalH]];
    renderHandles();
    updateHiddenInput();
  };

  // ===== People tagging =====
  fetch('/api/people')
    .then(function (r) { return r.json(); })
    .then(function (people) {
      const sel = document.getElementById('personSelect');
      if (!sel) return;
      people.forEach(function (p) {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        sel.appendChild(opt);
      });
    })
    .catch(function () {});

  window.addTag = function (photoId) {
    const sel = document.getElementById('personSelect');
    if (!sel || !sel.value) return;
    fetch('/api/photos/' + photoId + '/tag-person', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person_id: sel.value }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) location.reload();
      });
  };

  window.removeTag = function (photoId, personId) {
    fetch('/api/photos/' + photoId + '/tag-person/' + personId, { method: 'DELETE' })
      .then(function (r) { return r.json(); })
      .then(function (data) { if (data.ok) location.reload(); });
  };
})();
