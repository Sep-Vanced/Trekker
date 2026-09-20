import { LocationLog } from "@/api/trekking";
import { Checkpoint } from "@/types/navigation-types";

const CP_COLOR: Record<string, string> = {
  waypoint:  "#3b82f6",
  danger:    "#ef4444",
  rest:      "#f59e0b",
  camp:      "#8b5cf6",
  emergency: "#f97316",
};

// Clean SVG paths for each checkpoint type
const CP_SVG: Record<string, string> = {
  waypoint: `<svg viewBox="0 0 24 24" fill="white" width="SIZE" height="SIZE">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>`,
  danger: `<svg viewBox="0 0 24 24" fill="white" width="SIZE" height="SIZE">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>`,
  rest: `<svg viewBox="0 0 24 24" fill="white" width="SIZE" height="SIZE">
    <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
  </svg>`,
  camp: `<svg viewBox="0 0 24 24" fill="white" width="SIZE" height="SIZE">
    <path d="M12 3L2 21h20L12 3zm0 4.5l6.5 11H13v-4h-2v4H5.5L12 7.5z"/>
  </svg>`,
  emergency: `<svg viewBox="0 0 24 24" fill="white" width="SIZE" height="SIZE">
    <path d="M19 8h-2V6a5 5 0 0 0-10 0v2H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1zm-9 8a1 1 0 1 1 0-2h.5V12h-.5a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1v3h.5a1 1 0 1 1 0 2H10zm1-10V6a2 2 0 0 1 4 0v2h-4z"/>
  </svg>`,
};

function getCpSvg(cpType: string, size: number): string {
  const svg = CP_SVG[cpType] ?? CP_SVG.waypoint;
  return svg.replace(/SIZE/g, String(size));
}

export function buildLocationMapHtml(
  logs: LocationLog[],
  checkpoints: Checkpoint[] = []
): string {
  const markersJson = JSON.stringify(
    logs.map((l) => ({
      id: l.id,
      lat: parseFloat(l.latitude),
      lng: parseFloat(l.longitude),
      latitude: l.latitude,
      longitude: l.longitude,
      recorded_at: l.recorded_at,
      session: l.session,
    }))
  );

  const seen = new Set<number>();
  const uniqueCheckpoints = checkpoints.filter((cp) => {
    if (seen.has(cp.id)) return false;
    seen.add(cp.id);
    return true;
  });

  const checkpointsJson = JSON.stringify(
    uniqueCheckpoints
      .sort((a, b) => a.order - b.order)
      .map((cp) => ({
        id: cp.id,
        lat: parseFloat(cp.latitude),
        lng: parseFloat(cp.longitude),
        name: cp.name,
        order: cp.order,
        cp_type: cp.cp_type,
        description: cp.description ?? "",
        alert_message: cp.alert_message ?? "",
        radius_meters: cp.radius_meters,
        is_mandatory: cp.is_mandatory,
        color: CP_COLOR[cp.cp_type] ?? "#64748b",
        // Pre-render both sizes as escaped SVG strings
        svgNormal: getCpSvg(cp.cp_type, 16).replace(/\n\s*/g, " "),
        svgActive: getCpSvg(cp.cp_type, 20).replace(/\n\s*/g, " "),
      }))
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body,#map{width:100%;height:100%;background:#dde8d8;overflow:hidden}
    .leaflet-control-attribution{display:none}

    .leaflet-control-zoom{
      border:none !important;
      border-radius:12px !important;
      overflow:hidden;
      box-shadow:0 4px 16px rgba(0,0,0,0.18) !important;
      margin-bottom:80px !important;
      margin-right:12px !important;
    }
    .leaflet-control-zoom a{
      background:#fff !important;
      color:#1e293b !important;
      border:none !important;
      border-bottom:1px solid #f1f5f9 !important;
      width:36px !important;
      height:36px !important;
      line-height:36px !important;
      font-size:18px !important;
      font-weight:300 !important;
    }
    .leaflet-control-zoom-out{border-bottom:none !important}
    .leaflet-control-zoom a:hover{background:#f8fafc !important}

    #popup{
      position:absolute;bottom:16px;left:50%;transform:translateX(-50%);
      background:#fff;border-radius:16px;padding:14px 16px;
      box-shadow:0 4px 24px rgba(0,0,0,0.18);
      min-width:240px;max-width:300px;width:90%;
      z-index:9999;display:none;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    }
    #popup.visible{display:block}
    #popup-close{
      position:absolute;top:10px;right:12px;
      width:22px;height:22px;border-radius:50%;
      background:#f1f5f9;border:none;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      font-size:13px;color:#64748b;line-height:1;
    }
    #popup-badge{
      display:inline-flex;align-items:center;gap:5px;
      border-radius:20px;padding:2px 8px;margin-bottom:8px;
    }
    #popup-badge-dot{width:7px;height:7px;border-radius:50%}
    #popup-badge-text{font-size:10px;font-weight:700;letter-spacing:0.4px}
    .popup-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}
    .popup-label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px}
    .popup-value{font-size:12px;font-weight:700;color:#1e293b;text-align:right;max-width:170px}
    #popup-divider{height:1px;background:#f1f5f9;margin:8px 0}
    #popup-time{font-size:11px;color:#64748b;text-align:center}
    #popup-alert{
      margin-top:8px;padding:6px 8px;border-radius:8px;
      font-size:10px;font-weight:600;color:#7c2d12;
      background:#fff7ed;border:1px solid #fed7aa;display:none;
    }
  </style>
