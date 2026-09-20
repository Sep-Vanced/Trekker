import { Campsite } from "@/types/navigation-types";
import { getPhaseConfig } from "@/utils/getPhaseConfig";

export function buildMapHtml(campsites: Campsite[], activeId: number | null): string {
  const markersJson = JSON.stringify(
    campsites.map((c) => ({
      id: c.id, name: c.name, phase: c.phase,
      lat: parseFloat(c.latitude), lng: parseFloat(c.longitude),
      color: getPhaseConfig(c.phase).mapColor,
    }))
  );
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body,#map{width:100%;height:100%;overflow:hidden;background:#dde8d8}
    .leaflet-control-attribution,.leaflet-control-zoom{display:none}
  </style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var DATA=${markersJson},INIT=${activeId ?? "null"};
  var map,markers={},activeId=INIT;
  map=L.map("map",{zoomControl:false,attributionControl:false,tap:true});
  L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",{maxZoom:17}).addTo(map);
  function makeIcon(d,active){
    var s=active?44:32;
    var pulse=active?'<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid '+d.color+';opacity:0.4;animation:p 2s ease-in-out infinite"></div>':'';
    return L.divIcon({className:"",iconSize:[s,s],iconAnchor:[s/2,s/2],
      html:'<style>@keyframes p{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.3);opacity:0.1}}</style>'
          +'<div style="position:relative;width:'+s+'px;height:'+s+'px">'+pulse
          +'<div style="position:absolute;inset:0;border-radius:50%;background:'+d.color
          +';border:'+(active?'3px':'2px')+' solid white'
          +';display:flex;align-items:center;justify-content:center'
          +';box-shadow:0 0 '+(active?20:8)+'px '+d.color+(active?',0 0 40px '+d.color+'44':'')+',0 4px 12px rgba(0,0,0,0.5)">'
          +'<svg width="'+(active?18:13)+'" height="'+(active?18:13)+'" viewBox="0 0 24 24" fill="white">'
          +'<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>'
          +'</svg></div></div>'
    });
  }
  function focusMarker(id,fromMap){
    if(activeId!==null&&markers[activeId]){var p=DATA.find(function(m){return m.id===activeId});if(p)markers[activeId].setIcon(makeIcon(p,false));}
    activeId=id;
    var f=DATA.find(function(m){return m.id===id});
    if(!f)return;
    markers[id].setIcon(makeIcon(f,true));
    markers[id].setZIndexOffset(1000);
    map.panTo([f.lat,f.lng],{animate:true,duration:0.4});
    if(fromMap&&window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify({type:"markerClick",id:id}));
  }
  DATA.forEach(function(d){
    var m=L.marker([d.lat,d.lng],{icon:makeIcon(d,d.id===INIT),zIndexOffset:d.id===INIT?1000:0}).addTo(map);
    m.on("click",function(){focusMarker(d.id,true)});
    markers[d.id]=m;
  });
  if(DATA.length===1)map.setView([DATA[0].lat,DATA[0].lng],14);
  else if(DATA.length>1)map.fitBounds(DATA.map(function(d){return[d.lat,d.lng]}),{padding:[50,50],maxZoom:14});
  function handleRNMessage(raw){try{var msg=JSON.parse(raw);if(msg.type==="focusMarker")focusMarker(msg.id,false)}catch(_){}}
  document.addEventListener("message",function(e){handleRNMessage(e.data)});
  window.addEventListener("message",function(e){handleRNMessage(e.data)});
</script>
</body>
</html>`;
}