</head>
<body>
<div id="map"></div>

<div id="popup">
  <button id="popup-close" onclick="closePopup()">✕</button>
  <div id="popup-badge">
    <div id="popup-badge-dot"></div>
    <span id="popup-badge-text"></span>
  </div>
  <div class="popup-row">
    <span class="popup-label" id="popup-row1-label">Latitude</span>
    <span class="popup-value" id="popup-row1-value"></span>
  </div>
  <div class="popup-row">
    <span class="popup-label" id="popup-row2-label">Longitude</span>
    <span class="popup-value" id="popup-row2-value"></span>
  </div>
  <div class="popup-row" id="popup-row3-wrap">
    <span class="popup-label" id="popup-row3-label">Session</span>
    <span class="popup-value" id="popup-row3-value"></span>
  </div>
  <div id="popup-divider"></div>
  <div id="popup-time"></div>
  <div id="popup-alert"></div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var DATA = ${markersJson};
  var CHECKPOINTS = ${checkpointsJson};

  var map = L.map("map", {
    zoomControl: true,
    attributionControl: false,
    // Touch interaction — all enabled so the map is fully pannable/zoomable
    tap: false,               // let Leaflet handle touch natively on mobile
    dragging: true,
    touchZoom: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: false,
  });
  map.zoomControl.setPosition("bottomright");

  L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { maxZoom: 17 }).addTo(map);

  var markers = {};
  var activeId = null;
  var activeType = null;

  // ── Ping icon ──────────────────────────────────────────────────────────────
  function makeLogIcon(d, isLatest, active) {
    var s = active ? 44 : 32;
    var color = isLatest ? "#10b981" : "#3b82f6";
    var pulse = active
      ? '<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid '
        + color + ';opacity:0.4;animation:p 2s ease-in-out infinite"></div>'
      : "";
    var inner = isLatest
      ? '<svg width="' + (active ? 18 : 13) + '" height="' + (active ? 18 : 13)
        + '" viewBox="0 0 24 24" fill="white">'
        + '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
      : '<span style="font-size:' + (active ? 13 : 10) + 'px;font-weight:700;color:white;line-height:1">' + d.id + '</span>';
    return L.divIcon({
      className: "",
      iconSize: [s, s],
      iconAnchor: [s / 2, s / 2],
      html:
        '<style>@keyframes p{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.3);opacity:0.1}}</style>'
        + '<div style="position:relative;width:' + s + 'px;height:' + s + 'px">'
        + pulse
        + '<div style="position:absolute;inset:0;border-radius:50%;background:' + color
        + ';border:' + (active ? '3px' : '2px') + ' solid white'
        + ';display:flex;align-items:center;justify-content:center'
        + ';box-shadow:0 0 ' + (active ? 20 : 8) + 'px ' + color
        + (active ? ',0 0 40px ' + color + '44' : '') + ',0 4px 12px rgba(0,0,0,0.4)'
        + '">' + inner + '</div></div>',
    });
  }

  // ── Checkpoint icon (SVG, no emoji) ───────────────────────────────────────
  function makeCpIcon(cp, active) {
    var s = active ? 44 : 34;
    var color = cp.color;
    var pulse = active
      ? '<div style="position:absolute;inset:-8px;border-radius:12px;border:2px solid '
        + color + ';opacity:0.4;animation:p 2s ease-in-out infinite"></div>'
      : "";
    var svgIcon = active ? cp.svgActive : cp.svgNormal;
    return L.divIcon({
      className: "",
      iconSize: [s, s],
      iconAnchor: [s / 2, s / 2],
      html:
        '<style>@keyframes p{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.3);opacity:0.1}}</style>'
        + '<div style="position:relative;width:' + s + 'px;height:' + s + 'px">'
        + pulse
        + '<div style="position:absolute;inset:0;border-radius:10px;background:' + color
        + ';border:' + (active ? '3px' : '2px') + ' solid white'
        + ';display:flex;align-items:center;justify-content:center'
        + ';box-shadow:0 0 ' + (active ? 16 : 6) + 'px ' + color + '88,0 4px 12px rgba(0,0,0,0.35)'
        + '">' + svgIcon + '</div></div>',
    });
  }

  function fmtDate(iso) {
    return new Date(iso).toLocaleString([], {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  }

  function closePopup() {
    document.getElementById("popup").classList.remove("visible");
  }

  function showLogPopup(d) {
    var badge = document.getElementById("popup-badge");
    badge.style.background = "#ecfdf5";
    badge.style.border = "1px solid #a7f3d0";
    document.getElementById("popup-badge-dot").style.background = "#10b981";
    document.getElementById("popup-badge-text").style.color = "#059669";
    document.getElementById("popup-badge-text").textContent = "LOG #" + d.id;
    document.getElementById("popup-row1-label").textContent = "Latitude";
    document.getElementById("popup-row1-value").textContent = parseFloat(d.latitude).toFixed(6) + "°";
    document.getElementById("popup-row2-label").textContent = "Longitude";
    document.getElementById("popup-row2-value").textContent = parseFloat(d.longitude).toFixed(6) + "°";
    document.getElementById("popup-row3-wrap").style.display = "flex";
    document.getElementById("popup-row3-label").textContent = "Session";
    document.getElementById("popup-row3-value").textContent = "#" + d.session;
    document.getElementById("popup-time").textContent = fmtDate(d.recorded_at);
    document.getElementById("popup-alert").style.display = "none";
    document.getElementById("popup").classList.add("visible");
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "markerClick", id: d.id }));
    }
  }

  function showCpPopup(cp) {
    var color = cp.color;
    var badge = document.getElementById("popup-badge");
    badge.style.background = color + "22";
    badge.style.border = "1px solid " + color + "66";
    document.getElementById("popup-badge-dot").style.background = color;
    document.getElementById("popup-badge-text").style.color = color;
    document.getElementById("popup-badge-text").textContent =
      cp.cp_type.toUpperCase() + " · #" + cp.order + (cp.is_mandatory ? " · MANDATORY" : "");
    document.getElementById("popup-row1-label").textContent = "Checkpoint";
    document.getElementById("popup-row1-value").textContent = cp.name;
    document.getElementById("popup-row2-label").textContent = "Radius";
    document.getElementById("popup-row2-value").textContent = cp.radius_meters + " m";
    document.getElementById("popup-row3-wrap").style.display = "none";
    document.getElementById("popup-time").textContent = cp.description
      ? (cp.description.length > 90 ? cp.description.substring(0, 90) + "…" : cp.description)
      : "";
    var alertEl = document.getElementById("popup-alert");
    if (cp.alert_message) {
      alertEl.textContent = cp.alert_message;
      alertEl.style.display = "block";
    } else {
      alertEl.style.display = "none";
    }
    document.getElementById("popup").classList.add("visible");
  }

  function resetActive() {
    if (activeType === "log" && activeId !== null && markers["log_" + activeId]) {
      var prev = DATA.find(function(m){ return m.id === activeId; });
      if (prev) {
        var prevIsLatest = sorted.length > 0 && sorted[sorted.length - 1].id === prev.id;
        markers["log_" + activeId].setIcon(makeLogIcon(prev, prevIsLatest, false));
      }
    } else if (activeType === "cp" && activeId !== null && markers["cp_" + activeId]) {
      var prevCp = CHECKPOINTS.find(function(c){ return c.id === activeId; });
      if (prevCp) markers["cp_" + activeId].setIcon(makeCpIcon(prevCp, false));
    }
  }

  function focusLogMarker(id) {
    resetActive();
    activeId = id; activeType = "log";
    var d = DATA.find(function(m){ return m.id === id; });
    if (!d) return;
    var isLatest = sorted.length > 0 && sorted[sorted.length - 1].id === d.id;
    markers["log_" + id].setIcon(makeLogIcon(d, isLatest, true));
    markers["log_" + id].setZIndexOffset(1000);
    map.panTo([d.lat, d.lng], { animate: true, duration: 0.4 });
    showLogPopup(d);
  }

  function focusCpMarker(id) {
    resetActive();
    activeId = id; activeType = "cp";
    var cp = CHECKPOINTS.find(function(c){ return c.id === id; });
    if (!cp) return;
    markers["cp_" + id].setIcon(makeCpIcon(cp, true));
    markers["cp_" + id].setZIndexOffset(900);
    map.panTo([cp.lat, cp.lng], { animate: true, duration: 0.4 });
    showCpPopup(cp);
  }

  // ── Place log markers ──────────────────────────────────────────────────────
  var sorted = DATA.slice().sort(function(a, b){
    return new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime();
  });

  sorted.forEach(function(d, idx) {
    var isLatest = idx === sorted.length - 1;
    var m = L.marker([d.lat, d.lng], {
      icon: makeLogIcon(d, isLatest, false),
      zIndexOffset: isLatest ? 500 : 0,
    }).addTo(map);
    m.on("click", function(){ focusLogMarker(d.id); });
    markers["log_" + d.id] = m;
  });

  if (sorted.length > 1) {
    L.polyline(sorted.map(function(d){ return [d.lat, d.lng]; }), {
      color: "#3b82f6", weight: 2, opacity: 0.45, dashArray: "6 4",
    }).addTo(map);
  }

  // ── Place checkpoint markers ───────────────────────────────────────────────
  CHECKPOINTS.forEach(function(cp) {
    var m = L.marker([cp.lat, cp.lng], {
      icon: makeCpIcon(cp, false),
      zIndexOffset: 200,
    }).addTo(map);
    m.on("click", function(){ focusCpMarker(cp.id); });
    markers["cp_" + cp.id] = m;
  });

  if (CHECKPOINTS.length > 1) {
    L.polyline(CHECKPOINTS.map(function(cp){ return [cp.lat, cp.lng]; }), {
      color: "#8b5cf6", weight: 2.5, opacity: 0.5, dashArray: "5 5",
    }).addTo(map);
  }

  // ── Fit bounds ─────────────────────────────────────────────────────────────
  var allLatLngs = sorted.map(function(d){ return [d.lat, d.lng]; })
    .concat(CHECKPOINTS.map(function(cp){ return [cp.lat, cp.lng]; }));

  if (allLatLngs.length === 1) {
    map.setView(allLatLngs[0], 14);
  } else if (allLatLngs.length > 1) {
    map.fitBounds(allLatLngs, { padding: [50, 50], maxZoom: 15 });
  }

  // ── RN bridge ──────────────────────────────────────────────────────────────
  function handleRNMessage(raw) {
    try {
      var msg = JSON.parse(raw);
      if (msg.type === "focusMarker") focusLogMarker(msg.id);
    } catch (_) {}
  }
  document.addEventListener("message", function(e){ handleRNMessage(e.data); });
  window.addEventListener("message", function(e){ handleRNMessage(e.data); });
</script>
</body>
</html>`;
}