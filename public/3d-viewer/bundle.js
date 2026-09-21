(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();function $r(n){if(n.length===0)return[];const e=[0];for(let t=1;t<n.length;t+=1){const i=n[t-1],r=n[t],s=Math.hypot(r.x-i.x,r.y-i.y,r.z-i.z);e.push(e[t-1]+s)}return e}function au(n,e){const t=n.points.map(o=>({x:o.lng,y:0,z:o.lat})),i=$r(t);if(i.length===0)return 0;const r=i[i.length-1];if(!Number.isFinite(r)||r<=0)return 0;const s=Math.min(Math.max(e,0),i.length-1);return i[s]/r}function tc(n,e){const t=n.points.findIndex(i=>i.poiId===e);if(t!==-1)return au(n,t)}function nc(n,e,t){return{x:n.x+(e.x-n.x)*t,y:n.y+(e.y-n.y)*t,z:n.z+(e.z-n.z)*t}}function lu(n,e,t){const i=Math.min(Math.max(t,0),1);if(n.length===0)return{x:0,y:0,z:0};if(n.length===1)return{...n[0]};const r=e[e.length-1];if(i<=0||r<=0)return{...n[0]};if(i>=1)return{...n[n.length-1]};const s=i*r;let o=1,a=e.length-1;for(;o<a;){const h=o+a>>>1;e[h]<s?o=h+1:a=h}const l=o-1,c=e[l],d=e[o]-c,u=d===0?0:(s-c)/d;return nc(n[l],n[o],u)}function Sa(n,e,t){const i=Math.min(Math.max(t,0),1);if(n.length===0)return[];if(i<=0)return[n[0]];if(i>=1)return[...n];const r=e[e.length-1],s=i*r,o=[];for(let a=0;a<n.length;a+=1)if(e[a]<=s)o.push(n[a]);else{const l=a-1,c=e[l],d=e[a]-c,u=d===0?0:(s-c)/d;o.push(nc(n[l],n[a],u));break}return o}const cu=250,as=1048576,uu=50,du=1e3/60,hu=3;function fu(n,e){const t=Number.isFinite(n)&&n>=0?n:0;return e.strategy==="raw"?t:e.strategy==="capped"?Math.min(t,e.cappedMaxDeltaMs??uu):Math.min(t,(e.fixedStepMs??du)*(e.fixedStepMaxStepsPerFrame??hu))}function ya(n){const e=Math.round(n*as)/as,t=Math.round(e);return Math.abs(e-t)<=1/as?t:e}function pu(n){return n.playDurationMs+n.holdAtEndMs}function ic(){return{elapsedMs:0}}function rc(n,e,t){const i=Number.isFinite(e)&&e>=0?e:0,r=pu(t),s=Math.min(i,cu);return{elapsedMs:r>0?(n.elapsedMs+s)%r:0}}function mu(n){return n.reduce((e,t)=>{if(t.kind==="hold")return e+t.midMs;const i=t.slowRateFactor??1;return e+t.midMs*(1-i)},0)}function ls(n,e){let t=n+e;for(let i=0;i<2&&t-n!==e;i+=1)t+=e-(t-n);return t}function gu(n,e){const t=1/e,i=[...n].sort((l,c)=>l.progressAt-c.progressAt),r=[];let s=0,o=0;const a=l=>{r.push(l),s=l.endMs,o=l.endProgress};for(const l of i){const c=l.progressAt-t*l.decelMs,d=Math.max(o,c),u=l.progressAt-d,h=c>=o?l.decelMs:Math.max(0,u/t),p=ya(s+(d-o)/t);p>s&&a({kind:"travel",startMs:s,endMs:p,startProgress:o,endProgress:d,startRatePerMs:t,endRatePerMs:t});const g=l.kind==="hold"?0:t*(l.slowRateFactor??1);if(h>0&&a({kind:"ease",startMs:s,endMs:ls(s,h),startProgress:o,endProgress:l.progressAt,startRatePerMs:t,endRatePerMs:g}),l.midMs>0){const _=o+g*l.midMs;a({kind:l.kind==="hold"?"flat":"travel",startMs:s,endMs:ls(s,l.midMs),startProgress:o,endProgress:_,startRatePerMs:g,endRatePerMs:g})}l.accelMs>0&&a({kind:"ease",startMs:s,endMs:ls(s,l.accelMs),startProgress:o,endProgress:o+t*l.accelMs,startRatePerMs:g,endRatePerMs:t})}return a({kind:"travel",startMs:s,endMs:ya(s+(1-o)/t),startProgress:o,endProgress:1,startRatePerMs:t,endRatePerMs:t}),r}function _u(n,e){const t=e*e,i=t*e,r=2*i-3*t+1,s=i-2*t+e,o=-2*i+3*t,a=i-t,l=n.endMs-n.startMs;return r*n.startProgress+s*n.startRatePerMs*l+o*n.endProgress+a*n.endRatePerMs*l}function vu(n,e){if(n.length===0)return 0;const t=n[n.length-1].endMs,i=Math.min(Math.max(e,0),t),r=n.find(a=>i<=a.endMs)??n[n.length-1],s=r.endMs-r.startMs;if(s<=0)return r.endProgress;const o=(i-r.startMs)/s;return r.kind==="ease"?_u(r,o):r.startProgress+(r.endProgress-r.startProgress)*o}function xu(n,e,t){const i=e.flatMap(r=>{const s=tc(n,r.poiId);if(s===void 0)return[];const{poiId:o,...a}=r;return[{...a,progressAt:s}]});return gu(i,t)}function sc(n,e,t,i){return n<=e?0:n>=t?1:i&&i.length>0?vu(i,n-e):(n-e)/(t-e)}const Mu=1e-9,Su={x:0,y:0,z:1};function $i(n,e){return{x:n.x+e.x,y:n.y+e.y,z:n.z+e.z}}function oc(n,e){return{x:n.x-e.x,y:n.y-e.y,z:n.z-e.z}}function Ki(n,e){return{x:n.x*e,y:n.y*e,z:n.z*e}}function jn(n,e,t){return{x:n.x+(e.x-n.x)*t,y:n.y+(e.y-n.y)*t,z:n.z+(e.z-n.z)*t}}function $o(n){return Math.hypot(n.x,n.y,n.z)}function Ko(n,e=Su){const t=$o(n);return t<Mu?{...e}:Ki(n,1/t)}function yu(n,e,t){const i=n.x-e.x,r=n.z-e.z,s=Math.cos(t),o=Math.sin(t);return{x:e.x+i*s+r*o,y:n.y,z:e.z-i*o+r*s}}function ac(n){return Math.min(1,Math.max(0,n))}function ii(n){const e=ac(n);return 3*e**2-2*e**3}function Eu(n){return 1-(1-ac(n))**4}function Zo(n){return n.highOverviewHoldMs+n.descendToOverviewMs+n.overviewHoldMs+n.transitionInMs}function Tu(n,e,t,i){const r=t.highOverviewHoldMs,s=r+t.descendToOverviewMs,o=s+t.overviewHoldMs,a=Zo(t),l=e.playDurationMs,c=l+t.transitionToSummitMs,d=c+t.summitHoldMs,u=d+t.returnToOverviewMs;return n<r?{kind:"high-overview-hold",t:ii(n/t.highOverviewHoldMs)}:n<s?{kind:"descend-to-overview",t:ii((n-r)/t.descendToOverviewMs)}:n<o?{kind:"overview"}:n<a?{kind:"transition-in",t:ii((n-o)/t.transitionInMs)}:n<l?{kind:"route-follow",progress:sc(n,a,e.playDurationMs,i)}:n<c?{kind:"transition-to-summit",t:ii((n-l)/t.transitionToSummitMs)}:n<d?{kind:"summit-hold"}:n<u?{kind:"return-to-overview",t:ii((n-d)/t.returnToOverviewMs)}:{kind:"ascend-to-high-overview",t:ii((n-u)/t.ascendToHighOverviewMs)}}const bu={enabled:!0,position:"bottom-center",bottomMarginPx:40,fadeMs:220,slideOffsetPx:6,backgroundColor:"rgba(10, 12, 10, 0.72)",textColor:"#f5f2ea",accentColor:16765286},Au={gradientTopColor:"#111c27",gradientBottomColor:"#46535c",fogColor:4608860,fogNearFactor:.7,fogFarFactor:1.9},wu={behindMeters:300,heightMeters:180,directionSampleDeltaProgress:.03,headingSmoothingProgress:.08,headingLagProgress:.06,lateralOffsetMeters:70,lookAheadProgress:.06,targetLiftMeters:50},Ru={resampleSpacingMeters:12,smoothingWindowRadiusMeters:60,maxDeviationMeters:45},Cu={keyPoses:[{progress:0,heightMeters:220,behindMeters:260,lateralOffsetMeters:60,headingWindowProgress:.01,lookAheadProgress:.1,landmarkWeight:0,targetLiftMeters:55},{progress:.1,heightMeters:240,behindMeters:365,lateralOffsetMeters:65,headingWindowProgress:.28,headingReferenceProgress:0,anchorReferenceProgress:.118,lookAheadProgress:.1,landmarkWeight:0,targetLiftMeters:53},{progress:.2,heightMeters:260,behindMeters:470,lateralOffsetMeters:70,headingWindowProgress:.28,lookAheadProgress:.1,landmarkWeight:0,targetLiftMeters:50},{progress:.3,heightMeters:260,behindMeters:470,lateralOffsetMeters:78,headingWindowProgress:.28,lookAheadProgress:.12,landmarkWeight:0,targetLiftMeters:58},{progress:.45,heightMeters:260,behindMeters:470,lateralOffsetMeters:90,headingWindowProgress:.28,lookAheadProgress:.15,landmarkWeight:0,targetLiftMeters:70},{progress:.68,heightMeters:258,behindMeters:335,lateralOffsetMeters:45,headingWindowProgress:.3,headingReferenceProgress:.57,anchorReferenceProgress:.53,lookAheadProgress:.1,landmarkWeight:0,targetLiftMeters:50},{progress:.73,heightMeters:257,behindMeters:279,lateralOffsetMeters:97,headingWindowProgress:.3,headingReferenceProgress:.57,anchorReferenceProgress:.593,lookAheadProgress:.09,landmarkWeight:0,targetLiftMeters:65},{progress:.78,heightMeters:263,behindMeters:282,lateralOffsetMeters:81,headingWindowProgress:.3,headingReferenceProgress:.57,anchorReferenceProgress:.67,lookAheadProgress:.08,landmarkPoiId:"yakuoin",landmarkWeight:.6,targetLiftMeters:85},{progress:.83,heightMeters:217,behindMeters:294,lateralOffsetMeters:1,headingWindowProgress:.3,headingReferenceProgress:.57,anchorReferenceProgress:.823,lookAheadProgress:.09,landmarkWeight:0,targetLiftMeters:65},{progress:.88,heightMeters:226,behindMeters:172,lateralOffsetMeters:70,headingWindowProgress:.3,headingReferenceProgress:.57,anchorReferenceProgress:.872,lookAheadProgress:.1,landmarkWeight:0,targetLiftMeters:50},{progress:.97,heightMeters:225,behindMeters:240,lateralOffsetMeters:65,headingWindowProgress:.15,lookAheadProgress:.08,landmarkPoiId:"summit",landmarkWeight:.5,targetLiftMeters:60},{progress:.985,heightMeters:222.8,behindMeters:236.1,lateralOffsetMeters:57.3,headingWindowProgress:.14,lookAheadProgress:.07,landmarkWeight:0,targetLiftMeters:50},{progress:1,heightMeters:218.8,behindMeters:174.2,lateralOffsetMeters:121.5,headingWindowProgress:.12,lookAheadProgress:.05,landmarkPoiId:"summit",landmarkWeight:.8,targetLiftMeters:40}]},Pu={radiusFactor:.145,heightFactor:.11,elevationLiftFactor:1.5},Du={radiusFactor:.15,heightFactor:.13,orbitDegrees:0,holdDriftStartRadiusFactor:.15*1.08,holdDriftStartHeightFactor:.13*1.08,holdDriftStartAzimuthDegrees:72.7000166641626},Lu={radiusFactor:.08,heightFactor:.03},no=16e3,Bi={decelMs:300,midMs:900,accelMs:300},lc={events:[{poiId:"kiyotaki",kind:"hold",...Bi},{poiId:"takaosanguchi_kasumidai",kind:"hold",...Bi},{poiId:"joshinmon",kind:"hold",...Bi},{poiId:"otokozaka_onnazaka",kind:"hold",...Bi},{poiId:"yakuoin",kind:"hold",...Bi}]},cc={highOverviewHoldMs:1500,descendToOverviewMs:1200,overviewHoldMs:1200,transitionInMs:1400,transitionToSummitMs:1500,summitHoldMs:1600,returnToOverviewMs:1800,ascendToHighOverviewMs:900,arcLiftMeters:800},Iu={points:[{poiId:"kiyotaki",displayText:"清滝駅"},{poiId:"takaosanguchi_kasumidai",displayText:"高尾山駅・霞台"},{poiId:"joshinmon",displayText:"浄心門"},{poiId:"otokozaka_onnazaka",displayText:"男坂・女坂分岐"},{poiId:"yakuoin",displayText:"薬王院"},{poiId:"summit",displayText:"高尾山頂"}],heightOffsetMeters:15,occlusion:{epsilonMeters:5,throttleFrames:6},distanceScaling:{nearDistanceMeters:1500,farDistanceMeters:6e3,minScale:.5,hideBeyondMeters:9e3}},Uu={enabled:!0,style:"pin-stand",headRadiusMeters:3.5,standHeightMeters:9,color:16764794,glow:{enabled:!0,color:16765286,radiusFactor:2.2,opacity:.35},beaconRing:{enabled:!0,color:16765286,innerRadiusFactor:3,outerRadiusFactor:4.2,opacity:.4}},Nu={baseLayer:{color:16045453,opacity:.72,widthPx:2},coreColor:16777215,coreWidthPx:2.65,haloLayers:[{widthPx:5.25,opacity:.15,color:16774102},{widthPx:8,opacity:.05,color:16774102}]},Fu={enabled:!0,radiusMeters:1.8,color:16777215,glowRadiusMeters:3.2,glowOpacity:.14,directionCue:{dashCount:3,spacingMeters:15,radiusMeters:.7,minOpacity:.12,maxOpacity:.48,pulsePeriodMs:1800,phaseStep:.22}},Ou={lowElevationColor:9083780,highElevationColor:13819337,roughness:.85,metalness:.06,hillshadeMinFactor:.42,hillshadeMaxFactor:1.5,textureUrl:"/3d-viewer/data/terrain-texture/takao-aerial.webp",edgeFade:{enabled:!0,fadeStartFactor:.72,fadeColor:4608860}},Bu={hemisphereSkyColor:7901346,hemisphereGroundColor:5859410,hemisphereIntensity:1,directionalColor:16773592,directionalIntensity:1.9,directionalPosition:{x:-3600,y:3200,z:-2400}},zu=Zo(cc),Hu=mu(lc.events),Ea={resolutionWidth:1920,resolutionHeight:1080,loopDurationSec:25,terrainOrigin:{lat:35.6255,lng:139.2432},elevationScale:1,metersPerUnit:1,routeAnimation:{playDurationMs:zu+no+Hu,holdAtEndMs:5800},visual:{route:Nu,routeHeadMarker:Fu,terrain:Ou,lighting:Bu,background:Au,waypoints:Uu,arrivalCard:bu},cameraState:{timeline:cc,follow:wu,routeFollowSpots:lc,guidance:Ru,rail:Cu,summit:Lu,highOverview:Du,overview:Pu},labels:Iu};function Te(n){return Number.isFinite(n)&&n>0}function Ht(n){return Number.isInteger(n)&&n>=0&&n<=16777215}function Ta(n){return/^#[0-9a-fA-F]{6}$/.test(n)}function ri(n){return Number.isFinite(n)&&n>=0&&n<=1}function cs(n){return Number.isFinite(n)&&n>=0}function ku(n){return n.length>0&&n.startsWith("/")&&!n.includes("://")}function Vu(n){const{lat:e,lng:t}=n.terrainOrigin,{route:i,routeHeadMarker:r,terrain:s,lighting:o,background:a,waypoints:l}=n.visual,{directionalPosition:c}=o,{edgeFade:d}=s,{directionCue:u}=r,{distanceScaling:h}=n.labels,{highOverview:p,rail:g}=n.cameraState;return Number.isInteger(n.resolutionWidth)&&Te(n.resolutionWidth)&&Number.isInteger(n.resolutionHeight)&&Te(n.resolutionHeight)&&Te(n.loopDurationSec)&&Number.isFinite(e)&&e>=-90&&e<=90&&Number.isFinite(t)&&t>=-180&&t<=180&&Te(n.elevationScale)&&Te(n.metersPerUnit)&&Te(n.routeAnimation.playDurationMs)&&Te(n.routeAnimation.holdAtEndMs)&&Ht(i.baseLayer.color)&&Number.isFinite(i.baseLayer.opacity)&&i.baseLayer.opacity>0&&i.baseLayer.opacity<=1&&Te(i.baseLayer.widthPx)&&Ht(i.coreColor)&&Te(i.coreWidthPx)&&i.haloLayers.every(_=>Te(_.widthPx)&&Number.isFinite(_.opacity)&&_.opacity>0&&_.opacity<=1&&Ht(_.color))&&typeof r.enabled=="boolean"&&Te(r.radiusMeters)&&Ht(r.color)&&Te(r.glowRadiusMeters)&&r.glowRadiusMeters>r.radiusMeters&&Number.isFinite(r.glowOpacity)&&r.glowOpacity>0&&r.glowOpacity<=1&&Number.isInteger(u.dashCount)&&u.dashCount>=2&&u.dashCount<=4&&Te(u.spacingMeters)&&Te(u.radiusMeters)&&u.radiusMeters<r.radiusMeters&&ri(u.minOpacity)&&ri(u.maxOpacity)&&u.maxOpacity>u.minOpacity&&Te(u.pulsePeriodMs)&&Te(u.phaseStep)&&u.phaseStep<1&&Ht(s.lowElevationColor)&&Ht(s.highElevationColor)&&ri(s.roughness)&&ri(s.metalness)&&Number.isFinite(s.hillshadeMinFactor)&&s.hillshadeMinFactor>0&&Number.isFinite(s.hillshadeMaxFactor)&&s.hillshadeMaxFactor>s.hillshadeMinFactor&&(d===void 0||typeof d.enabled=="boolean"&&Number.isFinite(d.fadeStartFactor)&&d.fadeStartFactor>0&&d.fadeStartFactor<=1&&Ht(d.fadeColor))&&(s.textureUrl===void 0||ku(s.textureUrl)&&(s.textureRepeat===void 0||Te(s.textureRepeat.x)&&Te(s.textureRepeat.y)))&&Ht(o.hemisphereSkyColor)&&Ht(o.hemisphereGroundColor)&&cs(o.hemisphereIntensity)&&Ht(o.directionalColor)&&cs(o.directionalIntensity)&&Number.isFinite(c.x)&&Number.isFinite(c.y)&&Number.isFinite(c.z)&&Ta(a.gradientTopColor)&&Ta(a.gradientBottomColor)&&Ht(a.fogColor)&&Te(a.fogNearFactor)&&Te(a.fogFarFactor)&&a.fogFarFactor>a.fogNearFactor&&typeof l.enabled=="boolean"&&(l.style==="pin-stand"||l.style==="anchor-box")&&Te(l.headRadiusMeters)&&Te(l.standHeightMeters)&&Ht(l.color)&&Te(n.cameraState.timeline.highOverviewHoldMs)&&Te(n.cameraState.timeline.descendToOverviewMs)&&Te(n.cameraState.timeline.overviewHoldMs)&&Te(n.cameraState.timeline.transitionInMs)&&Te(n.cameraState.timeline.transitionToSummitMs)&&Te(n.cameraState.timeline.summitHoldMs)&&Te(n.cameraState.timeline.returnToOverviewMs)&&Te(n.cameraState.timeline.ascendToHighOverviewMs)&&Te(n.cameraState.timeline.arcLiftMeters)&&n.cameraState.timeline.highOverviewHoldMs+n.cameraState.timeline.descendToOverviewMs+n.cameraState.timeline.overviewHoldMs+n.cameraState.timeline.transitionInMs<n.routeAnimation.playDurationMs&&n.cameraState.timeline.transitionToSummitMs+n.cameraState.timeline.summitHoldMs+n.cameraState.timeline.returnToOverviewMs+n.cameraState.timeline.ascendToHighOverviewMs<=n.routeAnimation.holdAtEndMs&&Number.isFinite(n.cameraState.follow.behindMeters)&&n.cameraState.follow.behindMeters>0&&Number.isFinite(n.cameraState.follow.heightMeters)&&n.cameraState.follow.heightMeters>0&&Number.isFinite(n.cameraState.follow.directionSampleDeltaProgress)&&n.cameraState.follow.directionSampleDeltaProgress>0&&n.cameraState.follow.directionSampleDeltaProgress<=1&&Number.isFinite(n.cameraState.follow.headingSmoothingProgress)&&n.cameraState.follow.headingSmoothingProgress>0&&n.cameraState.follow.headingSmoothingProgress<=1&&Number.isFinite(n.cameraState.follow.headingLagProgress)&&n.cameraState.follow.headingLagProgress>0&&n.cameraState.follow.headingLagProgress<=1&&Number.isFinite(n.cameraState.follow.lateralOffsetMeters)&&n.cameraState.follow.lateralOffsetMeters>0&&Number.isFinite(n.cameraState.follow.lookAheadProgress)&&n.cameraState.follow.lookAheadProgress>0&&n.cameraState.follow.lookAheadProgress<=1&&Number.isFinite(n.cameraState.follow.targetLiftMeters)&&Te(n.cameraState.guidance.resampleSpacingMeters)&&Te(n.cameraState.guidance.smoothingWindowRadiusMeters)&&Te(n.cameraState.guidance.maxDeviationMeters)&&Array.isArray(g.keyPoses)&&g.keyPoses.length>=2&&g.keyPoses.every((_,m,f)=>ri(_.progress)&&(m===0||_.progress>f[m-1].progress)&&Te(_.heightMeters)&&Te(_.behindMeters)&&Number.isFinite(_.lateralOffsetMeters)&&Te(_.headingWindowProgress)&&_.headingWindowProgress<=1&&Te(_.lookAheadProgress)&&_.lookAheadProgress<=1&&(_.landmarkPoiId===void 0||_.landmarkPoiId==="yakuoin"||_.landmarkPoiId==="summit")&&ri(_.landmarkWeight)&&Number.isFinite(_.targetLiftMeters))&&Te(n.cameraState.summit.radiusFactor)&&Te(n.cameraState.summit.heightFactor)&&Te(p.radiusFactor)&&Te(p.heightFactor)&&cs(p.orbitDegrees)&&p.orbitDegrees<=360&&(p.holdDriftStartRadiusFactor===void 0||Te(p.holdDriftStartRadiusFactor))&&(p.holdDriftStartHeightFactor===void 0||Te(p.holdDriftStartHeightFactor))&&Te(n.cameraState.overview.radiusFactor)&&Te(n.cameraState.overview.heightFactor)&&Te(n.cameraState.overview.elevationLiftFactor)&&n.labels.points.length>0&&n.labels.points.every(({poiId:_,displayText:m})=>_.trim().length>0&&m.trim().length>0)&&new Set(n.labels.points.map(({poiId:_})=>_)).size===n.labels.points.length&&Te(n.labels.heightOffsetMeters)&&Te(n.labels.occlusion.epsilonMeters)&&Number.isInteger(n.labels.occlusion.throttleFrames)&&n.labels.occlusion.throttleFrames>0&&Te(h.nearDistanceMeters)&&Te(h.farDistanceMeters)&&h.farDistanceMeters>h.nearDistanceMeters&&Number.isFinite(h.minScale)&&h.minScale>0&&h.minScale<=1&&Te(h.hideBeyondMeters)&&h.hideBeyondMeters>h.farDistanceMeters}function Gu(n){try{const e=n.startsWith("?")?n.slice(1):n;return new URLSearchParams(e).get("mode")==="lite"?"lite":"full"}catch{return"full"}}const Wu="地形データ: 地理院タイル(標高タイル(基盤地図情報数値標高モデル))を加工して作成 - 国土地理院",Xu="https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html",qu="地理院タイル（写真）を加工して作成",Yu="https://maps.gsi.go.jp/development/ichiran.html",$u="© OpenStreetMap contributors",Ku="https://www.openstreetmap.org/copyright";function Zu(n){const e=document.createElement("div"),t=document.createElement("a"),i=document.createElement("a"),r=document.createElement("a");return t.href=Xu,t.textContent=Wu,t.target="_blank",t.rel="noopener noreferrer",t.style.color="rgba(255,255,255,0.85)",t.style.textDecoration="none",i.href=Yu,i.textContent=qu,i.target="_blank",i.rel="noopener noreferrer",i.style.display="block",i.style.color="rgba(255,255,255,0.85)",i.style.textDecoration="none",r.href=Ku,r.textContent=$u,r.target="_blank",r.rel="noopener noreferrer",r.style.display="block",r.style.color="rgba(255,255,255,0.85)",r.style.textDecoration="none",e.style.position="fixed",e.style.right="8px",e.style.bottom="8px",e.style.zIndex="20",e.style.fontSize="11px",e.style.background="rgba(0,0,0,0.45)",e.style.padding="2px 6px",e.style.borderRadius="3px",e.style.fontFamily="sans-serif",e.style.pointerEvents="auto",e.style.whiteSpace="nowrap",e.append(t,i,r),n.appendChild(e),t}const jo="179",ju=0,ba=1,Ju=2,uc=1,Qu=2,fn=3,Nn=0,Pt=1,pn=2,In=0,Ai=1,Ci=2,Aa=3,wa=4,ed=5,Yn=100,td=101,nd=102,id=103,rd=104,sd=200,od=201,ad=202,ld=203,io=204,ro=205,cd=206,ud=207,dd=208,hd=209,fd=210,pd=211,md=212,gd=213,_d=214,so=0,oo=1,ao=2,Pi=3,lo=4,co=5,uo=6,ho=7,dc=0,vd=1,xd=2,Un=0,Md=1,Sd=2,yd=3,Ed=4,Td=5,bd=6,Ad=7,hc=300,Di=301,Li=302,fo=303,po=304,ns=306,Zi=1e3,Kn=1001,mo=1002,jt=1003,wd=1004,dr=1005,Kt=1006,us=1007,Cn=1008,rn=1009,fc=1010,pc=1011,ji=1012,Jo=1013,ei=1014,mn=1015,ir=1016,Qo=1017,ea=1018,Ji=1020,mc=35902,gc=1021,_c=1022,Zt=1023,Qi=1026,er=1027,vc=1028,ta=1029,xc=1030,na=1031,ia=1033,Hr=33776,kr=33777,Vr=33778,Gr=33779,go=35840,_o=35841,vo=35842,xo=35843,Mo=36196,So=37492,yo=37496,Eo=37808,To=37809,bo=37810,Ao=37811,wo=37812,Ro=37813,Co=37814,Po=37815,Do=37816,Lo=37817,Io=37818,Uo=37819,No=37820,Fo=37821,Wr=36492,Oo=36494,Bo=36495,Mc=36283,zo=36284,Ho=36285,ko=36286,Rd=3200,Cd=3201,Sc=0,Pd=1,Rn="",Ot="srgb",Ii="srgb-linear",Kr="linear",et="srgb",si=7680,Ra=519,Dd=512,Ld=513,Id=514,yc=515,Ud=516,Nd=517,Fd=518,Od=519,Vo=35044,Ca="300 es",nn=2e3,Zr=2001;class Ni{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const r=i[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const St=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Pa=1234567;const qi=Math.PI/180,tr=180/Math.PI;function vn(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(St[n&255]+St[n>>8&255]+St[n>>16&255]+St[n>>24&255]+"-"+St[e&255]+St[e>>8&255]+"-"+St[e>>16&15|64]+St[e>>24&255]+"-"+St[t&63|128]+St[t>>8&255]+"-"+St[t>>16&255]+St[t>>24&255]+St[i&255]+St[i>>8&255]+St[i>>16&255]+St[i>>24&255]).toLowerCase()}function Ne(n,e,t){return Math.max(e,Math.min(t,n))}function ra(n,e){return(n%e+e)%e}function Bd(n,e,t,i,r){return i+(n-e)*(r-i)/(t-e)}function zd(n,e,t){return n!==e?(t-n)/(e-n):0}function Yi(n,e,t){return(1-t)*n+t*e}function Hd(n,e,t,i){return Yi(n,e,1-Math.exp(-t*i))}function kd(n,e=1){return e-Math.abs(ra(n,e*2)-e)}function Vd(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function Gd(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function Wd(n,e){return n+Math.floor(Math.random()*(e-n+1))}function Xd(n,e){return n+Math.random()*(e-n)}function qd(n){return n*(.5-Math.random())}function Yd(n){n!==void 0&&(Pa=n);let e=Pa+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function $d(n){return n*qi}function Kd(n){return n*tr}function Zd(n){return(n&n-1)===0&&n!==0}function jd(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Jd(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Qd(n,e,t,i,r){const s=Math.cos,o=Math.sin,a=s(t/2),l=o(t/2),c=s((e+i)/2),d=o((e+i)/2),u=s((e-i)/2),h=o((e-i)/2),p=s((i-e)/2),g=o((i-e)/2);switch(r){case"XYX":n.set(a*d,l*u,l*h,a*c);break;case"YZY":n.set(l*h,a*d,l*u,a*c);break;case"ZXZ":n.set(l*u,l*h,a*d,a*c);break;case"XZX":n.set(a*d,l*g,l*p,a*c);break;case"YXY":n.set(l*p,a*d,l*g,a*c);break;case"ZYZ":n.set(l*g,l*p,a*d,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function Yt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Je(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const jr={DEG2RAD:qi,RAD2DEG:tr,generateUUID:vn,clamp:Ne,euclideanModulo:ra,mapLinear:Bd,inverseLerp:zd,lerp:Yi,damp:Hd,pingpong:kd,smoothstep:Vd,smootherstep:Gd,randInt:Wd,randFloat:Xd,randFloatSpread:qd,seededRandom:Yd,degToRad:$d,radToDeg:Kd,isPowerOfTwo:Zd,ceilPowerOfTwo:jd,floorPowerOfTwo:Jd,setQuaternionFromProperEuler:Qd,normalize:Je,denormalize:Yt};class We{constructor(e=0,t=0){We.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ne(this.x,e.x,t.x),this.y=Ne(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ne(this.x,e,t),this.y=Ne(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ne(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Ne(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class rr{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let l=i[r+0],c=i[r+1],d=i[r+2],u=i[r+3];const h=s[o+0],p=s[o+1],g=s[o+2],_=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=d,e[t+3]=u;return}if(a===1){e[t+0]=h,e[t+1]=p,e[t+2]=g,e[t+3]=_;return}if(u!==_||l!==h||c!==p||d!==g){let m=1-a;const f=l*h+c*p+d*g+u*_,b=f>=0?1:-1,E=1-f*f;if(E>Number.EPSILON){const R=Math.sqrt(E),T=Math.atan2(R,f*b);m=Math.sin(m*T)/R,a=Math.sin(a*T)/R}const v=a*b;if(l=l*m+h*v,c=c*m+p*v,d=d*m+g*v,u=u*m+_*v,m===1-a){const R=1/Math.sqrt(l*l+c*c+d*d+u*u);l*=R,c*=R,d*=R,u*=R}}e[t]=l,e[t+1]=c,e[t+2]=d,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,r,s,o){const a=i[r],l=i[r+1],c=i[r+2],d=i[r+3],u=s[o],h=s[o+1],p=s[o+2],g=s[o+3];return e[t]=a*g+d*u+l*p-c*h,e[t+1]=l*g+d*h+c*u-a*p,e[t+2]=c*g+d*p+a*h-l*u,e[t+3]=d*g-a*u-l*h-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),d=a(r/2),u=a(s/2),h=l(i/2),p=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=h*d*u+c*p*g,this._y=c*p*u-h*d*g,this._z=c*d*g+h*p*u,this._w=c*d*u-h*p*g;break;case"YXZ":this._x=h*d*u+c*p*g,this._y=c*p*u-h*d*g,this._z=c*d*g-h*p*u,this._w=c*d*u+h*p*g;break;case"ZXY":this._x=h*d*u-c*p*g,this._y=c*p*u+h*d*g,this._z=c*d*g+h*p*u,this._w=c*d*u-h*p*g;break;case"ZYX":this._x=h*d*u-c*p*g,this._y=c*p*u+h*d*g,this._z=c*d*g-h*p*u,this._w=c*d*u+h*p*g;break;case"YZX":this._x=h*d*u+c*p*g,this._y=c*p*u+h*d*g,this._z=c*d*g-h*p*u,this._w=c*d*u-h*p*g;break;case"XZY":this._x=h*d*u-c*p*g,this._y=c*p*u-h*d*g,this._z=c*d*g+h*p*u,this._w=c*d*u+h*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],d=t[6],u=t[10],h=i+a+u;if(h>0){const p=.5/Math.sqrt(h+1);this._w=.25/p,this._x=(d-l)*p,this._y=(s-c)*p,this._z=(o-r)*p}else if(i>a&&i>u){const p=2*Math.sqrt(1+i-a-u);this._w=(d-l)/p,this._x=.25*p,this._y=(r+o)/p,this._z=(s+c)/p}else if(a>u){const p=2*Math.sqrt(1+a-i-u);this._w=(s-c)/p,this._x=(r+o)/p,this._y=.25*p,this._z=(l+d)/p}else{const p=2*Math.sqrt(1+u-i-a);this._w=(o-r)/p,this._x=(s+c)/p,this._y=(l+d)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ne(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,d=t._w;return this._x=i*d+o*a+r*c-s*l,this._y=r*d+o*l+s*a-i*c,this._z=s*d+o*c+i*l-r*a,this._w=o*d-i*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const p=1-t;return this._w=p*o+t*this._w,this._x=p*i+t*this._x,this._y=p*r+t*this._y,this._z=p*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),d=Math.atan2(c,a),u=Math.sin((1-t)*d)/c,h=Math.sin(t*d)/c;return this._w=o*u+this._w*h,this._x=i*u+this._x*h,this._y=r*u+this._y*h,this._z=s*u+this._z*h,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class I{constructor(e=0,t=0,i=0){I.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Da.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Da.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*i),d=2*(a*t-s*r),u=2*(s*i-o*t);return this.x=t+l*c+o*u-a*d,this.y=i+l*d+a*c-s*u,this.z=r+l*u+s*d-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ne(this.x,e.x,t.x),this.y=Ne(this.y,e.y,t.y),this.z=Ne(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ne(this.x,e,t),this.y=Ne(this.y,e,t),this.z=Ne(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ne(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return ds.copy(this).projectOnVector(e),this.sub(ds)}reflect(e){return this.sub(ds.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Ne(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ds=new I,Da=new rr;class ze{constructor(e,t,i,r,s,o,a,l,c){ze.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c)}set(e,t,i,r,s,o,a,l,c){const d=this.elements;return d[0]=e,d[1]=r,d[2]=a,d[3]=t,d[4]=s,d[5]=l,d[6]=i,d[7]=o,d[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],d=i[4],u=i[7],h=i[2],p=i[5],g=i[8],_=r[0],m=r[3],f=r[6],b=r[1],E=r[4],v=r[7],R=r[2],T=r[5],C=r[8];return s[0]=o*_+a*b+l*R,s[3]=o*m+a*E+l*T,s[6]=o*f+a*v+l*C,s[1]=c*_+d*b+u*R,s[4]=c*m+d*E+u*T,s[7]=c*f+d*v+u*C,s[2]=h*_+p*b+g*R,s[5]=h*m+p*E+g*T,s[8]=h*f+p*v+g*C,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8];return t*o*d-t*a*c-i*s*d+i*a*l+r*s*c-r*o*l}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8],u=d*o-a*c,h=a*l-d*s,p=c*s-o*l,g=t*u+i*h+r*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=u*_,e[1]=(r*c-d*i)*_,e[2]=(a*i-r*o)*_,e[3]=h*_,e[4]=(d*t-r*l)*_,e[5]=(r*s-a*t)*_,e[6]=p*_,e[7]=(i*l-c*t)*_,e[8]=(o*t-i*s)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(hs.makeScale(e,t)),this}rotate(e){return this.premultiply(hs.makeRotation(-e)),this}translate(e,t){return this.premultiply(hs.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const hs=new ze;function Ec(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function nr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function eh(){const n=nr("canvas");return n.style.display="block",n}const La={};function wi(n){n in La||(La[n]=!0,console.warn(n))}function th(n,e,t){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}const Ia=new ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ua=new ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function nh(){const n={enabled:!0,workingColorSpace:Ii,spaces:{},convert:function(r,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===et&&(r.r=xn(r.r),r.g=xn(r.g),r.b=xn(r.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===et&&(r.r=Ri(r.r),r.g=Ri(r.g),r.b=Ri(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Rn?Kr:this.spaces[r].transfer},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,o){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return wi("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return wi("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Ii]:{primaries:e,whitePoint:i,transfer:Kr,toXYZ:Ia,fromXYZ:Ua,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ot},outputColorSpaceConfig:{drawingBufferColorSpace:Ot}},[Ot]:{primaries:e,whitePoint:i,transfer:et,toXYZ:Ia,fromXYZ:Ua,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ot}}}),n}const Ye=nh();function xn(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Ri(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let oi;class ih{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{oi===void 0&&(oi=nr("canvas")),oi.width=e.width,oi.height=e.height;const r=oi.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=oi}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=nr("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=xn(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(xn(t[i]/255)*255):t[i]=xn(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let rh=0;class sa{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:rh++}),this.uuid=vn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(fs(r[o].image)):s.push(fs(r[o]))}else s=fs(r);i.url=s}return t||(e.images[this.uuid]=i),i}}function fs(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?ih.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let sh=0;const ps=new I;class wt extends Ni{constructor(e=wt.DEFAULT_IMAGE,t=wt.DEFAULT_MAPPING,i=Kn,r=Kn,s=Kt,o=Cn,a=Zt,l=rn,c=wt.DEFAULT_ANISOTROPY,d=Rn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:sh++}),this.uuid=vn(),this.name="",this.source=new sa(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new We(0,0),this.repeat=new We(1,1),this.center=new We(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(ps).x}get height(){return this.source.getSize(ps).y}get depth(){return this.source.getSize(ps).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}r&&i&&r.isVector2&&i.isVector2||r&&i&&r.isVector3&&i.isVector3||r&&i&&r.isMatrix3&&i.isMatrix3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==hc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Zi:e.x=e.x-Math.floor(e.x);break;case Kn:e.x=e.x<0?0:1;break;case mo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Zi:e.y=e.y-Math.floor(e.y);break;case Kn:e.y=e.y<0?0:1;break;case mo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}wt.DEFAULT_IMAGE=null;wt.DEFAULT_MAPPING=hc;wt.DEFAULT_ANISOTROPY=1;class tt{constructor(e=0,t=0,i=0,r=1){tt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s;const l=e.elements,c=l[0],d=l[4],u=l[8],h=l[1],p=l[5],g=l[9],_=l[2],m=l[6],f=l[10];if(Math.abs(d-h)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(d+h)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(c+1)/2,v=(p+1)/2,R=(f+1)/2,T=(d+h)/4,C=(u+_)/4,D=(g+m)/4;return E>v&&E>R?E<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(E),r=T/i,s=C/i):v>R?v<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(v),i=T/r,s=D/r):R<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(R),i=C/s,r=D/s),this.set(i,r,s,t),this}let b=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(h-d)*(h-d));return Math.abs(b)<.001&&(b=1),this.x=(m-g)/b,this.y=(u-_)/b,this.z=(h-d)/b,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ne(this.x,e.x,t.x),this.y=Ne(this.y,e.y,t.y),this.z=Ne(this.z,e.z,t.z),this.w=Ne(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ne(this.x,e,t),this.y=Ne(this.y,e,t),this.z=Ne(this.z,e,t),this.w=Ne(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ne(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class oh extends Ni{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Kt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new tt(0,0,e,t),this.scissorTest=!1,this.viewport=new tt(0,0,e,t);const r={width:e,height:t,depth:i.depth},s=new wt(r);this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){const t={minFilter:Kt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new sa(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ti extends oh{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Tc extends wt{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=jt,this.minFilter=jt,this.wrapR=Kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class ah extends wt{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=jt,this.minFilter=jt,this.wrapR=Kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Fn{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Wt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Wt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Wt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Wt):Wt.fromBufferAttribute(s,o),Wt.applyMatrix4(e.matrixWorld),this.expandByPoint(Wt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),hr.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),hr.copy(i.boundingBox)),hr.applyMatrix4(e.matrixWorld),this.union(hr)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Wt),Wt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(zi),fr.subVectors(this.max,zi),ai.subVectors(e.a,zi),li.subVectors(e.b,zi),ci.subVectors(e.c,zi),Sn.subVectors(li,ai),yn.subVectors(ci,li),zn.subVectors(ai,ci);let t=[0,-Sn.z,Sn.y,0,-yn.z,yn.y,0,-zn.z,zn.y,Sn.z,0,-Sn.x,yn.z,0,-yn.x,zn.z,0,-zn.x,-Sn.y,Sn.x,0,-yn.y,yn.x,0,-zn.y,zn.x,0];return!ms(t,ai,li,ci,fr)||(t=[1,0,0,0,1,0,0,0,1],!ms(t,ai,li,ci,fr))?!1:(pr.crossVectors(Sn,yn),t=[pr.x,pr.y,pr.z],ms(t,ai,li,ci,fr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Wt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Wt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(an[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),an[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),an[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),an[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),an[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),an[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),an[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),an[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(an),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const an=[new I,new I,new I,new I,new I,new I,new I,new I],Wt=new I,hr=new Fn,ai=new I,li=new I,ci=new I,Sn=new I,yn=new I,zn=new I,zi=new I,fr=new I,pr=new I,Hn=new I;function ms(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){Hn.fromArray(n,s);const a=r.x*Math.abs(Hn.x)+r.y*Math.abs(Hn.y)+r.z*Math.abs(Hn.z),l=e.dot(Hn),c=t.dot(Hn),d=i.dot(Hn);if(Math.max(-Math.max(l,c,d),Math.min(l,c,d))>a)return!1}return!0}const lh=new Fn,Hi=new I,gs=new I;class sr{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):lh.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Hi.subVectors(e,this.center);const t=Hi.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(Hi,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(gs.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Hi.copy(e.center).add(gs)),this.expandByPoint(Hi.copy(e.center).sub(gs))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const ln=new I,_s=new I,mr=new I,En=new I,vs=new I,gr=new I,xs=new I;class bc{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ln)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ln.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ln.copy(this.origin).addScaledVector(this.direction,t),ln.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){_s.copy(e).add(t).multiplyScalar(.5),mr.copy(t).sub(e).normalize(),En.copy(this.origin).sub(_s);const s=e.distanceTo(t)*.5,o=-this.direction.dot(mr),a=En.dot(this.direction),l=-En.dot(mr),c=En.lengthSq(),d=Math.abs(1-o*o);let u,h,p,g;if(d>0)if(u=o*l-a,h=o*a-l,g=s*d,u>=0)if(h>=-g)if(h<=g){const _=1/d;u*=_,h*=_,p=u*(u+o*h+2*a)+h*(o*u+h+2*l)+c}else h=s,u=Math.max(0,-(o*h+a)),p=-u*u+h*(h+2*l)+c;else h=-s,u=Math.max(0,-(o*h+a)),p=-u*u+h*(h+2*l)+c;else h<=-g?(u=Math.max(0,-(-o*s+a)),h=u>0?-s:Math.min(Math.max(-s,-l),s),p=-u*u+h*(h+2*l)+c):h<=g?(u=0,h=Math.min(Math.max(-s,-l),s),p=h*(h+2*l)+c):(u=Math.max(0,-(o*s+a)),h=u>0?s:Math.min(Math.max(-s,-l),s),p=-u*u+h*(h+2*l)+c);else h=o>0?-s:s,u=Math.max(0,-(o*h+a)),p=-u*u+h*(h+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(_s).addScaledVector(mr,h),p}intersectSphere(e,t){ln.subVectors(e.center,this.origin);const i=ln.dot(this.direction),r=ln.dot(ln)-i*i,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,l;const c=1/this.direction.x,d=1/this.direction.y,u=1/this.direction.z,h=this.origin;return c>=0?(i=(e.min.x-h.x)*c,r=(e.max.x-h.x)*c):(i=(e.max.x-h.x)*c,r=(e.min.x-h.x)*c),d>=0?(s=(e.min.y-h.y)*d,o=(e.max.y-h.y)*d):(s=(e.max.y-h.y)*d,o=(e.min.y-h.y)*d),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),u>=0?(a=(e.min.z-h.z)*u,l=(e.max.z-h.z)*u):(a=(e.max.z-h.z)*u,l=(e.min.z-h.z)*u),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,ln)!==null}intersectTriangle(e,t,i,r,s){vs.subVectors(t,e),gr.subVectors(i,e),xs.crossVectors(vs,gr);let o=this.direction.dot(xs),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;En.subVectors(this.origin,e);const l=a*this.direction.dot(gr.crossVectors(En,gr));if(l<0)return null;const c=a*this.direction.dot(vs.cross(En));if(c<0||l+c>o)return null;const d=-a*En.dot(xs);return d<0?null:this.at(d/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class at{constructor(e,t,i,r,s,o,a,l,c,d,u,h,p,g,_,m){at.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c,d,u,h,p,g,_,m)}set(e,t,i,r,s,o,a,l,c,d,u,h,p,g,_,m){const f=this.elements;return f[0]=e,f[4]=t,f[8]=i,f[12]=r,f[1]=s,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=d,f[10]=u,f[14]=h,f[3]=p,f[7]=g,f[11]=_,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new at().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,r=1/ui.setFromMatrixColumn(e,0).length(),s=1/ui.setFromMatrixColumn(e,1).length(),o=1/ui.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),c=Math.sin(r),d=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){const h=o*d,p=o*u,g=a*d,_=a*u;t[0]=l*d,t[4]=-l*u,t[8]=c,t[1]=p+g*c,t[5]=h-_*c,t[9]=-a*l,t[2]=_-h*c,t[6]=g+p*c,t[10]=o*l}else if(e.order==="YXZ"){const h=l*d,p=l*u,g=c*d,_=c*u;t[0]=h+_*a,t[4]=g*a-p,t[8]=o*c,t[1]=o*u,t[5]=o*d,t[9]=-a,t[2]=p*a-g,t[6]=_+h*a,t[10]=o*l}else if(e.order==="ZXY"){const h=l*d,p=l*u,g=c*d,_=c*u;t[0]=h-_*a,t[4]=-o*u,t[8]=g+p*a,t[1]=p+g*a,t[5]=o*d,t[9]=_-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const h=o*d,p=o*u,g=a*d,_=a*u;t[0]=l*d,t[4]=g*c-p,t[8]=h*c+_,t[1]=l*u,t[5]=_*c+h,t[9]=p*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const h=o*l,p=o*c,g=a*l,_=a*c;t[0]=l*d,t[4]=_-h*u,t[8]=g*u+p,t[1]=u,t[5]=o*d,t[9]=-a*d,t[2]=-c*d,t[6]=p*u+g,t[10]=h-_*u}else if(e.order==="XZY"){const h=o*l,p=o*c,g=a*l,_=a*c;t[0]=l*d,t[4]=-u,t[8]=c*d,t[1]=h*u+_,t[5]=o*d,t[9]=p*u-g,t[2]=g*u-p,t[6]=a*d,t[10]=_*u+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ch,e,uh)}lookAt(e,t,i){const r=this.elements;return Nt.subVectors(e,t),Nt.lengthSq()===0&&(Nt.z=1),Nt.normalize(),Tn.crossVectors(i,Nt),Tn.lengthSq()===0&&(Math.abs(i.z)===1?Nt.x+=1e-4:Nt.z+=1e-4,Nt.normalize(),Tn.crossVectors(i,Nt)),Tn.normalize(),_r.crossVectors(Nt,Tn),r[0]=Tn.x,r[4]=_r.x,r[8]=Nt.x,r[1]=Tn.y,r[5]=_r.y,r[9]=Nt.y,r[2]=Tn.z,r[6]=_r.z,r[10]=Nt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],d=i[1],u=i[5],h=i[9],p=i[13],g=i[2],_=i[6],m=i[10],f=i[14],b=i[3],E=i[7],v=i[11],R=i[15],T=r[0],C=r[4],D=r[8],y=r[12],M=r[1],w=r[5],O=r[9],N=r[13],V=r[2],q=r[6],X=r[10],K=r[14],H=r[3],ne=r[7],oe=r[11],xe=r[15];return s[0]=o*T+a*M+l*V+c*H,s[4]=o*C+a*w+l*q+c*ne,s[8]=o*D+a*O+l*X+c*oe,s[12]=o*y+a*N+l*K+c*xe,s[1]=d*T+u*M+h*V+p*H,s[5]=d*C+u*w+h*q+p*ne,s[9]=d*D+u*O+h*X+p*oe,s[13]=d*y+u*N+h*K+p*xe,s[2]=g*T+_*M+m*V+f*H,s[6]=g*C+_*w+m*q+f*ne,s[10]=g*D+_*O+m*X+f*oe,s[14]=g*y+_*N+m*K+f*xe,s[3]=b*T+E*M+v*V+R*H,s[7]=b*C+E*w+v*q+R*ne,s[11]=b*D+E*O+v*X+R*oe,s[15]=b*y+E*N+v*K+R*xe,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],d=e[2],u=e[6],h=e[10],p=e[14],g=e[3],_=e[7],m=e[11],f=e[15];return g*(+s*l*u-r*c*u-s*a*h+i*c*h+r*a*p-i*l*p)+_*(+t*l*p-t*c*h+s*o*h-r*o*p+r*c*d-s*l*d)+m*(+t*c*u-t*a*p-s*o*u+i*o*p+s*a*d-i*c*d)+f*(-r*a*d-t*l*u+t*a*h+r*o*u-i*o*h+i*l*d)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8],u=e[9],h=e[10],p=e[11],g=e[12],_=e[13],m=e[14],f=e[15],b=u*m*c-_*h*c+_*l*p-a*m*p-u*l*f+a*h*f,E=g*h*c-d*m*c-g*l*p+o*m*p+d*l*f-o*h*f,v=d*_*c-g*u*c+g*a*p-o*_*p-d*a*f+o*u*f,R=g*u*l-d*_*l-g*a*h+o*_*h+d*a*m-o*u*m,T=t*b+i*E+r*v+s*R;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const C=1/T;return e[0]=b*C,e[1]=(_*h*s-u*m*s-_*r*p+i*m*p+u*r*f-i*h*f)*C,e[2]=(a*m*s-_*l*s+_*r*c-i*m*c-a*r*f+i*l*f)*C,e[3]=(u*l*s-a*h*s-u*r*c+i*h*c+a*r*p-i*l*p)*C,e[4]=E*C,e[5]=(d*m*s-g*h*s+g*r*p-t*m*p-d*r*f+t*h*f)*C,e[6]=(g*l*s-o*m*s-g*r*c+t*m*c+o*r*f-t*l*f)*C,e[7]=(o*h*s-d*l*s+d*r*c-t*h*c-o*r*p+t*l*p)*C,e[8]=v*C,e[9]=(g*u*s-d*_*s-g*i*p+t*_*p+d*i*f-t*u*f)*C,e[10]=(o*_*s-g*a*s+g*i*c-t*_*c-o*i*f+t*a*f)*C,e[11]=(d*a*s-o*u*s-d*i*c+t*u*c+o*i*p-t*a*p)*C,e[12]=R*C,e[13]=(d*_*r-g*u*r+g*i*h-t*_*h-d*i*m+t*u*m)*C,e[14]=(g*a*r-o*_*r-g*i*l+t*_*l+o*i*m-t*a*m)*C,e[15]=(o*u*r-d*a*r+d*i*l-t*u*l-o*i*h+t*a*h)*C,this}scale(e){const t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,l=e.z,c=s*o,d=s*a;return this.set(c*o+i,c*a-r*l,c*l+r*a,0,c*a+r*l,d*a+i,d*l-r*o,0,c*l-r*a,d*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){const r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,d=o+o,u=a+a,h=s*c,p=s*d,g=s*u,_=o*d,m=o*u,f=a*u,b=l*c,E=l*d,v=l*u,R=i.x,T=i.y,C=i.z;return r[0]=(1-(_+f))*R,r[1]=(p+v)*R,r[2]=(g-E)*R,r[3]=0,r[4]=(p-v)*T,r[5]=(1-(h+f))*T,r[6]=(m+b)*T,r[7]=0,r[8]=(g+E)*C,r[9]=(m-b)*C,r[10]=(1-(h+_))*C,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){const r=this.elements;let s=ui.set(r[0],r[1],r[2]).length();const o=ui.set(r[4],r[5],r[6]).length(),a=ui.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Xt.copy(this);const c=1/s,d=1/o,u=1/a;return Xt.elements[0]*=c,Xt.elements[1]*=c,Xt.elements[2]*=c,Xt.elements[4]*=d,Xt.elements[5]*=d,Xt.elements[6]*=d,Xt.elements[8]*=u,Xt.elements[9]*=u,Xt.elements[10]*=u,t.setFromRotationMatrix(Xt),i.x=s,i.y=o,i.z=a,this}makePerspective(e,t,i,r,s,o,a=nn,l=!1){const c=this.elements,d=2*s/(t-e),u=2*s/(i-r),h=(t+e)/(t-e),p=(i+r)/(i-r);let g,_;if(l)g=s/(o-s),_=o*s/(o-s);else if(a===nn)g=-(o+s)/(o-s),_=-2*o*s/(o-s);else if(a===Zr)g=-o/(o-s),_=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=d,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=nn,l=!1){const c=this.elements,d=2/(t-e),u=2/(i-r),h=-(t+e)/(t-e),p=-(i+r)/(i-r);let g,_;if(l)g=1/(o-s),_=o/(o-s);else if(a===nn)g=-2/(o-s),_=-(o+s)/(o-s);else if(a===Zr)g=-1/(o-s),_=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=d,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=u,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const ui=new I,Xt=new at,ch=new I(0,0,0),uh=new I(1,1,1),Tn=new I,_r=new I,Nt=new I,Na=new at,Fa=new rr;class sn{constructor(e=0,t=0,i=0,r=sn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],d=r[9],u=r[2],h=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(Ne(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-d,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ne(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(Ne(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Ne(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(h,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ne(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-Ne(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-d,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Na.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Na,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Fa.setFromEuler(this),this.setFromQuaternion(Fa,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}sn.DEFAULT_ORDER="XYZ";class oa{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let dh=0;const Oa=new I,di=new rr,cn=new at,vr=new I,ki=new I,hh=new I,fh=new rr,Ba=new I(1,0,0),za=new I(0,1,0),Ha=new I(0,0,1),ka={type:"added"},ph={type:"removed"},hi={type:"childadded",child:null},Ms={type:"childremoved",child:null};class _t extends Ni{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:dh++}),this.uuid=vn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=_t.DEFAULT_UP.clone();const e=new I,t=new sn,i=new rr,r=new I(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new at},normalMatrix:{value:new ze}}),this.matrix=new at,this.matrixWorld=new at,this.matrixAutoUpdate=_t.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=_t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new oa,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return di.setFromAxisAngle(e,t),this.quaternion.multiply(di),this}rotateOnWorldAxis(e,t){return di.setFromAxisAngle(e,t),this.quaternion.premultiply(di),this}rotateX(e){return this.rotateOnAxis(Ba,e)}rotateY(e){return this.rotateOnAxis(za,e)}rotateZ(e){return this.rotateOnAxis(Ha,e)}translateOnAxis(e,t){return Oa.copy(e).applyQuaternion(this.quaternion),this.position.add(Oa.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ba,e)}translateY(e){return this.translateOnAxis(za,e)}translateZ(e){return this.translateOnAxis(Ha,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(cn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?vr.copy(e):vr.set(e,t,i);const r=this.parent;this.updateWorldMatrix(!0,!1),ki.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?cn.lookAt(ki,vr,this.up):cn.lookAt(vr,ki,this.up),this.quaternion.setFromRotationMatrix(cn),r&&(cn.extractRotation(r.matrixWorld),di.setFromRotationMatrix(cn),this.quaternion.premultiply(di.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ka),hi.child=e,this.dispatchEvent(hi),hi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(ph),Ms.child=e,this.dispatchEvent(Ms),Ms.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),cn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),cn.multiply(e.parent.matrixWorld)),e.applyMatrix4(cn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ka),hi.child=e,this.dispatchEvent(hi),hi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ki,e,hh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ki,fh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(a=>({...a})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){const u=l[c];s(e.shapes,u)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),d=o(e.images),u=o(e.shapes),h=o(e.skeletons),p=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),d.length>0&&(i.images=d),u.length>0&&(i.shapes=u),h.length>0&&(i.skeletons=h),p.length>0&&(i.animations=p),g.length>0&&(i.nodes=g)}return i.object=r,i;function o(a){const l=[];for(const c in a){const d=a[c];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}_t.DEFAULT_UP=new I(0,1,0);_t.DEFAULT_MATRIX_AUTO_UPDATE=!0;_t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const qt=new I,un=new I,Ss=new I,dn=new I,fi=new I,pi=new I,Va=new I,ys=new I,Es=new I,Ts=new I,bs=new tt,As=new tt,ws=new tt;class $t{constructor(e=new I,t=new I,i=new I){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),qt.subVectors(e,t),r.cross(qt);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){qt.subVectors(r,t),un.subVectors(i,t),Ss.subVectors(e,t);const o=qt.dot(qt),a=qt.dot(un),l=qt.dot(Ss),c=un.dot(un),d=un.dot(Ss),u=o*c-a*a;if(u===0)return s.set(0,0,0),null;const h=1/u,p=(c*l-a*d)*h,g=(o*d-a*l)*h;return s.set(1-p-g,g,p)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,dn)===null?!1:dn.x>=0&&dn.y>=0&&dn.x+dn.y<=1}static getInterpolation(e,t,i,r,s,o,a,l){return this.getBarycoord(e,t,i,r,dn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,dn.x),l.addScaledVector(o,dn.y),l.addScaledVector(a,dn.z),l)}static getInterpolatedAttribute(e,t,i,r,s,o){return bs.setScalar(0),As.setScalar(0),ws.setScalar(0),bs.fromBufferAttribute(e,t),As.fromBufferAttribute(e,i),ws.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(bs,s.x),o.addScaledVector(As,s.y),o.addScaledVector(ws,s.z),o}static isFrontFacing(e,t,i,r){return qt.subVectors(i,t),un.subVectors(e,t),qt.cross(un).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return qt.subVectors(this.c,this.b),un.subVectors(this.a,this.b),qt.cross(un).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return $t.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return $t.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return $t.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return $t.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return $t.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,r=this.b,s=this.c;let o,a;fi.subVectors(r,i),pi.subVectors(s,i),ys.subVectors(e,i);const l=fi.dot(ys),c=pi.dot(ys);if(l<=0&&c<=0)return t.copy(i);Es.subVectors(e,r);const d=fi.dot(Es),u=pi.dot(Es);if(d>=0&&u<=d)return t.copy(r);const h=l*u-d*c;if(h<=0&&l>=0&&d<=0)return o=l/(l-d),t.copy(i).addScaledVector(fi,o);Ts.subVectors(e,s);const p=fi.dot(Ts),g=pi.dot(Ts);if(g>=0&&p<=g)return t.copy(s);const _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(i).addScaledVector(pi,a);const m=d*g-p*u;if(m<=0&&u-d>=0&&p-g>=0)return Va.subVectors(s,r),a=(u-d)/(u-d+(p-g)),t.copy(r).addScaledVector(Va,a);const f=1/(m+_+h);return o=_*f,a=h*f,t.copy(i).addScaledVector(fi,o).addScaledVector(pi,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Ac={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},bn={h:0,s:0,l:0},xr={h:0,s:0,l:0};function Rs(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class Xe{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ot){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ye.colorSpaceToWorking(this,t),this}setRGB(e,t,i,r=Ye.workingColorSpace){return this.r=e,this.g=t,this.b=i,Ye.colorSpaceToWorking(this,r),this}setHSL(e,t,i,r=Ye.workingColorSpace){if(e=ra(e,1),t=Ne(t,0,1),i=Ne(i,0,1),t===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=Rs(o,s,e+1/3),this.g=Rs(o,s,e),this.b=Rs(o,s,e-1/3)}return Ye.colorSpaceToWorking(this,r),this}setStyle(e,t=Ot){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ot){const i=Ac[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xn(e.r),this.g=xn(e.g),this.b=xn(e.b),this}copyLinearToSRGB(e){return this.r=Ri(e.r),this.g=Ri(e.g),this.b=Ri(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ot){return Ye.workingToColorSpace(yt.copy(this),e),Math.round(Ne(yt.r*255,0,255))*65536+Math.round(Ne(yt.g*255,0,255))*256+Math.round(Ne(yt.b*255,0,255))}getHexString(e=Ot){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ye.workingColorSpace){Ye.workingToColorSpace(yt.copy(this),t);const i=yt.r,r=yt.g,s=yt.b,o=Math.max(i,r,s),a=Math.min(i,r,s);let l,c;const d=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=d<=.5?u/(o+a):u/(2-o-a),o){case i:l=(r-s)/u+(r<s?6:0);break;case r:l=(s-i)/u+2;break;case s:l=(i-r)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=d,e}getRGB(e,t=Ye.workingColorSpace){return Ye.workingToColorSpace(yt.copy(this),t),e.r=yt.r,e.g=yt.g,e.b=yt.b,e}getStyle(e=Ot){Ye.workingToColorSpace(yt.copy(this),e);const t=yt.r,i=yt.g,r=yt.b;return e!==Ot?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(bn),this.setHSL(bn.h+e,bn.s+t,bn.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(bn),e.getHSL(xr);const i=Yi(bn.h,xr.h,t),r=Yi(bn.s,xr.s,t),s=Yi(bn.l,xr.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const yt=new Xe;Xe.NAMES=Ac;let mh=0;class or extends Ni{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:mh++}),this.uuid=vn(),this.name="",this.type="Material",this.blending=Ai,this.side=Nn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=io,this.blendDst=ro,this.blendEquation=Yn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Xe(0,0,0),this.blendAlpha=0,this.depthFunc=Pi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ra,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=si,this.stencilZFail=si,this.stencilZPass=si,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Ai&&(i.blending=this.blending),this.side!==Nn&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==io&&(i.blendSrc=this.blendSrc),this.blendDst!==ro&&(i.blendDst=this.blendDst),this.blendEquation!==Yn&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Pi&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Ra&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==si&&(i.stencilFail=this.stencilFail),this.stencilZFail!==si&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==si&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(t){const s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class gn extends or{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Xe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.combine=dc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ht=new I,Mr=new We;let gh=0;class Dt{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:gh++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Vo,this.updateRanges=[],this.gpuType=mn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Mr.fromBufferAttribute(this,t),Mr.applyMatrix3(e),this.setXY(t,Mr.x,Mr.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)ht.fromBufferAttribute(this,t),ht.applyMatrix3(e),this.setXYZ(t,ht.x,ht.y,ht.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)ht.fromBufferAttribute(this,t),ht.applyMatrix4(e),this.setXYZ(t,ht.x,ht.y,ht.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)ht.fromBufferAttribute(this,t),ht.applyNormalMatrix(e),this.setXYZ(t,ht.x,ht.y,ht.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)ht.fromBufferAttribute(this,t),ht.transformDirection(e),this.setXYZ(t,ht.x,ht.y,ht.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Yt(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Je(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Yt(t,this.array)),t}setX(e,t){return this.normalized&&(t=Je(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Yt(t,this.array)),t}setY(e,t){return this.normalized&&(t=Je(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Yt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Je(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Yt(t,this.array)),t}setW(e,t){return this.normalized&&(t=Je(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Je(t,this.array),i=Je(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=Je(t,this.array),i=Je(i,this.array),r=Je(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=Je(t,this.array),i=Je(i,this.array),r=Je(r,this.array),s=Je(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Vo&&(e.usage=this.usage),e}}class wc extends Dt{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Rc extends Dt{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class dt extends Dt{constructor(e,t,i){super(new Float32Array(e),t,i)}}let _h=0;const kt=new at,Cs=new _t,mi=new I,Ft=new Fn,Vi=new Fn,gt=new I;class Lt extends Ni{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:_h++}),this.uuid=vn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ec(e)?Rc:wc)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new ze().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return kt.makeRotationFromQuaternion(e),this.applyMatrix4(kt),this}rotateX(e){return kt.makeRotationX(e),this.applyMatrix4(kt),this}rotateY(e){return kt.makeRotationY(e),this.applyMatrix4(kt),this}rotateZ(e){return kt.makeRotationZ(e),this.applyMatrix4(kt),this}translate(e,t,i){return kt.makeTranslation(e,t,i),this.applyMatrix4(kt),this}scale(e,t,i){return kt.makeScale(e,t,i),this.applyMatrix4(kt),this}lookAt(e){return Cs.lookAt(e),Cs.updateMatrix(),this.applyMatrix4(Cs.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(mi).negate(),this.translate(mi.x,mi.y,mi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let r=0,s=e.length;r<s;r++){const o=e[r];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new dt(i,3))}else{const i=Math.min(e.length,t.count);for(let r=0;r<i;r++){const s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Fn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){const s=t[i];Ft.setFromBufferAttribute(s),this.morphTargetsRelative?(gt.addVectors(this.boundingBox.min,Ft.min),this.boundingBox.expandByPoint(gt),gt.addVectors(this.boundingBox.max,Ft.max),this.boundingBox.expandByPoint(gt)):(this.boundingBox.expandByPoint(Ft.min),this.boundingBox.expandByPoint(Ft.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new sr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const i=this.boundingSphere.center;if(Ft.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];Vi.setFromBufferAttribute(a),this.morphTargetsRelative?(gt.addVectors(Ft.min,Vi.min),Ft.expandByPoint(gt),gt.addVectors(Ft.max,Vi.max),Ft.expandByPoint(gt)):(Ft.expandByPoint(Vi.min),Ft.expandByPoint(Vi.max))}Ft.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)gt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(gt));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],l=this.morphTargetsRelative;for(let c=0,d=a.count;c<d;c++)gt.fromBufferAttribute(a,c),l&&(mi.fromBufferAttribute(e,c),gt.add(mi)),r=Math.max(r,i.distanceToSquared(gt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Dt(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let D=0;D<i.count;D++)a[D]=new I,l[D]=new I;const c=new I,d=new I,u=new I,h=new We,p=new We,g=new We,_=new I,m=new I;function f(D,y,M){c.fromBufferAttribute(i,D),d.fromBufferAttribute(i,y),u.fromBufferAttribute(i,M),h.fromBufferAttribute(s,D),p.fromBufferAttribute(s,y),g.fromBufferAttribute(s,M),d.sub(c),u.sub(c),p.sub(h),g.sub(h);const w=1/(p.x*g.y-g.x*p.y);isFinite(w)&&(_.copy(d).multiplyScalar(g.y).addScaledVector(u,-p.y).multiplyScalar(w),m.copy(u).multiplyScalar(p.x).addScaledVector(d,-g.x).multiplyScalar(w),a[D].add(_),a[y].add(_),a[M].add(_),l[D].add(m),l[y].add(m),l[M].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let D=0,y=b.length;D<y;++D){const M=b[D],w=M.start,O=M.count;for(let N=w,V=w+O;N<V;N+=3)f(e.getX(N+0),e.getX(N+1),e.getX(N+2))}const E=new I,v=new I,R=new I,T=new I;function C(D){R.fromBufferAttribute(r,D),T.copy(R);const y=a[D];E.copy(y),E.sub(R.multiplyScalar(R.dot(y))).normalize(),v.crossVectors(T,y);const w=v.dot(l[D])<0?-1:1;o.setXYZW(D,E.x,E.y,E.z,w)}for(let D=0,y=b.length;D<y;++D){const M=b[D],w=M.start,O=M.count;for(let N=w,V=w+O;N<V;N+=3)C(e.getX(N+0)),C(e.getX(N+1)),C(e.getX(N+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Dt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let h=0,p=i.count;h<p;h++)i.setXYZ(h,0,0,0);const r=new I,s=new I,o=new I,a=new I,l=new I,c=new I,d=new I,u=new I;if(e)for(let h=0,p=e.count;h<p;h+=3){const g=e.getX(h+0),_=e.getX(h+1),m=e.getX(h+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),d.subVectors(o,s),u.subVectors(r,s),d.cross(u),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,m),a.add(d),l.add(d),c.add(d),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,p=t.count;h<p;h+=3)r.fromBufferAttribute(t,h+0),s.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),d.subVectors(o,s),u.subVectors(r,s),d.cross(u),i.setXYZ(h+0,d.x,d.y,d.z),i.setXYZ(h+1,d.x,d.y,d.z),i.setXYZ(h+2,d.x,d.y,d.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)gt.fromBufferAttribute(e,t),gt.normalize(),e.setXYZ(t,gt.x,gt.y,gt.z)}toNonIndexed(){function e(a,l){const c=a.array,d=a.itemSize,u=a.normalized,h=new c.constructor(l.length*d);let p=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?p=l[_]*a.data.stride+a.offset:p=l[_]*d;for(let f=0;f<d;f++)h[g++]=c[p++]}return new Dt(h,d,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Lt,i=this.index.array,r=this.attributes;for(const a in r){const l=r[a],c=e(l,i);t.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let d=0,u=c.length;d<u;d++){const h=c[d],p=e(h,i);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],d=[];for(let u=0,h=c.length;u<h;u++){const p=c[u];d.push(p.toJSON(e.data))}d.length>0&&(r[l]=d,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const r=e.attributes;for(const c in r){const d=r[c];this.setAttribute(c,d.clone(t))}const s=e.morphAttributes;for(const c in s){const d=[],u=s[c];for(let h=0,p=u.length;h<p;h++)d.push(u[h].clone(t));this.morphAttributes[c]=d}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,d=o.length;c<d;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Ga=new at,kn=new bc,Sr=new sr,Wa=new I,yr=new I,Er=new I,Tr=new I,Ps=new I,br=new I,Xa=new I,Ar=new I;class ft extends _t{constructor(e=new Lt,t=new gn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){br.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const d=a[l],u=s[l];d!==0&&(Ps.fromBufferAttribute(u,e),o?br.addScaledVector(Ps,d):br.addScaledVector(Ps.sub(t),d))}t.add(br)}return t}raycast(e,t){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Sr.copy(i.boundingSphere),Sr.applyMatrix4(s),kn.copy(e.ray).recast(e.near),!(Sr.containsPoint(kn.origin)===!1&&(kn.intersectSphere(Sr,Wa)===null||kn.origin.distanceToSquared(Wa)>(e.far-e.near)**2))&&(Ga.copy(s).invert(),kn.copy(e.ray).applyMatrix4(Ga),!(i.boundingBox!==null&&kn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,kn)))}_computeIntersections(e,t,i){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,d=s.attributes.uv1,u=s.attributes.normal,h=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){const m=h[g],f=o[m.materialIndex],b=Math.max(m.start,p.start),E=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let v=b,R=E;v<R;v+=3){const T=a.getX(v),C=a.getX(v+1),D=a.getX(v+2);r=wr(this,f,e,i,c,d,u,T,C,D),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,p.start),_=Math.min(a.count,p.start+p.count);for(let m=g,f=_;m<f;m+=3){const b=a.getX(m),E=a.getX(m+1),v=a.getX(m+2);r=wr(this,o,e,i,c,d,u,b,E,v),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){const m=h[g],f=o[m.materialIndex],b=Math.max(m.start,p.start),E=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let v=b,R=E;v<R;v+=3){const T=v,C=v+1,D=v+2;r=wr(this,f,e,i,c,d,u,T,C,D),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=g,f=_;m<f;m+=3){const b=m,E=m+1,v=m+2;r=wr(this,o,e,i,c,d,u,b,E,v),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}}function vh(n,e,t,i,r,s,o,a){let l;if(e.side===Pt?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===Nn,a),l===null)return null;Ar.copy(a),Ar.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(Ar);return c<t.near||c>t.far?null:{distance:c,point:Ar.clone(),object:n}}function wr(n,e,t,i,r,s,o,a,l,c){n.getVertexPosition(a,yr),n.getVertexPosition(l,Er),n.getVertexPosition(c,Tr);const d=vh(n,e,t,i,yr,Er,Tr,Xa);if(d){const u=new I;$t.getBarycoord(Xa,yr,Er,Tr,u),r&&(d.uv=$t.getInterpolatedAttribute(r,a,l,c,u,new We)),s&&(d.uv1=$t.getInterpolatedAttribute(s,a,l,c,u,new We)),o&&(d.normal=$t.getInterpolatedAttribute(o,a,l,c,u,new I),d.normal.dot(i.direction)>0&&d.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new I,materialIndex:0};$t.getNormal(yr,Er,Tr,h.normal),d.face=h,d.barycoord=u}return d}class ar extends Lt{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],d=[],u=[];let h=0,p=0;g("z","y","x",-1,-1,i,t,e,o,s,0),g("z","y","x",1,-1,i,t,-e,o,s,1),g("x","z","y",1,1,e,i,t,r,o,2),g("x","z","y",1,-1,e,i,-t,r,o,3),g("x","y","z",1,-1,e,t,i,r,s,4),g("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new dt(c,3)),this.setAttribute("normal",new dt(d,3)),this.setAttribute("uv",new dt(u,2));function g(_,m,f,b,E,v,R,T,C,D,y){const M=v/C,w=R/D,O=v/2,N=R/2,V=T/2,q=C+1,X=D+1;let K=0,H=0;const ne=new I;for(let oe=0;oe<X;oe++){const xe=oe*w-N;for(let Ie=0;Ie<q;Ie++){const nt=Ie*M-O;ne[_]=nt*b,ne[m]=xe*E,ne[f]=V,c.push(ne.x,ne.y,ne.z),ne[_]=0,ne[m]=0,ne[f]=T>0?1:-1,d.push(ne.x,ne.y,ne.z),u.push(Ie/C),u.push(1-oe/D),K+=1}}for(let oe=0;oe<D;oe++)for(let xe=0;xe<C;xe++){const Ie=h+xe+q*oe,nt=h+xe+q*(oe+1),Ze=h+(xe+1)+q*(oe+1),Y=h+(xe+1)+q*oe;l.push(Ie,nt,Y),l.push(nt,Ze,Y),H+=6}a.addGroup(p,H,y),p+=H,h+=K}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ar(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ui(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function bt(n){const e={};for(let t=0;t<n.length;t++){const i=Ui(n[t]);for(const r in i)e[r]=i[r]}return e}function xh(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Cc(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ye.workingColorSpace}const aa={clone:Ui,merge:bt};var Mh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Sh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Mn extends or{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mh,this.fragmentShader=Sh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ui(e.uniforms),this.uniformsGroups=xh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class Pc extends _t{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new at,this.projectionMatrix=new at,this.projectionMatrixInverse=new at,this.coordinateSystem=nn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const An=new I,qa=new We,Ya=new We;class Gt extends Pc{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=tr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(qi*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return tr*2*Math.atan(Math.tan(qi*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){An.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(An.x,An.y).multiplyScalar(-e/An.z),An.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(An.x,An.y).multiplyScalar(-e/An.z)}getViewSize(e,t){return this.getViewBounds(e,qa,Ya),t.subVectors(Ya,qa)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(qi*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const gi=-90,_i=1;class yh extends _t{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Gt(gi,_i,e,t);r.layers=this.layers,this.add(r);const s=new Gt(gi,_i,e,t);s.layers=this.layers,this.add(s);const o=new Gt(gi,_i,e,t);o.layers=this.layers,this.add(o);const a=new Gt(gi,_i,e,t);a.layers=this.layers,this.add(a);const l=new Gt(gi,_i,e,t);l.layers=this.layers,this.add(l);const c=new Gt(gi,_i,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,l]=t;for(const c of t)this.remove(c);if(e===nn)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Zr)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,d]=this.children,u=e.getRenderTarget(),h=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,o),e.setRenderTarget(i,2,r),e.render(t,a),e.setRenderTarget(i,3,r),e.render(t,l),e.setRenderTarget(i,4,r),e.render(t,c),i.texture.generateMipmaps=_,e.setRenderTarget(i,5,r),e.render(t,d),e.setRenderTarget(u,h,p),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class Dc extends wt{constructor(e=[],t=Di,i,r,s,o,a,l,c,d){super(e,t,i,r,s,o,a,l,c,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Eh extends ti{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new Dc(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new ar(5,5,5),s=new Mn({name:"CubemapFromEquirect",uniforms:Ui(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Pt,blending:In});s.uniforms.tEquirect.value=t;const o=new ft(r,s),a=t.minFilter;return t.minFilter===Cn&&(t.minFilter=Kt),new yh(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,r=!0){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}}class _n extends _t{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Th={type:"move"};class Ds{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new _n,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new _n,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new _n,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,i),f=this._getHandJoint(c,_);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}const d=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],h=d.position.distanceTo(u.position),p=.02,g=.005;c.inputState.pinching&&h>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Th)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new _n;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class la{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Xe(e),this.near=t,this.far=i}clone(){return new la(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class bh extends _t{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new sn,this.environmentIntensity=1,this.environmentRotation=new sn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Ah{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Vo,this.updateRanges=[],this.version=0,this.uuid=vn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=vn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=vn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Tt=new I;class Pn{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Tt.fromBufferAttribute(this,t),Tt.applyMatrix4(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Tt.fromBufferAttribute(this,t),Tt.applyNormalMatrix(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Tt.fromBufferAttribute(this,t),Tt.transformDirection(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=Yt(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Je(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=Je(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Je(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Je(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Je(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Yt(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Yt(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Yt(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Yt(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Je(t,this.array),i=Je(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Je(t,this.array),i=Je(i,this.array),r=Je(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=Je(t,this.array),i=Je(i,this.array),r=Je(r,this.array),s=Je(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Dt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Pn(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const Ls=new I,wh=new I,Rh=new ze;class Xn{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const r=Ls.subVectors(i,t).cross(wh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Ls),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Rh.getNormalMatrix(e),r=this.coplanarPoint(Ls).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Vn=new sr,Ch=new We(.5,.5),Rr=new I;class ca{constructor(e=new Xn,t=new Xn,i=new Xn,r=new Xn,s=new Xn,o=new Xn){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=nn,i=!1){const r=this.planes,s=e.elements,o=s[0],a=s[1],l=s[2],c=s[3],d=s[4],u=s[5],h=s[6],p=s[7],g=s[8],_=s[9],m=s[10],f=s[11],b=s[12],E=s[13],v=s[14],R=s[15];if(r[0].setComponents(c-o,p-d,f-g,R-b).normalize(),r[1].setComponents(c+o,p+d,f+g,R+b).normalize(),r[2].setComponents(c+a,p+u,f+_,R+E).normalize(),r[3].setComponents(c-a,p-u,f-_,R-E).normalize(),i)r[4].setComponents(l,h,m,v).normalize(),r[5].setComponents(c-l,p-h,f-m,R-v).normalize();else if(r[4].setComponents(c-l,p-h,f-m,R-v).normalize(),t===nn)r[5].setComponents(c+l,p+h,f+m,R+v).normalize();else if(t===Zr)r[5].setComponents(l,h,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Vn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Vn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Vn)}intersectsSprite(e){Vn.center.set(0,0,0);const t=Ch.distanceTo(e.center);return Vn.radius=.7071067811865476+t,Vn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Vn)}intersectsSphere(e){const t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const r=t[i];if(Rr.x=r.normal.x>0?e.max.x:e.min.x,Rr.y=r.normal.y>0?e.max.y:e.min.y,Rr.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Rr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Lc extends wt{constructor(e,t,i=ei,r,s,o,a=jt,l=jt,c,d=Qi,u=1){if(d!==Qi&&d!==er)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:u};super(h,r,s,o,a,l,d,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new sa(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Jr extends Lt{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);const s=[],o=[],a=[],l=[],c=new I,d=new We;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,h=3;u<=t;u++,h+=3){const p=i+u/t*r;c.x=e*Math.cos(p),c.y=e*Math.sin(p),o.push(c.x,c.y,c.z),a.push(0,0,1),d.x=(o[h]/e+1)/2,d.y=(o[h+1]/e+1)/2,l.push(d.x,d.y)}for(let u=1;u<=t;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new dt(o,3)),this.setAttribute("normal",new dt(a,3)),this.setAttribute("uv",new dt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Jr(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class ua extends Lt{constructor(e=1,t=1,i=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const d=[],u=[],h=[],p=[];let g=0;const _=[],m=i/2;let f=0;b(),o===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(d),this.setAttribute("position",new dt(u,3)),this.setAttribute("normal",new dt(h,3)),this.setAttribute("uv",new dt(p,2));function b(){const v=new I,R=new I;let T=0;const C=(t-e)/i;for(let D=0;D<=s;D++){const y=[],M=D/s,w=M*(t-e)+e;for(let O=0;O<=r;O++){const N=O/r,V=N*l+a,q=Math.sin(V),X=Math.cos(V);R.x=w*q,R.y=-M*i+m,R.z=w*X,u.push(R.x,R.y,R.z),v.set(q,C,X).normalize(),h.push(v.x,v.y,v.z),p.push(N,1-M),y.push(g++)}_.push(y)}for(let D=0;D<r;D++)for(let y=0;y<s;y++){const M=_[y][D],w=_[y+1][D],O=_[y+1][D+1],N=_[y][D+1];(e>0||y!==0)&&(d.push(M,w,N),T+=3),(t>0||y!==s-1)&&(d.push(w,O,N),T+=3)}c.addGroup(f,T,0),f+=T}function E(v){const R=g,T=new We,C=new I;let D=0;const y=v===!0?e:t,M=v===!0?1:-1;for(let O=1;O<=r;O++)u.push(0,m*M,0),h.push(0,M,0),p.push(.5,.5),g++;const w=g;for(let O=0;O<=r;O++){const V=O/r*l+a,q=Math.cos(V),X=Math.sin(V);C.x=y*X,C.y=m*M,C.z=y*q,u.push(C.x,C.y,C.z),h.push(0,M,0),T.x=q*.5+.5,T.y=X*.5*M+.5,p.push(T.x,T.y),g++}for(let O=0;O<r;O++){const N=R+O,V=w+O;v===!0?d.push(V,V+1,N):d.push(V+1,V,N),D+=3}c.addGroup(f,D,v===!0?1:2),f+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ua(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class is extends Lt{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};const s=e/2,o=t/2,a=Math.floor(i),l=Math.floor(r),c=a+1,d=l+1,u=e/a,h=t/l,p=[],g=[],_=[],m=[];for(let f=0;f<d;f++){const b=f*h-o;for(let E=0;E<c;E++){const v=E*u-s;g.push(v,-b,0),_.push(0,0,1),m.push(E/a),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let b=0;b<a;b++){const E=b+c*f,v=b+c*(f+1),R=b+1+c*(f+1),T=b+1+c*f;p.push(E,v,T),p.push(v,R,T)}this.setIndex(p),this.setAttribute("position",new dt(g,3)),this.setAttribute("normal",new dt(_,3)),this.setAttribute("uv",new dt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new is(e.width,e.height,e.widthSegments,e.heightSegments)}}class da extends Lt{constructor(e=.5,t=1,i=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:o},i=Math.max(3,i),r=Math.max(1,r);const a=[],l=[],c=[],d=[];let u=e;const h=(t-e)/r,p=new I,g=new We;for(let _=0;_<=r;_++){for(let m=0;m<=i;m++){const f=s+m/i*o;p.x=u*Math.cos(f),p.y=u*Math.sin(f),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/t+1)/2,g.y=(p.y/t+1)/2,d.push(g.x,g.y)}u+=h}for(let _=0;_<r;_++){const m=_*(i+1);for(let f=0;f<i;f++){const b=f+m,E=b,v=b+i+1,R=b+i+2,T=b+1;a.push(E,v,T),a.push(v,R,T)}}this.setIndex(a),this.setAttribute("position",new dt(l,3)),this.setAttribute("normal",new dt(c,3)),this.setAttribute("uv",new dt(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new da(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Jn extends Lt{constructor(e=1,t=32,i=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(o+a,Math.PI);let c=0;const d=[],u=new I,h=new I,p=[],g=[],_=[],m=[];for(let f=0;f<=i;f++){const b=[],E=f/i;let v=0;f===0&&o===0?v=.5/t:f===i&&l===Math.PI&&(v=-.5/t);for(let R=0;R<=t;R++){const T=R/t;u.x=-e*Math.cos(r+T*s)*Math.sin(o+E*a),u.y=e*Math.cos(o+E*a),u.z=e*Math.sin(r+T*s)*Math.sin(o+E*a),g.push(u.x,u.y,u.z),h.copy(u).normalize(),_.push(h.x,h.y,h.z),m.push(T+v,1-E),b.push(c++)}d.push(b)}for(let f=0;f<i;f++)for(let b=0;b<t;b++){const E=d[f][b+1],v=d[f][b],R=d[f+1][b],T=d[f+1][b+1];(f!==0||o>0)&&p.push(E,v,T),(f!==i-1||l<Math.PI)&&p.push(v,R,T)}this.setIndex(p),this.setAttribute("position",new dt(g,3)),this.setAttribute("normal",new dt(_,3)),this.setAttribute("uv",new dt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Jn(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Ph extends Lt{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){const t=[],i=new Set,r=new I,s=new I;if(e.index!==null){const o=e.attributes.position,a=e.index;let l=e.groups;l.length===0&&(l=[{start:0,count:a.count,materialIndex:0}]);for(let c=0,d=l.length;c<d;++c){const u=l[c],h=u.start,p=u.count;for(let g=h,_=h+p;g<_;g+=3)for(let m=0;m<3;m++){const f=a.getX(g+m),b=a.getX(g+(m+1)%3);r.fromBufferAttribute(o,f),s.fromBufferAttribute(o,b),$a(r,s,i)===!0&&(t.push(r.x,r.y,r.z),t.push(s.x,s.y,s.z))}}}else{const o=e.attributes.position;for(let a=0,l=o.count/3;a<l;a++)for(let c=0;c<3;c++){const d=3*a+c,u=3*a+(c+1)%3;r.fromBufferAttribute(o,d),s.fromBufferAttribute(o,u),$a(r,s,i)===!0&&(t.push(r.x,r.y,r.z),t.push(s.x,s.y,s.z))}}this.setAttribute("position",new dt(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}function $a(n,e,t){const i=`${n.x},${n.y},${n.z}-${e.x},${e.y},${e.z}`,r=`${e.x},${e.y},${e.z}-${n.x},${n.y},${n.z}`;return t.has(i)===!0||t.has(r)===!0?!1:(t.add(i),t.add(r),!0)}class Ic extends or{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Xe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Sc,this.normalScale=new We(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Dh extends or{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Rd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Lh extends or{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Is={enabled:!1,files:{},add:function(n,e){this.enabled!==!1&&(this.files[n]=e)},get:function(n){if(this.enabled!==!1)return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}};class Ih{constructor(e,t,i){const r=this;let s=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.abortController=new AbortController,this.itemStart=function(d){a++,s===!1&&r.onStart!==void 0&&r.onStart(d,o,a),s=!0},this.itemEnd=function(d){o++,r.onProgress!==void 0&&r.onProgress(d,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(d){r.onError!==void 0&&r.onError(d)},this.resolveURL=function(d){return l?l(d):d},this.setURLModifier=function(d){return l=d,this},this.addHandler=function(d,u){return c.push(d,u),this},this.removeHandler=function(d){const u=c.indexOf(d);return u!==-1&&c.splice(u,2),this},this.getHandler=function(d){for(let u=0,h=c.length;u<h;u+=2){const p=c[u],g=c[u+1];if(p.global&&(p.lastIndex=0),p.test(d))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}}const Uh=new Ih;class ha{constructor(e){this.manager=e!==void 0?e:Uh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const i=this;return new Promise(function(r,s){i.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}ha.DEFAULT_MATERIAL_NAME="__DEFAULT";const vi=new WeakMap;class Nh extends ha{constructor(e){super(e)}load(e,t,i,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=Is.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)s.manager.itemStart(e),setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0);else{let u=vi.get(o);u===void 0&&(u=[],vi.set(o,u)),u.push({onLoad:t,onError:r})}return o}const a=nr("img");function l(){d(),t&&t(this);const u=vi.get(this)||[];for(let h=0;h<u.length;h++){const p=u[h];p.onLoad&&p.onLoad(this)}vi.delete(this),s.manager.itemEnd(e)}function c(u){d(),r&&r(u),Is.remove(`image:${e}`);const h=vi.get(this)||[];for(let p=0;p<h.length;p++){const g=h[p];g.onError&&g.onError(u)}vi.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function d(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),Is.add(`image:${e}`,a),s.manager.itemStart(e),a.src=e,a}}class Fh extends ha{constructor(e){super(e)}load(e,t,i,r){const s=new wt,o=new Nh(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){s.image=a,s.needsUpdate=!0,t!==void 0&&t(s)},i,r),s}}class Uc extends _t{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Xe(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class Oh extends Uc{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Xe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Us=new at,Ka=new I,Za=new I;class Bh{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new We(512,512),this.mapType=rn,this.map=null,this.mapPass=null,this.matrix=new at,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ca,this._frameExtents=new We(1,1),this._viewportCount=1,this._viewports=[new tt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;Ka.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ka),Za.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Za),t.updateMatrixWorld(),Us.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Us,t.coordinateSystem,t.reversedDepth),t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Us)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Nc extends Pc{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,o=i+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=d*this.view.offsetY,l=a-d*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class zh extends Bh{constructor(){super(new Nc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Hh extends Uc{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.target=new _t,this.shadow=new zh}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class kh extends Lt{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){const e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}}class Vh extends Gt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class Go extends Ah{constructor(e,t,i=1){super(e,t),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){const t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){const t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}}const ja=new at;class Gh{constructor(e,t,i=0,r=1/0){this.ray=new bc(e,t),this.near=i,this.far=r,this.camera=null,this.layers=new oa,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return ja.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ja),this}intersectObject(e,t=!0,i=[]){return Wo(e,this,i,t),i.sort(Ja),i}intersectObjects(e,t=!0,i=[]){for(let r=0,s=e.length;r<s;r++)Wo(e[r],this,i,t);return i.sort(Ja),i}}function Ja(n,e){return n.distance-e.distance}function Wo(n,e,t,i){let r=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(r=!1),r===!0&&i===!0){const s=n.children;for(let o=0,a=s.length;o<a;o++)Wo(s[o],e,t,!0)}}const Qa=new I,Cr=new I,xi=new I,Mi=new I,Ns=new I,Wh=new I,Xh=new I;class qh{constructor(e=new I,t=new I){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){Qa.subVectors(e,this.start),Cr.subVectors(this.end,this.start);const i=Cr.dot(Cr);let s=Cr.dot(Qa)/i;return t&&(s=Ne(s,0,1)),s}closestPointToPoint(e,t,i){const r=this.closestPointToPointParameter(e,t);return this.delta(i).multiplyScalar(r).add(this.start)}distanceSqToLine3(e,t=Wh,i=Xh){const r=10000000000000001e-32;let s,o;const a=this.start,l=e.start,c=this.end,d=e.end;xi.subVectors(c,a),Mi.subVectors(d,l),Ns.subVectors(a,l);const u=xi.dot(xi),h=Mi.dot(Mi),p=Mi.dot(Ns);if(u<=r&&h<=r)return t.copy(a),i.copy(l),t.sub(i),t.dot(t);if(u<=r)s=0,o=p/h,o=Ne(o,0,1);else{const g=xi.dot(Ns);if(h<=r)o=0,s=Ne(-g/u,0,1);else{const _=xi.dot(Mi),m=u*h-_*_;m!==0?s=Ne((_*p-g*h)/m,0,1):s=0,o=(_*s+p)/h,o<0?(o=0,s=Ne(-g/u,0,1)):o>1&&(o=1,s=Ne((_-g)/u,0,1))}}return t.copy(a).add(xi.multiplyScalar(s)),i.copy(l).add(Mi.multiplyScalar(o)),t.sub(i),t.dot(t)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}function el(n,e,t,i){const r=Yh(i);switch(t){case gc:return n*e;case vc:return n*e/r.components*r.byteLength;case ta:return n*e/r.components*r.byteLength;case xc:return n*e*2/r.components*r.byteLength;case na:return n*e*2/r.components*r.byteLength;case _c:return n*e*3/r.components*r.byteLength;case Zt:return n*e*4/r.components*r.byteLength;case ia:return n*e*4/r.components*r.byteLength;case Hr:case kr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Vr:case Gr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case _o:case xo:return Math.max(n,16)*Math.max(e,8)/4;case go:case vo:return Math.max(n,8)*Math.max(e,8)/2;case Mo:case So:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case yo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Eo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case To:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case bo:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Ao:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case wo:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Ro:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Co:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Po:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Do:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Lo:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Io:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Uo:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case No:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Fo:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Wr:case Oo:case Bo:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Mc:case zo:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Ho:case ko:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Yh(n){switch(n){case rn:case fc:return{byteLength:1,components:1};case ji:case pc:case ir:return{byteLength:2,components:1};case Qo:case ea:return{byteLength:2,components:4};case ei:case Jo:case mn:return{byteLength:4,components:1};case mc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:jo}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=jo);function Fc(){let n=null,e=!1,t=null,i=null;function r(s,o){t(s,o),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function $h(n){const e=new WeakMap;function t(a,l){const c=a.array,d=a.usage,u=c.byteLength,h=n.createBuffer();n.bindBuffer(l,h),n.bufferData(l,c,d),a.onUploadCallback();let p;if(c instanceof Float32Array)p=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=n.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=n.HALF_FLOAT:p=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=n.SHORT;else if(c instanceof Uint32Array)p=n.UNSIGNED_INT;else if(c instanceof Int32Array)p=n.INT;else if(c instanceof Int8Array)p=n.BYTE;else if(c instanceof Uint8Array)p=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){const d=l.array,u=l.updateRanges;if(n.bindBuffer(c,a),u.length===0)n.bufferSubData(c,0,d);else{u.sort((p,g)=>p.start-g.start);let h=0;for(let p=1;p<u.length;p++){const g=u[h],_=u[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++h,u[h]=_)}u.length=h+1;for(let p=0,g=u.length;p<g;p++){const _=u[p];n.bufferSubData(c,_.start*d.BYTES_PER_ELEMENT,d,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const d=e.get(a);(!d||d.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}var Kh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Zh=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,jh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Jh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Qh=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,ef=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,tf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,nf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,rf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,sf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,of=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,af=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,lf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,cf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,uf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,df=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,hf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ff=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,pf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,mf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,gf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,_f=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,vf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,xf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Mf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Sf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,yf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ef=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Tf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,bf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Af="gl_FragColor = linearToOutputTexel( gl_FragColor );",wf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Rf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Cf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Pf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Df=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Lf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,If=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Uf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Nf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ff=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Of=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Bf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,zf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Hf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,kf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Vf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Gf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Wf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Xf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,qf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Yf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,$f=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Kf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Zf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,jf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Jf=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Qf=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ep=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,tp=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,np=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,ip=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,rp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,sp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,op=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ap=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,lp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,cp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,up=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,dp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,hp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,fp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,pp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,mp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,gp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,_p=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,vp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,xp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Mp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Sp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,yp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Ep=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Tp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,bp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ap=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,wp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Rp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Cp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Pp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Dp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSEDEPTHBUF
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSEDEPTHBUF
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare , distribution.x );
		#endif
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Lp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Ip=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Up=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Np=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Fp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Op=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Bp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,zp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Hp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,kp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Vp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Gp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Wp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Xp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,qp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Yp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,$p=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Kp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Zp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Jp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,em=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,nm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSEDEPTHBUF
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,im=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,rm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,sm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,om=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,am=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,lm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,cm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,um=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,dm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,hm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,pm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,gm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,_m=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,vm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Mm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ym=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Em=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Tm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,bm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Am=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,wm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Rm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,He={alphahash_fragment:Kh,alphahash_pars_fragment:Zh,alphamap_fragment:jh,alphamap_pars_fragment:Jh,alphatest_fragment:Qh,alphatest_pars_fragment:ef,aomap_fragment:tf,aomap_pars_fragment:nf,batching_pars_vertex:rf,batching_vertex:sf,begin_vertex:of,beginnormal_vertex:af,bsdfs:lf,iridescence_fragment:cf,bumpmap_pars_fragment:uf,clipping_planes_fragment:df,clipping_planes_pars_fragment:hf,clipping_planes_pars_vertex:ff,clipping_planes_vertex:pf,color_fragment:mf,color_pars_fragment:gf,color_pars_vertex:_f,color_vertex:vf,common:xf,cube_uv_reflection_fragment:Mf,defaultnormal_vertex:Sf,displacementmap_pars_vertex:yf,displacementmap_vertex:Ef,emissivemap_fragment:Tf,emissivemap_pars_fragment:bf,colorspace_fragment:Af,colorspace_pars_fragment:wf,envmap_fragment:Rf,envmap_common_pars_fragment:Cf,envmap_pars_fragment:Pf,envmap_pars_vertex:Df,envmap_physical_pars_fragment:Vf,envmap_vertex:Lf,fog_vertex:If,fog_pars_vertex:Uf,fog_fragment:Nf,fog_pars_fragment:Ff,gradientmap_pars_fragment:Of,lightmap_pars_fragment:Bf,lights_lambert_fragment:zf,lights_lambert_pars_fragment:Hf,lights_pars_begin:kf,lights_toon_fragment:Gf,lights_toon_pars_fragment:Wf,lights_phong_fragment:Xf,lights_phong_pars_fragment:qf,lights_physical_fragment:Yf,lights_physical_pars_fragment:$f,lights_fragment_begin:Kf,lights_fragment_maps:Zf,lights_fragment_end:jf,logdepthbuf_fragment:Jf,logdepthbuf_pars_fragment:Qf,logdepthbuf_pars_vertex:ep,logdepthbuf_vertex:tp,map_fragment:np,map_pars_fragment:ip,map_particle_fragment:rp,map_particle_pars_fragment:sp,metalnessmap_fragment:op,metalnessmap_pars_fragment:ap,morphinstance_vertex:lp,morphcolor_vertex:cp,morphnormal_vertex:up,morphtarget_pars_vertex:dp,morphtarget_vertex:hp,normal_fragment_begin:fp,normal_fragment_maps:pp,normal_pars_fragment:mp,normal_pars_vertex:gp,normal_vertex:_p,normalmap_pars_fragment:vp,clearcoat_normal_fragment_begin:xp,clearcoat_normal_fragment_maps:Mp,clearcoat_pars_fragment:Sp,iridescence_pars_fragment:yp,opaque_fragment:Ep,packing:Tp,premultiplied_alpha_fragment:bp,project_vertex:Ap,dithering_fragment:wp,dithering_pars_fragment:Rp,roughnessmap_fragment:Cp,roughnessmap_pars_fragment:Pp,shadowmap_pars_fragment:Dp,shadowmap_pars_vertex:Lp,shadowmap_vertex:Ip,shadowmask_pars_fragment:Up,skinbase_vertex:Np,skinning_pars_vertex:Fp,skinning_vertex:Op,skinnormal_vertex:Bp,specularmap_fragment:zp,specularmap_pars_fragment:Hp,tonemapping_fragment:kp,tonemapping_pars_fragment:Vp,transmission_fragment:Gp,transmission_pars_fragment:Wp,uv_pars_fragment:Xp,uv_pars_vertex:qp,uv_vertex:Yp,worldpos_vertex:$p,background_vert:Kp,background_frag:Zp,backgroundCube_vert:jp,backgroundCube_frag:Jp,cube_vert:Qp,cube_frag:em,depth_vert:tm,depth_frag:nm,distanceRGBA_vert:im,distanceRGBA_frag:rm,equirect_vert:sm,equirect_frag:om,linedashed_vert:am,linedashed_frag:lm,meshbasic_vert:cm,meshbasic_frag:um,meshlambert_vert:dm,meshlambert_frag:hm,meshmatcap_vert:fm,meshmatcap_frag:pm,meshnormal_vert:mm,meshnormal_frag:gm,meshphong_vert:_m,meshphong_frag:vm,meshphysical_vert:xm,meshphysical_frag:Mm,meshtoon_vert:Sm,meshtoon_frag:ym,points_vert:Em,points_frag:Tm,shadow_vert:bm,shadow_frag:Am,sprite_vert:wm,sprite_frag:Rm},se={common:{diffuse:{value:new Xe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ze}},envmap:{envMap:{value:null},envMapRotation:{value:new ze},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ze},normalScale:{value:new We(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Xe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Xe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0},uvTransform:{value:new ze}},sprite:{diffuse:{value:new Xe(16777215)},opacity:{value:1},center:{value:new We(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}}},Ct={basic:{uniforms:bt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.fog]),vertexShader:He.meshbasic_vert,fragmentShader:He.meshbasic_frag},lambert:{uniforms:bt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new Xe(0)}}]),vertexShader:He.meshlambert_vert,fragmentShader:He.meshlambert_frag},phong:{uniforms:bt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new Xe(0)},specular:{value:new Xe(1118481)},shininess:{value:30}}]),vertexShader:He.meshphong_vert,fragmentShader:He.meshphong_frag},standard:{uniforms:bt([se.common,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.roughnessmap,se.metalnessmap,se.fog,se.lights,{emissive:{value:new Xe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag},toon:{uniforms:bt([se.common,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.gradientmap,se.fog,se.lights,{emissive:{value:new Xe(0)}}]),vertexShader:He.meshtoon_vert,fragmentShader:He.meshtoon_frag},matcap:{uniforms:bt([se.common,se.bumpmap,se.normalmap,se.displacementmap,se.fog,{matcap:{value:null}}]),vertexShader:He.meshmatcap_vert,fragmentShader:He.meshmatcap_frag},points:{uniforms:bt([se.points,se.fog]),vertexShader:He.points_vert,fragmentShader:He.points_frag},dashed:{uniforms:bt([se.common,se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:He.linedashed_vert,fragmentShader:He.linedashed_frag},depth:{uniforms:bt([se.common,se.displacementmap]),vertexShader:He.depth_vert,fragmentShader:He.depth_frag},normal:{uniforms:bt([se.common,se.bumpmap,se.normalmap,se.displacementmap,{opacity:{value:1}}]),vertexShader:He.meshnormal_vert,fragmentShader:He.meshnormal_frag},sprite:{uniforms:bt([se.sprite,se.fog]),vertexShader:He.sprite_vert,fragmentShader:He.sprite_frag},background:{uniforms:{uvTransform:{value:new ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:He.background_vert,fragmentShader:He.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ze}},vertexShader:He.backgroundCube_vert,fragmentShader:He.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:He.cube_vert,fragmentShader:He.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:He.equirect_vert,fragmentShader:He.equirect_frag},distanceRGBA:{uniforms:bt([se.common,se.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:He.distanceRGBA_vert,fragmentShader:He.distanceRGBA_frag},shadow:{uniforms:bt([se.lights,se.fog,{color:{value:new Xe(0)},opacity:{value:1}}]),vertexShader:He.shadow_vert,fragmentShader:He.shadow_frag}};Ct.physical={uniforms:bt([Ct.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ze},clearcoatNormalScale:{value:new We(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ze},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ze},sheen:{value:0},sheenColor:{value:new Xe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ze},transmissionSamplerSize:{value:new We},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ze},attenuationDistance:{value:0},attenuationColor:{value:new Xe(0)},specularColor:{value:new Xe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ze},anisotropyVector:{value:new We},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ze}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag};const Pr={r:0,b:0,g:0},Gn=new sn,Cm=new at;function Pm(n,e,t,i,r,s,o){const a=new Xe(0);let l=s===!0?0:1,c,d,u=null,h=0,p=null;function g(E){let v=E.isScene===!0?E.background:null;return v&&v.isTexture&&(v=(E.backgroundBlurriness>0?t:e).get(v)),v}function _(E){let v=!1;const R=g(E);R===null?f(a,l):R&&R.isColor&&(f(R,1),v=!0);const T=n.xr.getEnvironmentBlendMode();T==="additive"?i.buffers.color.setClear(0,0,0,1,o):T==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||v)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(E,v){const R=g(v);R&&(R.isCubeTexture||R.mapping===ns)?(d===void 0&&(d=new ft(new ar(1,1,1),new Mn({name:"BackgroundCubeMaterial",uniforms:Ui(Ct.backgroundCube.uniforms),vertexShader:Ct.backgroundCube.vertexShader,fragmentShader:Ct.backgroundCube.fragmentShader,side:Pt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),d.geometry.deleteAttribute("normal"),d.geometry.deleteAttribute("uv"),d.onBeforeRender=function(T,C,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(d)),Gn.copy(v.backgroundRotation),Gn.x*=-1,Gn.y*=-1,Gn.z*=-1,R.isCubeTexture&&R.isRenderTargetTexture===!1&&(Gn.y*=-1,Gn.z*=-1),d.material.uniforms.envMap.value=R,d.material.uniforms.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,d.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(Cm.makeRotationFromEuler(Gn)),d.material.toneMapped=Ye.getTransfer(R.colorSpace)!==et,(u!==R||h!==R.version||p!==n.toneMapping)&&(d.material.needsUpdate=!0,u=R,h=R.version,p=n.toneMapping),d.layers.enableAll(),E.unshift(d,d.geometry,d.material,0,0,null)):R&&R.isTexture&&(c===void 0&&(c=new ft(new is(2,2),new Mn({name:"BackgroundMaterial",uniforms:Ui(Ct.background.uniforms),vertexShader:Ct.background.vertexShader,fragmentShader:Ct.background.fragmentShader,side:Nn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=R,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=Ye.getTransfer(R.colorSpace)!==et,R.matrixAutoUpdate===!0&&R.updateMatrix(),c.material.uniforms.uvTransform.value.copy(R.matrix),(u!==R||h!==R.version||p!==n.toneMapping)&&(c.material.needsUpdate=!0,u=R,h=R.version,p=n.toneMapping),c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null))}function f(E,v){E.getRGB(Pr,Cc(n)),i.buffers.color.setClear(Pr.r,Pr.g,Pr.b,v,o)}function b(){d!==void 0&&(d.geometry.dispose(),d.material.dispose(),d=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(E,v=1){a.set(E),l=v,f(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(E){l=E,f(a,l)},render:_,addToRenderList:m,dispose:b}}function Dm(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=h(null);let s=r,o=!1;function a(M,w,O,N,V){let q=!1;const X=u(N,O,w);s!==X&&(s=X,c(s.object)),q=p(M,N,O,V),q&&g(M,N,O,V),V!==null&&e.update(V,n.ELEMENT_ARRAY_BUFFER),(q||o)&&(o=!1,v(M,w,O,N),V!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(V).buffer))}function l(){return n.createVertexArray()}function c(M){return n.bindVertexArray(M)}function d(M){return n.deleteVertexArray(M)}function u(M,w,O){const N=O.wireframe===!0;let V=i[M.id];V===void 0&&(V={},i[M.id]=V);let q=V[w.id];q===void 0&&(q={},V[w.id]=q);let X=q[N];return X===void 0&&(X=h(l()),q[N]=X),X}function h(M){const w=[],O=[],N=[];for(let V=0;V<t;V++)w[V]=0,O[V]=0,N[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:w,enabledAttributes:O,attributeDivisors:N,object:M,attributes:{},index:null}}function p(M,w,O,N){const V=s.attributes,q=w.attributes;let X=0;const K=O.getAttributes();for(const H in K)if(K[H].location>=0){const oe=V[H];let xe=q[H];if(xe===void 0&&(H==="instanceMatrix"&&M.instanceMatrix&&(xe=M.instanceMatrix),H==="instanceColor"&&M.instanceColor&&(xe=M.instanceColor)),oe===void 0||oe.attribute!==xe||xe&&oe.data!==xe.data)return!0;X++}return s.attributesNum!==X||s.index!==N}function g(M,w,O,N){const V={},q=w.attributes;let X=0;const K=O.getAttributes();for(const H in K)if(K[H].location>=0){let oe=q[H];oe===void 0&&(H==="instanceMatrix"&&M.instanceMatrix&&(oe=M.instanceMatrix),H==="instanceColor"&&M.instanceColor&&(oe=M.instanceColor));const xe={};xe.attribute=oe,oe&&oe.data&&(xe.data=oe.data),V[H]=xe,X++}s.attributes=V,s.attributesNum=X,s.index=N}function _(){const M=s.newAttributes;for(let w=0,O=M.length;w<O;w++)M[w]=0}function m(M){f(M,0)}function f(M,w){const O=s.newAttributes,N=s.enabledAttributes,V=s.attributeDivisors;O[M]=1,N[M]===0&&(n.enableVertexAttribArray(M),N[M]=1),V[M]!==w&&(n.vertexAttribDivisor(M,w),V[M]=w)}function b(){const M=s.newAttributes,w=s.enabledAttributes;for(let O=0,N=w.length;O<N;O++)w[O]!==M[O]&&(n.disableVertexAttribArray(O),w[O]=0)}function E(M,w,O,N,V,q,X){X===!0?n.vertexAttribIPointer(M,w,O,V,q):n.vertexAttribPointer(M,w,O,N,V,q)}function v(M,w,O,N){_();const V=N.attributes,q=O.getAttributes(),X=w.defaultAttributeValues;for(const K in q){const H=q[K];if(H.location>=0){let ne=V[K];if(ne===void 0&&(K==="instanceMatrix"&&M.instanceMatrix&&(ne=M.instanceMatrix),K==="instanceColor"&&M.instanceColor&&(ne=M.instanceColor)),ne!==void 0){const oe=ne.normalized,xe=ne.itemSize,Ie=e.get(ne);if(Ie===void 0)continue;const nt=Ie.buffer,Ze=Ie.type,Y=Ie.bytesPerElement,ae=Ze===n.INT||Ze===n.UNSIGNED_INT||ne.gpuType===Jo;if(ne.isInterleavedBufferAttribute){const ie=ne.data,be=ie.stride,Ae=ne.offset;if(ie.isInstancedInterleavedBuffer){for(let Pe=0;Pe<H.locationSize;Pe++)f(H.location+Pe,ie.meshPerAttribute);M.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let Pe=0;Pe<H.locationSize;Pe++)m(H.location+Pe);n.bindBuffer(n.ARRAY_BUFFER,nt);for(let Pe=0;Pe<H.locationSize;Pe++)E(H.location+Pe,xe/H.locationSize,Ze,oe,be*Y,(Ae+xe/H.locationSize*Pe)*Y,ae)}else{if(ne.isInstancedBufferAttribute){for(let ie=0;ie<H.locationSize;ie++)f(H.location+ie,ne.meshPerAttribute);M.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=ne.meshPerAttribute*ne.count)}else for(let ie=0;ie<H.locationSize;ie++)m(H.location+ie);n.bindBuffer(n.ARRAY_BUFFER,nt);for(let ie=0;ie<H.locationSize;ie++)E(H.location+ie,xe/H.locationSize,Ze,oe,xe*Y,xe/H.locationSize*ie*Y,ae)}}else if(X!==void 0){const oe=X[K];if(oe!==void 0)switch(oe.length){case 2:n.vertexAttrib2fv(H.location,oe);break;case 3:n.vertexAttrib3fv(H.location,oe);break;case 4:n.vertexAttrib4fv(H.location,oe);break;default:n.vertexAttrib1fv(H.location,oe)}}}}b()}function R(){D();for(const M in i){const w=i[M];for(const O in w){const N=w[O];for(const V in N)d(N[V].object),delete N[V];delete w[O]}delete i[M]}}function T(M){if(i[M.id]===void 0)return;const w=i[M.id];for(const O in w){const N=w[O];for(const V in N)d(N[V].object),delete N[V];delete w[O]}delete i[M.id]}function C(M){for(const w in i){const O=i[w];if(O[M.id]===void 0)continue;const N=O[M.id];for(const V in N)d(N[V].object),delete N[V];delete O[M.id]}}function D(){y(),o=!0,s!==r&&(s=r,c(s.object))}function y(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:D,resetDefaultState:y,dispose:R,releaseStatesOfGeometry:T,releaseStatesOfProgram:C,initAttributes:_,enableAttribute:m,disableUnusedAttributes:b}}function Lm(n,e,t){let i;function r(c){i=c}function s(c,d){n.drawArrays(i,c,d),t.update(d,i,1)}function o(c,d,u){u!==0&&(n.drawArraysInstanced(i,c,d,u),t.update(d,i,u))}function a(c,d,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,d,0,u);let p=0;for(let g=0;g<u;g++)p+=d[g];t.update(p,i,1)}function l(c,d,u,h){if(u===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<c.length;g++)o(c[g],d[g],h[g]);else{p.multiDrawArraysInstancedWEBGL(i,c,0,d,0,h,0,u);let g=0;for(let _=0;_<u;_++)g+=d[_]*h[_];t.update(g,i,1)}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Im(n,e,t,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const C=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(C){return!(C!==Zt&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(C){const D=C===ir&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==rn&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==mn&&!D)}function l(C){if(C==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const d=l(c);d!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);const u=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),p=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),f=n.getParameter(n.MAX_VERTEX_ATTRIBS),b=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),E=n.getParameter(n.MAX_VARYING_VECTORS),v=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),R=g>0,T=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:h,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:b,maxVaryings:E,maxFragmentUniforms:v,vertexTextures:R,maxSamples:T}}function Um(n){const e=this;let t=null,i=0,r=!1,s=!1;const o=new Xn,a=new ze,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,h){const p=u.length!==0||h||i!==0||r;return r=h,i=u.length,p},this.beginShadows=function(){s=!0,d(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,h){t=d(u,h,0)},this.setState=function(u,h,p){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,f=n.get(u);if(!r||g===null||g.length===0||s&&!m)s?d(null):c();else{const b=s?0:i,E=b*4;let v=f.clippingState||null;l.value=v,v=d(g,h,E,p);for(let R=0;R!==E;++R)v[R]=t[R];f.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function d(u,h,p,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const f=p+_*4,b=h.matrixWorldInverse;a.getNormalMatrix(b),(m===null||m.length<f)&&(m=new Float32Array(f));for(let E=0,v=p;E!==_;++E,v+=4)o.copy(u[E]).applyMatrix4(b,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function Nm(n){let e=new WeakMap;function t(o,a){return a===fo?o.mapping=Di:a===po&&(o.mapping=Li),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===fo||a===po)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Eh(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}const Ti=4,tl=[.125,.215,.35,.446,.526,.582],$n=20,Fs=new Nc,nl=new Xe;let Os=null,Bs=0,zs=0,Hs=!1;const qn=(1+Math.sqrt(5))/2,Si=1/qn,il=[new I(-qn,Si,0),new I(qn,Si,0),new I(-Si,0,qn),new I(Si,0,qn),new I(0,qn,-Si),new I(0,qn,Si),new I(-1,1,-1),new I(1,1,-1),new I(-1,1,1),new I(1,1,1)],Fm=new I;class rl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100,s={}){const{size:o=256,position:a=Fm}=s;Os=this._renderer.getRenderTarget(),Bs=this._renderer.getActiveCubeFace(),zs=this._renderer.getActiveMipmapLevel(),Hs=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,r,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=al(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ol(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Os,Bs,zs),this._renderer.xr.enabled=Hs,e.scissorTest=!1,Dr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Di||e.mapping===Li?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Os=this._renderer.getRenderTarget(),Bs=this._renderer.getActiveCubeFace(),zs=this._renderer.getActiveMipmapLevel(),Hs=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Kt,minFilter:Kt,generateMipmaps:!1,type:ir,format:Zt,colorSpace:Ii,depthBuffer:!1},r=sl(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=sl(e,t,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Om(s)),this._blurMaterial=Bm(s,e,t)}return r}_compileMaterial(e){const t=new ft(this._lodPlanes[0],e);this._renderer.compile(t,Fs)}_sceneToCubeUV(e,t,i,r,s){const l=new Gt(90,1,t,i),c=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,p=u.toneMapping;u.getClearColor(nl),u.toneMapping=Un,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(r),u.clearDepth(),u.setRenderTarget(null));const _=new gn({name:"PMREM.Background",side:Pt,depthWrite:!1,depthTest:!1}),m=new ft(new ar,_);let f=!1;const b=e.background;b?b.isColor&&(_.color.copy(b),e.background=null,f=!0):(_.color.copy(nl),f=!0);for(let E=0;E<6;E++){const v=E%3;v===0?(l.up.set(0,c[E],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+d[E],s.y,s.z)):v===1?(l.up.set(0,0,c[E]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+d[E],s.z)):(l.up.set(0,c[E],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+d[E]));const R=this._cubeSize;Dr(r,v*R,E>2?R:0,R,R),u.setRenderTarget(r),f&&u.render(m,l),u.render(e,l)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=p,u.autoClear=h,e.background=b}_textureToCubeUV(e,t){const i=this._renderer,r=e.mapping===Di||e.mapping===Li;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=al()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ol());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new ft(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;Dr(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Fs)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=il[(r-s-1)%il.length];this._blur(e,s-1,s,o,a)}t.autoClear=i}_blur(e,t,i,r,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const d=3,u=new ft(this._lodPlanes[r],c),h=c.uniforms,p=this._sizeLods[i]-1,g=isFinite(s)?Math.PI/(2*p):2*Math.PI/(2*$n-1),_=s/g,m=isFinite(s)?1+Math.floor(d*_):$n;m>$n&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${$n}`);const f=[];let b=0;for(let C=0;C<$n;++C){const D=C/_,y=Math.exp(-D*D/2);f.push(y),C===0?b+=y:C<m&&(b+=2*y)}for(let C=0;C<f.length;C++)f[C]=f[C]/b;h.envMap.value=e.texture,h.samples.value=m,h.weights.value=f,h.latitudinal.value=o==="latitudinal",a&&(h.poleAxis.value=a);const{_lodMax:E}=this;h.dTheta.value=g,h.mipInt.value=E-i;const v=this._sizeLods[r],R=3*v*(r>E-Ti?r-E+Ti:0),T=4*(this._cubeSize-v);Dr(t,R,T,3*v,2*v),l.setRenderTarget(t),l.render(u,Fs)}}function Om(n){const e=[],t=[],i=[];let r=n;const s=n-Ti+1+tl.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);t.push(a);let l=1/a;o>n-Ti?l=tl[o-n+Ti-1]:o===0&&(l=0),i.push(l);const c=1/(a-2),d=-c,u=1+c,h=[d,d,u,d,u,u,d,d,u,u,d,u],p=6,g=6,_=3,m=2,f=1,b=new Float32Array(_*g*p),E=new Float32Array(m*g*p),v=new Float32Array(f*g*p);for(let T=0;T<p;T++){const C=T%3*2/3-1,D=T>2?0:-1,y=[C,D,0,C+2/3,D,0,C+2/3,D+1,0,C,D,0,C+2/3,D+1,0,C,D+1,0];b.set(y,_*g*T),E.set(h,m*g*T);const M=[T,T,T,T,T,T];v.set(M,f*g*T)}const R=new Lt;R.setAttribute("position",new Dt(b,_)),R.setAttribute("uv",new Dt(E,m)),R.setAttribute("faceIndex",new Dt(v,f)),e.push(R),r>Ti&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function sl(n,e,t){const i=new ti(n,e,t);return i.texture.mapping=ns,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Dr(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function Bm(n,e,t){const i=new Float32Array($n),r=new I(0,1,0);return new Mn({name:"SphericalGaussianBlur",defines:{n:$n,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:fa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function ol(){return new Mn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:fa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function al(){return new Mn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:fa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function fa(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function zm(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===fo||l===po,d=l===Di||l===Li;if(c||d){let u=e.get(a);const h=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==h)return t===null&&(t=new rl(n)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const p=a.image;return c&&p&&p.height>0||d&&p&&r(p)?(t===null&&(t=new rl(n)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",s),u.texture):null}}}return a}function r(a){let l=0;const c=6;for(let d=0;d<c;d++)a[d]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function Hm(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const r=t(i);return r===null&&wi("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function km(n,e,t,i){const r={},s=new WeakMap;function o(u){const h=u.target;h.index!==null&&e.remove(h.index);for(const g in h.attributes)e.remove(h.attributes[g]);h.removeEventListener("dispose",o),delete r[h.id];const p=s.get(h);p&&(e.remove(p),s.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(u,h){return r[h.id]===!0||(h.addEventListener("dispose",o),r[h.id]=!0,t.memory.geometries++),h}function l(u){const h=u.attributes;for(const p in h)e.update(h[p],n.ARRAY_BUFFER)}function c(u){const h=[],p=u.index,g=u.attributes.position;let _=0;if(p!==null){const b=p.array;_=p.version;for(let E=0,v=b.length;E<v;E+=3){const R=b[E+0],T=b[E+1],C=b[E+2];h.push(R,T,T,C,C,R)}}else if(g!==void 0){const b=g.array;_=g.version;for(let E=0,v=b.length/3-1;E<v;E+=3){const R=E+0,T=E+1,C=E+2;h.push(R,T,T,C,C,R)}}else return;const m=new(Ec(h)?Rc:wc)(h,1);m.version=_;const f=s.get(u);f&&e.remove(f),s.set(u,m)}function d(u){const h=s.get(u);if(h){const p=u.index;p!==null&&h.version<p.version&&c(u)}else c(u);return s.get(u)}return{get:a,update:l,getWireframeAttribute:d}}function Vm(n,e,t){let i;function r(h){i=h}let s,o;function a(h){s=h.type,o=h.bytesPerElement}function l(h,p){n.drawElements(i,p,s,h*o),t.update(p,i,1)}function c(h,p,g){g!==0&&(n.drawElementsInstanced(i,p,s,h*o,g),t.update(p,i,g))}function d(h,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,p,0,s,h,0,g);let m=0;for(let f=0;f<g;f++)m+=p[f];t.update(m,i,1)}function u(h,p,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<h.length;f++)c(h[f]/o,p[f],_[f]);else{m.multiDrawElementsInstancedWEBGL(i,p,0,s,h,0,_,0,g);let f=0;for(let b=0;b<g;b++)f+=p[b]*_[b];t.update(f,i,1)}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=d,this.renderMultiDrawInstances=u}function Gm(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(s/3);break;case n.LINES:t.lines+=a*(s/2);break;case n.LINE_STRIP:t.lines+=a*(s-1);break;case n.LINE_LOOP:t.lines+=a*s;break;case n.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function Wm(n,e,t){const i=new WeakMap,r=new tt;function s(o,a,l){const c=o.morphTargetInfluences,d=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=d!==void 0?d.length:0;let h=i.get(a);if(h===void 0||h.count!==u){let M=function(){D.dispose(),i.delete(a),a.removeEventListener("dispose",M)};var p=M;h!==void 0&&h.texture.dispose();const g=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,f=a.morphAttributes.position||[],b=a.morphAttributes.normal||[],E=a.morphAttributes.color||[];let v=0;g===!0&&(v=1),_===!0&&(v=2),m===!0&&(v=3);let R=a.attributes.position.count*v,T=1;R>e.maxTextureSize&&(T=Math.ceil(R/e.maxTextureSize),R=e.maxTextureSize);const C=new Float32Array(R*T*4*u),D=new Tc(C,R,T,u);D.type=mn,D.needsUpdate=!0;const y=v*4;for(let w=0;w<u;w++){const O=f[w],N=b[w],V=E[w],q=R*T*4*w;for(let X=0;X<O.count;X++){const K=X*y;g===!0&&(r.fromBufferAttribute(O,X),C[q+K+0]=r.x,C[q+K+1]=r.y,C[q+K+2]=r.z,C[q+K+3]=0),_===!0&&(r.fromBufferAttribute(N,X),C[q+K+4]=r.x,C[q+K+5]=r.y,C[q+K+6]=r.z,C[q+K+7]=0),m===!0&&(r.fromBufferAttribute(V,X),C[q+K+8]=r.x,C[q+K+9]=r.y,C[q+K+10]=r.z,C[q+K+11]=V.itemSize===4?r.w:1)}}h={count:u,texture:D,size:new We(R,T)},i.set(a,h),a.addEventListener("dispose",M)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const _=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(n,"morphTargetBaseInfluence",_),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",h.size)}return{update:s}}function Xm(n,e,t,i){let r=new WeakMap;function s(l){const c=i.render.frame,d=l.geometry,u=e.get(l,d);if(r.get(u)!==c&&(e.update(u),r.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const h=l.skeleton;r.get(h)!==c&&(h.update(),r.set(h,c))}return u}function o(){r=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}const Oc=new wt,ll=new Lc(1,1),Bc=new Tc,zc=new ah,Hc=new Dc,cl=[],ul=[],dl=new Float32Array(16),hl=new Float32Array(9),fl=new Float32Array(4);function Fi(n,e,t){const i=n[0];if(i<=0||i>0)return n;const r=e*t;let s=cl[r];if(s===void 0&&(s=new Float32Array(r),cl[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(s,a)}return s}function pt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function mt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function rs(n,e){let t=ul[e];t===void 0&&(t=new Int32Array(e),ul[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function qm(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Ym(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(pt(t,e))return;n.uniform2fv(this.addr,e),mt(t,e)}}function $m(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(pt(t,e))return;n.uniform3fv(this.addr,e),mt(t,e)}}function Km(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(pt(t,e))return;n.uniform4fv(this.addr,e),mt(t,e)}}function Zm(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(pt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),mt(t,e)}else{if(pt(t,i))return;fl.set(i),n.uniformMatrix2fv(this.addr,!1,fl),mt(t,i)}}function jm(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(pt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),mt(t,e)}else{if(pt(t,i))return;hl.set(i),n.uniformMatrix3fv(this.addr,!1,hl),mt(t,i)}}function Jm(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(pt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),mt(t,e)}else{if(pt(t,i))return;dl.set(i),n.uniformMatrix4fv(this.addr,!1,dl),mt(t,i)}}function Qm(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function eg(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(pt(t,e))return;n.uniform2iv(this.addr,e),mt(t,e)}}function tg(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(pt(t,e))return;n.uniform3iv(this.addr,e),mt(t,e)}}function ng(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(pt(t,e))return;n.uniform4iv(this.addr,e),mt(t,e)}}function ig(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function rg(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(pt(t,e))return;n.uniform2uiv(this.addr,e),mt(t,e)}}function sg(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(pt(t,e))return;n.uniform3uiv(this.addr,e),mt(t,e)}}function og(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(pt(t,e))return;n.uniform4uiv(this.addr,e),mt(t,e)}}function ag(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s;this.type===n.SAMPLER_2D_SHADOW?(ll.compareFunction=yc,s=ll):s=Oc,t.setTexture2D(e||s,r)}function lg(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||zc,r)}function cg(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||Hc,r)}function ug(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||Bc,r)}function dg(n){switch(n){case 5126:return qm;case 35664:return Ym;case 35665:return $m;case 35666:return Km;case 35674:return Zm;case 35675:return jm;case 35676:return Jm;case 5124:case 35670:return Qm;case 35667:case 35671:return eg;case 35668:case 35672:return tg;case 35669:case 35673:return ng;case 5125:return ig;case 36294:return rg;case 36295:return sg;case 36296:return og;case 35678:case 36198:case 36298:case 36306:case 35682:return ag;case 35679:case 36299:case 36307:return lg;case 35680:case 36300:case 36308:case 36293:return cg;case 36289:case 36303:case 36311:case 36292:return ug}}function hg(n,e){n.uniform1fv(this.addr,e)}function fg(n,e){const t=Fi(e,this.size,2);n.uniform2fv(this.addr,t)}function pg(n,e){const t=Fi(e,this.size,3);n.uniform3fv(this.addr,t)}function mg(n,e){const t=Fi(e,this.size,4);n.uniform4fv(this.addr,t)}function gg(n,e){const t=Fi(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function _g(n,e){const t=Fi(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function vg(n,e){const t=Fi(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function xg(n,e){n.uniform1iv(this.addr,e)}function Mg(n,e){n.uniform2iv(this.addr,e)}function Sg(n,e){n.uniform3iv(this.addr,e)}function yg(n,e){n.uniform4iv(this.addr,e)}function Eg(n,e){n.uniform1uiv(this.addr,e)}function Tg(n,e){n.uniform2uiv(this.addr,e)}function bg(n,e){n.uniform3uiv(this.addr,e)}function Ag(n,e){n.uniform4uiv(this.addr,e)}function wg(n,e,t){const i=this.cache,r=e.length,s=rs(t,r);pt(i,s)||(n.uniform1iv(this.addr,s),mt(i,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||Oc,s[o])}function Rg(n,e,t){const i=this.cache,r=e.length,s=rs(t,r);pt(i,s)||(n.uniform1iv(this.addr,s),mt(i,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||zc,s[o])}function Cg(n,e,t){const i=this.cache,r=e.length,s=rs(t,r);pt(i,s)||(n.uniform1iv(this.addr,s),mt(i,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||Hc,s[o])}function Pg(n,e,t){const i=this.cache,r=e.length,s=rs(t,r);pt(i,s)||(n.uniform1iv(this.addr,s),mt(i,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||Bc,s[o])}function Dg(n){switch(n){case 5126:return hg;case 35664:return fg;case 35665:return pg;case 35666:return mg;case 35674:return gg;case 35675:return _g;case 35676:return vg;case 5124:case 35670:return xg;case 35667:case 35671:return Mg;case 35668:case 35672:return Sg;case 35669:case 35673:return yg;case 5125:return Eg;case 36294:return Tg;case 36295:return bg;case 36296:return Ag;case 35678:case 36198:case 36298:case 36306:case 35682:return wg;case 35679:case 36299:case 36307:return Rg;case 35680:case 36300:case 36308:case 36293:return Cg;case 36289:case 36303:case 36311:case 36292:return Pg}}class Lg{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=dg(t.type)}}class Ig{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Dg(t.type)}}class Ug{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(e,t[a.id],i)}}}const ks=/(\w+)(\])?(\[|\.)?/g;function pl(n,e){n.seq.push(e),n.map[e.id]=e}function Ng(n,e,t){const i=n.name,r=i.length;for(ks.lastIndex=0;;){const s=ks.exec(i),o=ks.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){pl(t,c===void 0?new Lg(a,n,e):new Ig(a,n,e));break}else{let u=t.map[a];u===void 0&&(u=new Ug(a),pl(t,u)),t=u}}}class Xr{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);Ng(s,o,this)}}setValue(e,t,i,r){const s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){const r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,o=t.length;s!==o;++s){const a=t[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){const i=[];for(let r=0,s=e.length;r!==s;++r){const o=e[r];o.id in t&&i.push(o)}return i}}function ml(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const Fg=37297;let Og=0;function Bg(n,e){const t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const gl=new ze;function zg(n){Ye._getMatrix(gl,Ye.workingColorSpace,n);const e=`mat3( ${gl.elements.map(t=>t.toFixed(4))} )`;switch(Ye.getTransfer(n)){case Kr:return[e,"LinearTransferOETF"];case et:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function _l(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),s=(n.getShaderInfoLog(e)||"").trim();if(i&&s==="")return"";const o=/ERROR: 0:(\d+)/.exec(s);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+s+`

`+Bg(n.getShaderSource(e),a)}else return s}function Hg(n,e){const t=zg(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function kg(n,e){let t;switch(e){case Md:t="Linear";break;case Sd:t="Reinhard";break;case yd:t="Cineon";break;case Ed:t="ACESFilmic";break;case bd:t="AgX";break;case Ad:t="Neutral";break;case Td:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Lr=new I;function Vg(){Ye.getLuminanceCoefficients(Lr);const n=Lr.x.toFixed(4),e=Lr.y.toFixed(4),t=Lr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Gg(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Wi).join(`
`)}function Wg(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Xg(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=n.getActiveAttrib(e,r),o=s.name;let a=1;s.type===n.FLOAT_MAT2&&(a=2),s.type===n.FLOAT_MAT3&&(a=3),s.type===n.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Wi(n){return n!==""}function vl(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function xl(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const qg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Xo(n){return n.replace(qg,$g)}const Yg=new Map;function $g(n,e){let t=He[e];if(t===void 0){const i=Yg.get(e);if(i!==void 0)t=He[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Xo(t)}const Kg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ml(n){return n.replace(Kg,Zg)}function Zg(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Sl(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function jg(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===uc?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===Qu?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===fn&&(e="SHADOWMAP_TYPE_VSM"),e}function Jg(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case Di:case Li:e="ENVMAP_TYPE_CUBE";break;case ns:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Qg(n){let e="ENVMAP_MODE_REFLECTION";return n.envMap&&n.envMapMode===Li&&(e="ENVMAP_MODE_REFRACTION"),e}function e_(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case dc:e="ENVMAP_BLENDING_MULTIPLY";break;case vd:e="ENVMAP_BLENDING_MIX";break;case xd:e="ENVMAP_BLENDING_ADD";break}return e}function t_(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function n_(n,e,t,i){const r=n.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=jg(t),c=Jg(t),d=Qg(t),u=e_(t),h=t_(t),p=Gg(t),g=Wg(s),_=r.createProgram();let m,f,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Wi).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Wi).join(`
`),f.length>0&&(f+=`
`)):(m=[Sl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reversedDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Wi).join(`
`),f=[Sl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+d:"",t.envMap?"#define "+u:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reversedDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Un?"#define TONE_MAPPING":"",t.toneMapping!==Un?He.tonemapping_pars_fragment:"",t.toneMapping!==Un?kg("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",He.colorspace_pars_fragment,Hg("linearToOutputTexel",t.outputColorSpace),Vg(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Wi).join(`
`)),o=Xo(o),o=vl(o,t),o=xl(o,t),a=Xo(a),a=vl(a,t),a=xl(a,t),o=Ml(o),a=Ml(a),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",t.glslVersion===Ca?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ca?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);const E=b+m+o,v=b+f+a,R=ml(r,r.VERTEX_SHADER,E),T=ml(r,r.FRAGMENT_SHADER,v);r.attachShader(_,R),r.attachShader(_,T),t.index0AttributeName!==void 0?r.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(_,0,"position"),r.linkProgram(_);function C(w){if(n.debug.checkShaderErrors){const O=r.getProgramInfoLog(_)||"",N=r.getShaderInfoLog(R)||"",V=r.getShaderInfoLog(T)||"",q=O.trim(),X=N.trim(),K=V.trim();let H=!0,ne=!0;if(r.getProgramParameter(_,r.LINK_STATUS)===!1)if(H=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,_,R,T);else{const oe=_l(r,R,"vertex"),xe=_l(r,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(_,r.VALIDATE_STATUS)+`

Material Name: `+w.name+`
Material Type: `+w.type+`

Program Info Log: `+q+`
`+oe+`
`+xe)}else q!==""?console.warn("THREE.WebGLProgram: Program Info Log:",q):(X===""||K==="")&&(ne=!1);ne&&(w.diagnostics={runnable:H,programLog:q,vertexShader:{log:X,prefix:m},fragmentShader:{log:K,prefix:f}})}r.deleteShader(R),r.deleteShader(T),D=new Xr(r,_),y=Xg(r,_)}let D;this.getUniforms=function(){return D===void 0&&C(this),D};let y;this.getAttributes=function(){return y===void 0&&C(this),y};let M=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=r.getProgramParameter(_,Fg)),M},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Og++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=R,this.fragmentShader=T,this}let i_=0;class r_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new s_(e),t.set(e,i)),i}}class s_{constructor(e){this.id=i_++,this.code=e,this.usedTimes=0}}function o_(n,e,t,i,r,s,o){const a=new oa,l=new r_,c=new Set,d=[],u=r.logarithmicDepthBuffer,h=r.vertexTextures;let p=r.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(y){return c.add(y),y===0?"uv":`uv${y}`}function m(y,M,w,O,N){const V=O.fog,q=N.geometry,X=y.isMeshStandardMaterial?O.environment:null,K=(y.isMeshStandardMaterial?t:e).get(y.envMap||X),H=K&&K.mapping===ns?K.image.height:null,ne=g[y.type];y.precision!==null&&(p=r.getMaxPrecision(y.precision),p!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",p,"instead."));const oe=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,xe=oe!==void 0?oe.length:0;let Ie=0;q.morphAttributes.position!==void 0&&(Ie=1),q.morphAttributes.normal!==void 0&&(Ie=2),q.morphAttributes.color!==void 0&&(Ie=3);let nt,Ze,Y,ae;if(ne){const Ke=Ct[ne];nt=Ke.vertexShader,Ze=Ke.fragmentShader}else nt=y.vertexShader,Ze=y.fragmentShader,l.update(y),Y=l.getVertexShaderID(y),ae=l.getFragmentShaderID(y);const ie=n.getRenderTarget(),be=n.state.buffers.depth.getReversed(),Ae=N.isInstancedMesh===!0,Pe=N.isBatchedMesh===!0,st=!!y.map,ke=!!y.matcap,P=!!K,$e=!!y.aoMap,ye=!!y.lightMap,Fe=!!y.bumpMap,_e=!!y.normalMap,je=!!y.displacementMap,de=!!y.emissiveMap,Oe=!!y.metalnessMap,Le=!!y.roughnessMap,Ve=y.anisotropy>0,A=y.clearcoat>0,x=y.dispersion>0,B=y.iridescence>0,W=y.sheen>0,Z=y.transmission>0,G=Ve&&!!y.anisotropyMap,Me=A&&!!y.clearcoatMap,te=A&&!!y.clearcoatNormalMap,me=A&&!!y.clearcoatRoughnessMap,ve=B&&!!y.iridescenceMap,J=B&&!!y.iridescenceThicknessMap,ue=W&&!!y.sheenColorMap,Ce=W&&!!y.sheenRoughnessMap,Se=!!y.specularMap,le=!!y.specularColorMap,Be=!!y.specularIntensityMap,L=Z&&!!y.transmissionMap,ee=Z&&!!y.thicknessMap,re=!!y.gradientMap,fe=!!y.alphaMap,j=y.alphaTest>0,$=!!y.alphaHash,ge=!!y.extensions;let Ue=Un;y.toneMapped&&(ie===null||ie.isXRRenderTarget===!0)&&(Ue=n.toneMapping);const rt={shaderID:ne,shaderType:y.type,shaderName:y.name,vertexShader:nt,fragmentShader:Ze,defines:y.defines,customVertexShaderID:Y,customFragmentShaderID:ae,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:p,batching:Pe,batchingColor:Pe&&N._colorsTexture!==null,instancing:Ae,instancingColor:Ae&&N.instanceColor!==null,instancingMorph:Ae&&N.morphTexture!==null,supportsVertexTextures:h,outputColorSpace:ie===null?n.outputColorSpace:ie.isXRRenderTarget===!0?ie.texture.colorSpace:Ii,alphaToCoverage:!!y.alphaToCoverage,map:st,matcap:ke,envMap:P,envMapMode:P&&K.mapping,envMapCubeUVHeight:H,aoMap:$e,lightMap:ye,bumpMap:Fe,normalMap:_e,displacementMap:h&&je,emissiveMap:de,normalMapObjectSpace:_e&&y.normalMapType===Pd,normalMapTangentSpace:_e&&y.normalMapType===Sc,metalnessMap:Oe,roughnessMap:Le,anisotropy:Ve,anisotropyMap:G,clearcoat:A,clearcoatMap:Me,clearcoatNormalMap:te,clearcoatRoughnessMap:me,dispersion:x,iridescence:B,iridescenceMap:ve,iridescenceThicknessMap:J,sheen:W,sheenColorMap:ue,sheenRoughnessMap:Ce,specularMap:Se,specularColorMap:le,specularIntensityMap:Be,transmission:Z,transmissionMap:L,thicknessMap:ee,gradientMap:re,opaque:y.transparent===!1&&y.blending===Ai&&y.alphaToCoverage===!1,alphaMap:fe,alphaTest:j,alphaHash:$,combine:y.combine,mapUv:st&&_(y.map.channel),aoMapUv:$e&&_(y.aoMap.channel),lightMapUv:ye&&_(y.lightMap.channel),bumpMapUv:Fe&&_(y.bumpMap.channel),normalMapUv:_e&&_(y.normalMap.channel),displacementMapUv:je&&_(y.displacementMap.channel),emissiveMapUv:de&&_(y.emissiveMap.channel),metalnessMapUv:Oe&&_(y.metalnessMap.channel),roughnessMapUv:Le&&_(y.roughnessMap.channel),anisotropyMapUv:G&&_(y.anisotropyMap.channel),clearcoatMapUv:Me&&_(y.clearcoatMap.channel),clearcoatNormalMapUv:te&&_(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:me&&_(y.clearcoatRoughnessMap.channel),iridescenceMapUv:ve&&_(y.iridescenceMap.channel),iridescenceThicknessMapUv:J&&_(y.iridescenceThicknessMap.channel),sheenColorMapUv:ue&&_(y.sheenColorMap.channel),sheenRoughnessMapUv:Ce&&_(y.sheenRoughnessMap.channel),specularMapUv:Se&&_(y.specularMap.channel),specularColorMapUv:le&&_(y.specularColorMap.channel),specularIntensityMapUv:Be&&_(y.specularIntensityMap.channel),transmissionMapUv:L&&_(y.transmissionMap.channel),thicknessMapUv:ee&&_(y.thicknessMap.channel),alphaMapUv:fe&&_(y.alphaMap.channel),vertexTangents:!!q.attributes.tangent&&(_e||Ve),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!q.attributes.uv&&(st||fe),fog:!!V,useFog:y.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:y.flatShading===!0&&y.wireframe===!1,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:be,skinning:N.isSkinnedMesh===!0,morphTargets:q.morphAttributes.position!==void 0,morphNormals:q.morphAttributes.normal!==void 0,morphColors:q.morphAttributes.color!==void 0,morphTargetsCount:xe,morphTextureStride:Ie,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&w.length>0,shadowMapType:n.shadowMap.type,toneMapping:Ue,decodeVideoTexture:st&&y.map.isVideoTexture===!0&&Ye.getTransfer(y.map.colorSpace)===et,decodeVideoTextureEmissive:de&&y.emissiveMap.isVideoTexture===!0&&Ye.getTransfer(y.emissiveMap.colorSpace)===et,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===pn,flipSided:y.side===Pt,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:ge&&y.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ge&&y.extensions.multiDraw===!0||Pe)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return rt.vertexUv1s=c.has(1),rt.vertexUv2s=c.has(2),rt.vertexUv3s=c.has(3),c.clear(),rt}function f(y){const M=[];if(y.shaderID?M.push(y.shaderID):(M.push(y.customVertexShaderID),M.push(y.customFragmentShaderID)),y.defines!==void 0)for(const w in y.defines)M.push(w),M.push(y.defines[w]);return y.isRawShaderMaterial===!1&&(b(M,y),E(M,y),M.push(n.outputColorSpace)),M.push(y.customProgramCacheKey),M.join()}function b(y,M){y.push(M.precision),y.push(M.outputColorSpace),y.push(M.envMapMode),y.push(M.envMapCubeUVHeight),y.push(M.mapUv),y.push(M.alphaMapUv),y.push(M.lightMapUv),y.push(M.aoMapUv),y.push(M.bumpMapUv),y.push(M.normalMapUv),y.push(M.displacementMapUv),y.push(M.emissiveMapUv),y.push(M.metalnessMapUv),y.push(M.roughnessMapUv),y.push(M.anisotropyMapUv),y.push(M.clearcoatMapUv),y.push(M.clearcoatNormalMapUv),y.push(M.clearcoatRoughnessMapUv),y.push(M.iridescenceMapUv),y.push(M.iridescenceThicknessMapUv),y.push(M.sheenColorMapUv),y.push(M.sheenRoughnessMapUv),y.push(M.specularMapUv),y.push(M.specularColorMapUv),y.push(M.specularIntensityMapUv),y.push(M.transmissionMapUv),y.push(M.thicknessMapUv),y.push(M.combine),y.push(M.fogExp2),y.push(M.sizeAttenuation),y.push(M.morphTargetsCount),y.push(M.morphAttributeCount),y.push(M.numDirLights),y.push(M.numPointLights),y.push(M.numSpotLights),y.push(M.numSpotLightMaps),y.push(M.numHemiLights),y.push(M.numRectAreaLights),y.push(M.numDirLightShadows),y.push(M.numPointLightShadows),y.push(M.numSpotLightShadows),y.push(M.numSpotLightShadowsWithMaps),y.push(M.numLightProbes),y.push(M.shadowMapType),y.push(M.toneMapping),y.push(M.numClippingPlanes),y.push(M.numClipIntersection),y.push(M.depthPacking)}function E(y,M){a.disableAll(),M.supportsVertexTextures&&a.enable(0),M.instancing&&a.enable(1),M.instancingColor&&a.enable(2),M.instancingMorph&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),M.dispersion&&a.enable(20),M.batchingColor&&a.enable(21),M.gradientMap&&a.enable(22),y.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reversedDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),y.push(a.mask)}function v(y){const M=g[y.type];let w;if(M){const O=Ct[M];w=aa.clone(O.uniforms)}else w=y.uniforms;return w}function R(y,M){let w;for(let O=0,N=d.length;O<N;O++){const V=d[O];if(V.cacheKey===M){w=V,++w.usedTimes;break}}return w===void 0&&(w=new n_(n,M,y,s),d.push(w)),w}function T(y){if(--y.usedTimes===0){const M=d.indexOf(y);d[M]=d[d.length-1],d.pop(),y.destroy()}}function C(y){l.remove(y)}function D(){l.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:v,acquireProgram:R,releaseProgram:T,releaseShaderCache:C,programs:d,dispose:D}}function a_(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function r(o,a,l){n.get(o)[a]=l}function s(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:s}}function l_(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function yl(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function El(){const n=[];let e=0;const t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function o(u,h,p,g,_,m){let f=n[e];return f===void 0?(f={id:u.id,object:u,geometry:h,material:p,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},n[e]=f):(f.id=u.id,f.object=u,f.geometry=h,f.material=p,f.groupOrder=g,f.renderOrder=u.renderOrder,f.z=_,f.group=m),e++,f}function a(u,h,p,g,_,m){const f=o(u,h,p,g,_,m);p.transmission>0?i.push(f):p.transparent===!0?r.push(f):t.push(f)}function l(u,h,p,g,_,m){const f=o(u,h,p,g,_,m);p.transmission>0?i.unshift(f):p.transparent===!0?r.unshift(f):t.unshift(f)}function c(u,h){t.length>1&&t.sort(u||l_),i.length>1&&i.sort(h||yl),r.length>1&&r.sort(h||yl)}function d(){for(let u=e,h=n.length;u<h;u++){const p=n[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:d,sort:c}}function c_(){let n=new WeakMap;function e(i,r){const s=n.get(i);let o;return s===void 0?(o=new El,n.set(i,[o])):r>=s.length?(o=new El,s.push(o)):o=s[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function u_(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new Xe};break;case"SpotLight":t={position:new I,direction:new I,color:new Xe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new Xe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new Xe,groundColor:new Xe};break;case"RectAreaLight":t={color:new Xe,position:new I,halfWidth:new I,halfHeight:new I};break}return n[e.id]=t,t}}}function d_(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new We};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new We};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new We,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let h_=0;function f_(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function p_(n){const e=new u_,t=d_(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new I);const r=new I,s=new at,o=new at;function a(c){let d=0,u=0,h=0;for(let y=0;y<9;y++)i.probe[y].set(0,0,0);let p=0,g=0,_=0,m=0,f=0,b=0,E=0,v=0,R=0,T=0,C=0;c.sort(f_);for(let y=0,M=c.length;y<M;y++){const w=c[y],O=w.color,N=w.intensity,V=w.distance,q=w.shadow&&w.shadow.map?w.shadow.map.texture:null;if(w.isAmbientLight)d+=O.r*N,u+=O.g*N,h+=O.b*N;else if(w.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(w.sh.coefficients[X],N);C++}else if(w.isDirectionalLight){const X=e.get(w);if(X.color.copy(w.color).multiplyScalar(w.intensity),w.castShadow){const K=w.shadow,H=t.get(w);H.shadowIntensity=K.intensity,H.shadowBias=K.bias,H.shadowNormalBias=K.normalBias,H.shadowRadius=K.radius,H.shadowMapSize=K.mapSize,i.directionalShadow[p]=H,i.directionalShadowMap[p]=q,i.directionalShadowMatrix[p]=w.shadow.matrix,b++}i.directional[p]=X,p++}else if(w.isSpotLight){const X=e.get(w);X.position.setFromMatrixPosition(w.matrixWorld),X.color.copy(O).multiplyScalar(N),X.distance=V,X.coneCos=Math.cos(w.angle),X.penumbraCos=Math.cos(w.angle*(1-w.penumbra)),X.decay=w.decay,i.spot[_]=X;const K=w.shadow;if(w.map&&(i.spotLightMap[R]=w.map,R++,K.updateMatrices(w),w.castShadow&&T++),i.spotLightMatrix[_]=K.matrix,w.castShadow){const H=t.get(w);H.shadowIntensity=K.intensity,H.shadowBias=K.bias,H.shadowNormalBias=K.normalBias,H.shadowRadius=K.radius,H.shadowMapSize=K.mapSize,i.spotShadow[_]=H,i.spotShadowMap[_]=q,v++}_++}else if(w.isRectAreaLight){const X=e.get(w);X.color.copy(O).multiplyScalar(N),X.halfWidth.set(w.width*.5,0,0),X.halfHeight.set(0,w.height*.5,0),i.rectArea[m]=X,m++}else if(w.isPointLight){const X=e.get(w);if(X.color.copy(w.color).multiplyScalar(w.intensity),X.distance=w.distance,X.decay=w.decay,w.castShadow){const K=w.shadow,H=t.get(w);H.shadowIntensity=K.intensity,H.shadowBias=K.bias,H.shadowNormalBias=K.normalBias,H.shadowRadius=K.radius,H.shadowMapSize=K.mapSize,H.shadowCameraNear=K.camera.near,H.shadowCameraFar=K.camera.far,i.pointShadow[g]=H,i.pointShadowMap[g]=q,i.pointShadowMatrix[g]=w.shadow.matrix,E++}i.point[g]=X,g++}else if(w.isHemisphereLight){const X=e.get(w);X.skyColor.copy(w.color).multiplyScalar(N),X.groundColor.copy(w.groundColor).multiplyScalar(N),i.hemi[f]=X,f++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=se.LTC_FLOAT_1,i.rectAreaLTC2=se.LTC_FLOAT_2):(i.rectAreaLTC1=se.LTC_HALF_1,i.rectAreaLTC2=se.LTC_HALF_2)),i.ambient[0]=d,i.ambient[1]=u,i.ambient[2]=h;const D=i.hash;(D.directionalLength!==p||D.pointLength!==g||D.spotLength!==_||D.rectAreaLength!==m||D.hemiLength!==f||D.numDirectionalShadows!==b||D.numPointShadows!==E||D.numSpotShadows!==v||D.numSpotMaps!==R||D.numLightProbes!==C)&&(i.directional.length=p,i.spot.length=_,i.rectArea.length=m,i.point.length=g,i.hemi.length=f,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.pointShadow.length=E,i.pointShadowMap.length=E,i.spotShadow.length=v,i.spotShadowMap.length=v,i.directionalShadowMatrix.length=b,i.pointShadowMatrix.length=E,i.spotLightMatrix.length=v+R-T,i.spotLightMap.length=R,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=C,D.directionalLength=p,D.pointLength=g,D.spotLength=_,D.rectAreaLength=m,D.hemiLength=f,D.numDirectionalShadows=b,D.numPointShadows=E,D.numSpotShadows=v,D.numSpotMaps=R,D.numLightProbes=C,i.version=h_++)}function l(c,d){let u=0,h=0,p=0,g=0,_=0;const m=d.matrixWorldInverse;for(let f=0,b=c.length;f<b;f++){const E=c[f];if(E.isDirectionalLight){const v=i.directional[u];v.direction.setFromMatrixPosition(E.matrixWorld),r.setFromMatrixPosition(E.target.matrixWorld),v.direction.sub(r),v.direction.transformDirection(m),u++}else if(E.isSpotLight){const v=i.spot[p];v.position.setFromMatrixPosition(E.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(E.matrixWorld),r.setFromMatrixPosition(E.target.matrixWorld),v.direction.sub(r),v.direction.transformDirection(m),p++}else if(E.isRectAreaLight){const v=i.rectArea[g];v.position.setFromMatrixPosition(E.matrixWorld),v.position.applyMatrix4(m),o.identity(),s.copy(E.matrixWorld),s.premultiply(m),o.extractRotation(s),v.halfWidth.set(E.width*.5,0,0),v.halfHeight.set(0,E.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(E.isPointLight){const v=i.point[h];v.position.setFromMatrixPosition(E.matrixWorld),v.position.applyMatrix4(m),h++}else if(E.isHemisphereLight){const v=i.hemi[_];v.direction.setFromMatrixPosition(E.matrixWorld),v.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:i}}function Tl(n){const e=new p_(n),t=[],i=[];function r(d){c.camera=d,t.length=0,i.length=0}function s(d){t.push(d)}function o(d){i.push(d)}function a(){e.setup(t)}function l(d){e.setupView(t,d)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function m_(n){let e=new WeakMap;function t(r,s=0){const o=e.get(r);let a;return o===void 0?(a=new Tl(n),e.set(r,[a])):s>=o.length?(a=new Tl(n),o.push(a)):a=o[s],a}function i(){e=new WeakMap}return{get:t,dispose:i}}const g_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,__=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function v_(n,e,t){let i=new ca;const r=new We,s=new We,o=new tt,a=new Dh({depthPacking:Cd}),l=new Lh,c={},d=t.maxTextureSize,u={[Nn]:Pt,[Pt]:Nn,[pn]:pn},h=new Mn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new We},radius:{value:4}},vertexShader:g_,fragmentShader:__}),p=h.clone();p.defines.HORIZONTAL_PASS=1;const g=new Lt;g.setAttribute("position",new Dt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new ft(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=uc;let f=this.type;this.render=function(T,C,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;const y=n.getRenderTarget(),M=n.getActiveCubeFace(),w=n.getActiveMipmapLevel(),O=n.state;O.setBlending(In),O.buffers.depth.getReversed()?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const N=f!==fn&&this.type===fn,V=f===fn&&this.type!==fn;for(let q=0,X=T.length;q<X;q++){const K=T[q],H=K.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;r.copy(H.mapSize);const ne=H.getFrameExtents();if(r.multiply(ne),s.copy(H.mapSize),(r.x>d||r.y>d)&&(r.x>d&&(s.x=Math.floor(d/ne.x),r.x=s.x*ne.x,H.mapSize.x=s.x),r.y>d&&(s.y=Math.floor(d/ne.y),r.y=s.y*ne.y,H.mapSize.y=s.y)),H.map===null||N===!0||V===!0){const xe=this.type!==fn?{minFilter:jt,magFilter:jt}:{};H.map!==null&&H.map.dispose(),H.map=new ti(r.x,r.y,xe),H.map.texture.name=K.name+".shadowMap",H.camera.updateProjectionMatrix()}n.setRenderTarget(H.map),n.clear();const oe=H.getViewportCount();for(let xe=0;xe<oe;xe++){const Ie=H.getViewport(xe);o.set(s.x*Ie.x,s.y*Ie.y,s.x*Ie.z,s.y*Ie.w),O.viewport(o),H.updateMatrices(K,xe),i=H.getFrustum(),v(C,D,H.camera,K,this.type)}H.isPointLightShadow!==!0&&this.type===fn&&b(H,D),H.needsUpdate=!1}f=this.type,m.needsUpdate=!1,n.setRenderTarget(y,M,w)};function b(T,C){const D=e.update(_);h.defines.VSM_SAMPLES!==T.blurSamples&&(h.defines.VSM_SAMPLES=T.blurSamples,p.defines.VSM_SAMPLES=T.blurSamples,h.needsUpdate=!0,p.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new ti(r.x,r.y)),h.uniforms.shadow_pass.value=T.map.texture,h.uniforms.resolution.value=T.mapSize,h.uniforms.radius.value=T.radius,n.setRenderTarget(T.mapPass),n.clear(),n.renderBufferDirect(C,null,D,h,_,null),p.uniforms.shadow_pass.value=T.mapPass.texture,p.uniforms.resolution.value=T.mapSize,p.uniforms.radius.value=T.radius,n.setRenderTarget(T.map),n.clear(),n.renderBufferDirect(C,null,D,p,_,null)}function E(T,C,D,y){let M=null;const w=D.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(w!==void 0)M=w;else if(M=D.isPointLight===!0?l:a,n.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){const O=M.uuid,N=C.uuid;let V=c[O];V===void 0&&(V={},c[O]=V);let q=V[N];q===void 0&&(q=M.clone(),V[N]=q,C.addEventListener("dispose",R)),M=q}if(M.visible=C.visible,M.wireframe=C.wireframe,y===fn?M.side=C.shadowSide!==null?C.shadowSide:C.side:M.side=C.shadowSide!==null?C.shadowSide:u[C.side],M.alphaMap=C.alphaMap,M.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,M.map=C.map,M.clipShadows=C.clipShadows,M.clippingPlanes=C.clippingPlanes,M.clipIntersection=C.clipIntersection,M.displacementMap=C.displacementMap,M.displacementScale=C.displacementScale,M.displacementBias=C.displacementBias,M.wireframeLinewidth=C.wireframeLinewidth,M.linewidth=C.linewidth,D.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const O=n.properties.get(M);O.light=D}return M}function v(T,C,D,y,M){if(T.visible===!1)return;if(T.layers.test(C.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&M===fn)&&(!T.frustumCulled||i.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,T.matrixWorld);const N=e.update(T),V=T.material;if(Array.isArray(V)){const q=N.groups;for(let X=0,K=q.length;X<K;X++){const H=q[X],ne=V[H.materialIndex];if(ne&&ne.visible){const oe=E(T,ne,y,M);T.onBeforeShadow(n,T,C,D,N,oe,H),n.renderBufferDirect(D,null,N,oe,T,H),T.onAfterShadow(n,T,C,D,N,oe,H)}}}else if(V.visible){const q=E(T,V,y,M);T.onBeforeShadow(n,T,C,D,N,q,null),n.renderBufferDirect(D,null,N,q,T,null),T.onAfterShadow(n,T,C,D,N,q,null)}}const O=T.children;for(let N=0,V=O.length;N<V;N++)v(O[N],C,D,y,M)}function R(T){T.target.removeEventListener("dispose",R);for(const D in c){const y=c[D],M=T.target.uuid;M in y&&(y[M].dispose(),delete y[M])}}}const x_={[so]:oo,[ao]:uo,[lo]:ho,[Pi]:co,[oo]:so,[uo]:ao,[ho]:lo,[co]:Pi};function M_(n,e){function t(){let L=!1;const ee=new tt;let re=null;const fe=new tt(0,0,0,0);return{setMask:function(j){re!==j&&!L&&(n.colorMask(j,j,j,j),re=j)},setLocked:function(j){L=j},setClear:function(j,$,ge,Ue,rt){rt===!0&&(j*=Ue,$*=Ue,ge*=Ue),ee.set(j,$,ge,Ue),fe.equals(ee)===!1&&(n.clearColor(j,$,ge,Ue),fe.copy(ee))},reset:function(){L=!1,re=null,fe.set(-1,0,0,0)}}}function i(){let L=!1,ee=!1,re=null,fe=null,j=null;return{setReversed:function($){if(ee!==$){const ge=e.get("EXT_clip_control");$?ge.clipControlEXT(ge.LOWER_LEFT_EXT,ge.ZERO_TO_ONE_EXT):ge.clipControlEXT(ge.LOWER_LEFT_EXT,ge.NEGATIVE_ONE_TO_ONE_EXT),ee=$;const Ue=j;j=null,this.setClear(Ue)}},getReversed:function(){return ee},setTest:function($){$?ie(n.DEPTH_TEST):be(n.DEPTH_TEST)},setMask:function($){re!==$&&!L&&(n.depthMask($),re=$)},setFunc:function($){if(ee&&($=x_[$]),fe!==$){switch($){case so:n.depthFunc(n.NEVER);break;case oo:n.depthFunc(n.ALWAYS);break;case ao:n.depthFunc(n.LESS);break;case Pi:n.depthFunc(n.LEQUAL);break;case lo:n.depthFunc(n.EQUAL);break;case co:n.depthFunc(n.GEQUAL);break;case uo:n.depthFunc(n.GREATER);break;case ho:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}fe=$}},setLocked:function($){L=$},setClear:function($){j!==$&&(ee&&($=1-$),n.clearDepth($),j=$)},reset:function(){L=!1,re=null,fe=null,j=null,ee=!1}}}function r(){let L=!1,ee=null,re=null,fe=null,j=null,$=null,ge=null,Ue=null,rt=null;return{setTest:function(Ke){L||(Ke?ie(n.STENCIL_TEST):be(n.STENCIL_TEST))},setMask:function(Ke){ee!==Ke&&!L&&(n.stencilMask(Ke),ee=Ke)},setFunc:function(Ke,on,Jt){(re!==Ke||fe!==on||j!==Jt)&&(n.stencilFunc(Ke,on,Jt),re=Ke,fe=on,j=Jt)},setOp:function(Ke,on,Jt){($!==Ke||ge!==on||Ue!==Jt)&&(n.stencilOp(Ke,on,Jt),$=Ke,ge=on,Ue=Jt)},setLocked:function(Ke){L=Ke},setClear:function(Ke){rt!==Ke&&(n.clearStencil(Ke),rt=Ke)},reset:function(){L=!1,ee=null,re=null,fe=null,j=null,$=null,ge=null,Ue=null,rt=null}}}const s=new t,o=new i,a=new r,l=new WeakMap,c=new WeakMap;let d={},u={},h=new WeakMap,p=[],g=null,_=!1,m=null,f=null,b=null,E=null,v=null,R=null,T=null,C=new Xe(0,0,0),D=0,y=!1,M=null,w=null,O=null,N=null,V=null;const q=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,K=0;const H=n.getParameter(n.VERSION);H.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(H)[1]),X=K>=1):H.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),X=K>=2);let ne=null,oe={};const xe=n.getParameter(n.SCISSOR_BOX),Ie=n.getParameter(n.VIEWPORT),nt=new tt().fromArray(xe),Ze=new tt().fromArray(Ie);function Y(L,ee,re,fe){const j=new Uint8Array(4),$=n.createTexture();n.bindTexture(L,$),n.texParameteri(L,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(L,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let ge=0;ge<re;ge++)L===n.TEXTURE_3D||L===n.TEXTURE_2D_ARRAY?n.texImage3D(ee,0,n.RGBA,1,1,fe,0,n.RGBA,n.UNSIGNED_BYTE,j):n.texImage2D(ee+ge,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,j);return $}const ae={};ae[n.TEXTURE_2D]=Y(n.TEXTURE_2D,n.TEXTURE_2D,1),ae[n.TEXTURE_CUBE_MAP]=Y(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),ae[n.TEXTURE_2D_ARRAY]=Y(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),ae[n.TEXTURE_3D]=Y(n.TEXTURE_3D,n.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ie(n.DEPTH_TEST),o.setFunc(Pi),Fe(!1),_e(ba),ie(n.CULL_FACE),$e(In);function ie(L){d[L]!==!0&&(n.enable(L),d[L]=!0)}function be(L){d[L]!==!1&&(n.disable(L),d[L]=!1)}function Ae(L,ee){return u[L]!==ee?(n.bindFramebuffer(L,ee),u[L]=ee,L===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=ee),L===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=ee),!0):!1}function Pe(L,ee){let re=p,fe=!1;if(L){re=h.get(ee),re===void 0&&(re=[],h.set(ee,re));const j=L.textures;if(re.length!==j.length||re[0]!==n.COLOR_ATTACHMENT0){for(let $=0,ge=j.length;$<ge;$++)re[$]=n.COLOR_ATTACHMENT0+$;re.length=j.length,fe=!0}}else re[0]!==n.BACK&&(re[0]=n.BACK,fe=!0);fe&&n.drawBuffers(re)}function st(L){return g!==L?(n.useProgram(L),g=L,!0):!1}const ke={[Yn]:n.FUNC_ADD,[td]:n.FUNC_SUBTRACT,[nd]:n.FUNC_REVERSE_SUBTRACT};ke[id]=n.MIN,ke[rd]=n.MAX;const P={[sd]:n.ZERO,[od]:n.ONE,[ad]:n.SRC_COLOR,[io]:n.SRC_ALPHA,[fd]:n.SRC_ALPHA_SATURATE,[dd]:n.DST_COLOR,[cd]:n.DST_ALPHA,[ld]:n.ONE_MINUS_SRC_COLOR,[ro]:n.ONE_MINUS_SRC_ALPHA,[hd]:n.ONE_MINUS_DST_COLOR,[ud]:n.ONE_MINUS_DST_ALPHA,[pd]:n.CONSTANT_COLOR,[md]:n.ONE_MINUS_CONSTANT_COLOR,[gd]:n.CONSTANT_ALPHA,[_d]:n.ONE_MINUS_CONSTANT_ALPHA};function $e(L,ee,re,fe,j,$,ge,Ue,rt,Ke){if(L===In){_===!0&&(be(n.BLEND),_=!1);return}if(_===!1&&(ie(n.BLEND),_=!0),L!==ed){if(L!==m||Ke!==y){if((f!==Yn||v!==Yn)&&(n.blendEquation(n.FUNC_ADD),f=Yn,v=Yn),Ke)switch(L){case Ai:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ci:n.blendFunc(n.ONE,n.ONE);break;case Aa:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case wa:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case Ai:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ci:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Aa:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case wa:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}b=null,E=null,R=null,T=null,C.set(0,0,0),D=0,m=L,y=Ke}return}j=j||ee,$=$||re,ge=ge||fe,(ee!==f||j!==v)&&(n.blendEquationSeparate(ke[ee],ke[j]),f=ee,v=j),(re!==b||fe!==E||$!==R||ge!==T)&&(n.blendFuncSeparate(P[re],P[fe],P[$],P[ge]),b=re,E=fe,R=$,T=ge),(Ue.equals(C)===!1||rt!==D)&&(n.blendColor(Ue.r,Ue.g,Ue.b,rt),C.copy(Ue),D=rt),m=L,y=!1}function ye(L,ee){L.side===pn?be(n.CULL_FACE):ie(n.CULL_FACE);let re=L.side===Pt;ee&&(re=!re),Fe(re),L.blending===Ai&&L.transparent===!1?$e(In):$e(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),o.setFunc(L.depthFunc),o.setTest(L.depthTest),o.setMask(L.depthWrite),s.setMask(L.colorWrite);const fe=L.stencilWrite;a.setTest(fe),fe&&(a.setMask(L.stencilWriteMask),a.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),a.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),de(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?ie(n.SAMPLE_ALPHA_TO_COVERAGE):be(n.SAMPLE_ALPHA_TO_COVERAGE)}function Fe(L){M!==L&&(L?n.frontFace(n.CW):n.frontFace(n.CCW),M=L)}function _e(L){L!==ju?(ie(n.CULL_FACE),L!==w&&(L===ba?n.cullFace(n.BACK):L===Ju?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):be(n.CULL_FACE),w=L}function je(L){L!==O&&(X&&n.lineWidth(L),O=L)}function de(L,ee,re){L?(ie(n.POLYGON_OFFSET_FILL),(N!==ee||V!==re)&&(n.polygonOffset(ee,re),N=ee,V=re)):be(n.POLYGON_OFFSET_FILL)}function Oe(L){L?ie(n.SCISSOR_TEST):be(n.SCISSOR_TEST)}function Le(L){L===void 0&&(L=n.TEXTURE0+q-1),ne!==L&&(n.activeTexture(L),ne=L)}function Ve(L,ee,re){re===void 0&&(ne===null?re=n.TEXTURE0+q-1:re=ne);let fe=oe[re];fe===void 0&&(fe={type:void 0,texture:void 0},oe[re]=fe),(fe.type!==L||fe.texture!==ee)&&(ne!==re&&(n.activeTexture(re),ne=re),n.bindTexture(L,ee||ae[L]),fe.type=L,fe.texture=ee)}function A(){const L=oe[ne];L!==void 0&&L.type!==void 0&&(n.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function x(){try{n.compressedTexImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function B(){try{n.compressedTexImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function W(){try{n.texSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Z(){try{n.texSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function G(){try{n.compressedTexSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Me(){try{n.compressedTexSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function te(){try{n.texStorage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function me(){try{n.texStorage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ve(){try{n.texImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function J(){try{n.texImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ue(L){nt.equals(L)===!1&&(n.scissor(L.x,L.y,L.z,L.w),nt.copy(L))}function Ce(L){Ze.equals(L)===!1&&(n.viewport(L.x,L.y,L.z,L.w),Ze.copy(L))}function Se(L,ee){let re=c.get(ee);re===void 0&&(re=new WeakMap,c.set(ee,re));let fe=re.get(L);fe===void 0&&(fe=n.getUniformBlockIndex(ee,L.name),re.set(L,fe))}function le(L,ee){const fe=c.get(ee).get(L);l.get(ee)!==fe&&(n.uniformBlockBinding(ee,fe,L.__bindingPointIndex),l.set(ee,fe))}function Be(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),d={},ne=null,oe={},u={},h=new WeakMap,p=[],g=null,_=!1,m=null,f=null,b=null,E=null,v=null,R=null,T=null,C=new Xe(0,0,0),D=0,y=!1,M=null,w=null,O=null,N=null,V=null,nt.set(0,0,n.canvas.width,n.canvas.height),Ze.set(0,0,n.canvas.width,n.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:ie,disable:be,bindFramebuffer:Ae,drawBuffers:Pe,useProgram:st,setBlending:$e,setMaterial:ye,setFlipSided:Fe,setCullFace:_e,setLineWidth:je,setPolygonOffset:de,setScissorTest:Oe,activeTexture:Le,bindTexture:Ve,unbindTexture:A,compressedTexImage2D:x,compressedTexImage3D:B,texImage2D:ve,texImage3D:J,updateUBOMapping:Se,uniformBlockBinding:le,texStorage2D:te,texStorage3D:me,texSubImage2D:W,texSubImage3D:Z,compressedTexSubImage2D:G,compressedTexSubImage3D:Me,scissor:ue,viewport:Ce,reset:Be}}function S_(n,e,t,i,r,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new We,d=new WeakMap;let u;const h=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,x){return p?new OffscreenCanvas(A,x):nr("canvas")}function _(A,x,B){let W=1;const Z=Ve(A);if((Z.width>B||Z.height>B)&&(W=B/Math.max(Z.width,Z.height)),W<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const G=Math.floor(W*Z.width),Me=Math.floor(W*Z.height);u===void 0&&(u=g(G,Me));const te=x?g(G,Me):u;return te.width=G,te.height=Me,te.getContext("2d").drawImage(A,0,0,G,Me),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+G+"x"+Me+")."),te}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),A;return A}function m(A){return A.generateMipmaps}function f(A){n.generateMipmap(A)}function b(A){return A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?n.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function E(A,x,B,W,Z=!1){if(A!==null){if(n[A]!==void 0)return n[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let G=x;if(x===n.RED&&(B===n.FLOAT&&(G=n.R32F),B===n.HALF_FLOAT&&(G=n.R16F),B===n.UNSIGNED_BYTE&&(G=n.R8)),x===n.RED_INTEGER&&(B===n.UNSIGNED_BYTE&&(G=n.R8UI),B===n.UNSIGNED_SHORT&&(G=n.R16UI),B===n.UNSIGNED_INT&&(G=n.R32UI),B===n.BYTE&&(G=n.R8I),B===n.SHORT&&(G=n.R16I),B===n.INT&&(G=n.R32I)),x===n.RG&&(B===n.FLOAT&&(G=n.RG32F),B===n.HALF_FLOAT&&(G=n.RG16F),B===n.UNSIGNED_BYTE&&(G=n.RG8)),x===n.RG_INTEGER&&(B===n.UNSIGNED_BYTE&&(G=n.RG8UI),B===n.UNSIGNED_SHORT&&(G=n.RG16UI),B===n.UNSIGNED_INT&&(G=n.RG32UI),B===n.BYTE&&(G=n.RG8I),B===n.SHORT&&(G=n.RG16I),B===n.INT&&(G=n.RG32I)),x===n.RGB_INTEGER&&(B===n.UNSIGNED_BYTE&&(G=n.RGB8UI),B===n.UNSIGNED_SHORT&&(G=n.RGB16UI),B===n.UNSIGNED_INT&&(G=n.RGB32UI),B===n.BYTE&&(G=n.RGB8I),B===n.SHORT&&(G=n.RGB16I),B===n.INT&&(G=n.RGB32I)),x===n.RGBA_INTEGER&&(B===n.UNSIGNED_BYTE&&(G=n.RGBA8UI),B===n.UNSIGNED_SHORT&&(G=n.RGBA16UI),B===n.UNSIGNED_INT&&(G=n.RGBA32UI),B===n.BYTE&&(G=n.RGBA8I),B===n.SHORT&&(G=n.RGBA16I),B===n.INT&&(G=n.RGBA32I)),x===n.RGB&&B===n.UNSIGNED_INT_5_9_9_9_REV&&(G=n.RGB9_E5),x===n.RGBA){const Me=Z?Kr:Ye.getTransfer(W);B===n.FLOAT&&(G=n.RGBA32F),B===n.HALF_FLOAT&&(G=n.RGBA16F),B===n.UNSIGNED_BYTE&&(G=Me===et?n.SRGB8_ALPHA8:n.RGBA8),B===n.UNSIGNED_SHORT_4_4_4_4&&(G=n.RGBA4),B===n.UNSIGNED_SHORT_5_5_5_1&&(G=n.RGB5_A1)}return(G===n.R16F||G===n.R32F||G===n.RG16F||G===n.RG32F||G===n.RGBA16F||G===n.RGBA32F)&&e.get("EXT_color_buffer_float"),G}function v(A,x){let B;return A?x===null||x===ei||x===Ji?B=n.DEPTH24_STENCIL8:x===mn?B=n.DEPTH32F_STENCIL8:x===ji&&(B=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===ei||x===Ji?B=n.DEPTH_COMPONENT24:x===mn?B=n.DEPTH_COMPONENT32F:x===ji&&(B=n.DEPTH_COMPONENT16),B}function R(A,x){return m(A)===!0||A.isFramebufferTexture&&A.minFilter!==jt&&A.minFilter!==Kt?Math.log2(Math.max(x.width,x.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?x.mipmaps.length:1}function T(A){const x=A.target;x.removeEventListener("dispose",T),D(x),x.isVideoTexture&&d.delete(x)}function C(A){const x=A.target;x.removeEventListener("dispose",C),M(x)}function D(A){const x=i.get(A);if(x.__webglInit===void 0)return;const B=A.source,W=h.get(B);if(W){const Z=W[x.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&y(A),Object.keys(W).length===0&&h.delete(B)}i.remove(A)}function y(A){const x=i.get(A);n.deleteTexture(x.__webglTexture);const B=A.source,W=h.get(B);delete W[x.__cacheKey],o.memory.textures--}function M(A){const x=i.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),i.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(x.__webglFramebuffer[W]))for(let Z=0;Z<x.__webglFramebuffer[W].length;Z++)n.deleteFramebuffer(x.__webglFramebuffer[W][Z]);else n.deleteFramebuffer(x.__webglFramebuffer[W]);x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer[W])}else{if(Array.isArray(x.__webglFramebuffer))for(let W=0;W<x.__webglFramebuffer.length;W++)n.deleteFramebuffer(x.__webglFramebuffer[W]);else n.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&n.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let W=0;W<x.__webglColorRenderbuffer.length;W++)x.__webglColorRenderbuffer[W]&&n.deleteRenderbuffer(x.__webglColorRenderbuffer[W]);x.__webglDepthRenderbuffer&&n.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const B=A.textures;for(let W=0,Z=B.length;W<Z;W++){const G=i.get(B[W]);G.__webglTexture&&(n.deleteTexture(G.__webglTexture),o.memory.textures--),i.remove(B[W])}i.remove(A)}let w=0;function O(){w=0}function N(){const A=w;return A>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+r.maxTextures),w+=1,A}function V(A){const x=[];return x.push(A.wrapS),x.push(A.wrapT),x.push(A.wrapR||0),x.push(A.magFilter),x.push(A.minFilter),x.push(A.anisotropy),x.push(A.internalFormat),x.push(A.format),x.push(A.type),x.push(A.generateMipmaps),x.push(A.premultiplyAlpha),x.push(A.flipY),x.push(A.unpackAlignment),x.push(A.colorSpace),x.join()}function q(A,x){const B=i.get(A);if(A.isVideoTexture&&Oe(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&B.__version!==A.version){const W=A.image;if(W===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ae(B,A,x);return}}else A.isExternalTexture&&(B.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,B.__webglTexture,n.TEXTURE0+x)}function X(A,x){const B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){ae(B,A,x);return}t.bindTexture(n.TEXTURE_2D_ARRAY,B.__webglTexture,n.TEXTURE0+x)}function K(A,x){const B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){ae(B,A,x);return}t.bindTexture(n.TEXTURE_3D,B.__webglTexture,n.TEXTURE0+x)}function H(A,x){const B=i.get(A);if(A.version>0&&B.__version!==A.version){ie(B,A,x);return}t.bindTexture(n.TEXTURE_CUBE_MAP,B.__webglTexture,n.TEXTURE0+x)}const ne={[Zi]:n.REPEAT,[Kn]:n.CLAMP_TO_EDGE,[mo]:n.MIRRORED_REPEAT},oe={[jt]:n.NEAREST,[wd]:n.NEAREST_MIPMAP_NEAREST,[dr]:n.NEAREST_MIPMAP_LINEAR,[Kt]:n.LINEAR,[us]:n.LINEAR_MIPMAP_NEAREST,[Cn]:n.LINEAR_MIPMAP_LINEAR},xe={[Dd]:n.NEVER,[Od]:n.ALWAYS,[Ld]:n.LESS,[yc]:n.LEQUAL,[Id]:n.EQUAL,[Fd]:n.GEQUAL,[Ud]:n.GREATER,[Nd]:n.NOTEQUAL};function Ie(A,x){if(x.type===mn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Kt||x.magFilter===us||x.magFilter===dr||x.magFilter===Cn||x.minFilter===Kt||x.minFilter===us||x.minFilter===dr||x.minFilter===Cn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(A,n.TEXTURE_WRAP_S,ne[x.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,ne[x.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,ne[x.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,oe[x.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,oe[x.minFilter]),x.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,xe[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===jt||x.minFilter!==dr&&x.minFilter!==Cn||x.type===mn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");n.texParameterf(A,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,r.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function nt(A,x){let B=!1;A.__webglInit===void 0&&(A.__webglInit=!0,x.addEventListener("dispose",T));const W=x.source;let Z=h.get(W);Z===void 0&&(Z={},h.set(W,Z));const G=V(x);if(G!==A.__cacheKey){Z[G]===void 0&&(Z[G]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,B=!0),Z[G].usedTimes++;const Me=Z[A.__cacheKey];Me!==void 0&&(Z[A.__cacheKey].usedTimes--,Me.usedTimes===0&&y(x)),A.__cacheKey=G,A.__webglTexture=Z[G].texture}return B}function Ze(A,x,B){return Math.floor(Math.floor(A/B)/x)}function Y(A,x,B,W){const G=A.updateRanges;if(G.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,x.width,x.height,B,W,x.data);else{G.sort((J,ue)=>J.start-ue.start);let Me=0;for(let J=1;J<G.length;J++){const ue=G[Me],Ce=G[J],Se=ue.start+ue.count,le=Ze(Ce.start,x.width,4),Be=Ze(ue.start,x.width,4);Ce.start<=Se+1&&le===Be&&Ze(Ce.start+Ce.count-1,x.width,4)===le?ue.count=Math.max(ue.count,Ce.start+Ce.count-ue.start):(++Me,G[Me]=Ce)}G.length=Me+1;const te=n.getParameter(n.UNPACK_ROW_LENGTH),me=n.getParameter(n.UNPACK_SKIP_PIXELS),ve=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,x.width);for(let J=0,ue=G.length;J<ue;J++){const Ce=G[J],Se=Math.floor(Ce.start/4),le=Math.ceil(Ce.count/4),Be=Se%x.width,L=Math.floor(Se/x.width),ee=le,re=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,Be),n.pixelStorei(n.UNPACK_SKIP_ROWS,L),t.texSubImage2D(n.TEXTURE_2D,0,Be,L,ee,re,B,W,x.data)}A.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,te),n.pixelStorei(n.UNPACK_SKIP_PIXELS,me),n.pixelStorei(n.UNPACK_SKIP_ROWS,ve)}}function ae(A,x,B){let W=n.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(W=n.TEXTURE_2D_ARRAY),x.isData3DTexture&&(W=n.TEXTURE_3D);const Z=nt(A,x),G=x.source;t.bindTexture(W,A.__webglTexture,n.TEXTURE0+B);const Me=i.get(G);if(G.version!==Me.__version||Z===!0){t.activeTexture(n.TEXTURE0+B);const te=Ye.getPrimaries(Ye.workingColorSpace),me=x.colorSpace===Rn?null:Ye.getPrimaries(x.colorSpace),ve=x.colorSpace===Rn||te===me?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ve);let J=_(x.image,!1,r.maxTextureSize);J=Le(x,J);const ue=s.convert(x.format,x.colorSpace),Ce=s.convert(x.type);let Se=E(x.internalFormat,ue,Ce,x.colorSpace,x.isVideoTexture);Ie(W,x);let le;const Be=x.mipmaps,L=x.isVideoTexture!==!0,ee=Me.__version===void 0||Z===!0,re=G.dataReady,fe=R(x,J);if(x.isDepthTexture)Se=v(x.format===er,x.type),ee&&(L?t.texStorage2D(n.TEXTURE_2D,1,Se,J.width,J.height):t.texImage2D(n.TEXTURE_2D,0,Se,J.width,J.height,0,ue,Ce,null));else if(x.isDataTexture)if(Be.length>0){L&&ee&&t.texStorage2D(n.TEXTURE_2D,fe,Se,Be[0].width,Be[0].height);for(let j=0,$=Be.length;j<$;j++)le=Be[j],L?re&&t.texSubImage2D(n.TEXTURE_2D,j,0,0,le.width,le.height,ue,Ce,le.data):t.texImage2D(n.TEXTURE_2D,j,Se,le.width,le.height,0,ue,Ce,le.data);x.generateMipmaps=!1}else L?(ee&&t.texStorage2D(n.TEXTURE_2D,fe,Se,J.width,J.height),re&&Y(x,J,ue,Ce)):t.texImage2D(n.TEXTURE_2D,0,Se,J.width,J.height,0,ue,Ce,J.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){L&&ee&&t.texStorage3D(n.TEXTURE_2D_ARRAY,fe,Se,Be[0].width,Be[0].height,J.depth);for(let j=0,$=Be.length;j<$;j++)if(le=Be[j],x.format!==Zt)if(ue!==null)if(L){if(re)if(x.layerUpdates.size>0){const ge=el(le.width,le.height,x.format,x.type);for(const Ue of x.layerUpdates){const rt=le.data.subarray(Ue*ge/le.data.BYTES_PER_ELEMENT,(Ue+1)*ge/le.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,Ue,le.width,le.height,1,ue,rt)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,0,le.width,le.height,J.depth,ue,le.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,j,Se,le.width,le.height,J.depth,0,le.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else L?re&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,0,le.width,le.height,J.depth,ue,Ce,le.data):t.texImage3D(n.TEXTURE_2D_ARRAY,j,Se,le.width,le.height,J.depth,0,ue,Ce,le.data)}else{L&&ee&&t.texStorage2D(n.TEXTURE_2D,fe,Se,Be[0].width,Be[0].height);for(let j=0,$=Be.length;j<$;j++)le=Be[j],x.format!==Zt?ue!==null?L?re&&t.compressedTexSubImage2D(n.TEXTURE_2D,j,0,0,le.width,le.height,ue,le.data):t.compressedTexImage2D(n.TEXTURE_2D,j,Se,le.width,le.height,0,le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):L?re&&t.texSubImage2D(n.TEXTURE_2D,j,0,0,le.width,le.height,ue,Ce,le.data):t.texImage2D(n.TEXTURE_2D,j,Se,le.width,le.height,0,ue,Ce,le.data)}else if(x.isDataArrayTexture)if(L){if(ee&&t.texStorage3D(n.TEXTURE_2D_ARRAY,fe,Se,J.width,J.height,J.depth),re)if(x.layerUpdates.size>0){const j=el(J.width,J.height,x.format,x.type);for(const $ of x.layerUpdates){const ge=J.data.subarray($*j/J.data.BYTES_PER_ELEMENT,($+1)*j/J.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,$,J.width,J.height,1,ue,Ce,ge)}x.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,J.width,J.height,J.depth,ue,Ce,J.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Se,J.width,J.height,J.depth,0,ue,Ce,J.data);else if(x.isData3DTexture)L?(ee&&t.texStorage3D(n.TEXTURE_3D,fe,Se,J.width,J.height,J.depth),re&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,J.width,J.height,J.depth,ue,Ce,J.data)):t.texImage3D(n.TEXTURE_3D,0,Se,J.width,J.height,J.depth,0,ue,Ce,J.data);else if(x.isFramebufferTexture){if(ee)if(L)t.texStorage2D(n.TEXTURE_2D,fe,Se,J.width,J.height);else{let j=J.width,$=J.height;for(let ge=0;ge<fe;ge++)t.texImage2D(n.TEXTURE_2D,ge,Se,j,$,0,ue,Ce,null),j>>=1,$>>=1}}else if(Be.length>0){if(L&&ee){const j=Ve(Be[0]);t.texStorage2D(n.TEXTURE_2D,fe,Se,j.width,j.height)}for(let j=0,$=Be.length;j<$;j++)le=Be[j],L?re&&t.texSubImage2D(n.TEXTURE_2D,j,0,0,ue,Ce,le):t.texImage2D(n.TEXTURE_2D,j,Se,ue,Ce,le);x.generateMipmaps=!1}else if(L){if(ee){const j=Ve(J);t.texStorage2D(n.TEXTURE_2D,fe,Se,j.width,j.height)}re&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ue,Ce,J)}else t.texImage2D(n.TEXTURE_2D,0,Se,ue,Ce,J);m(x)&&f(W),Me.__version=G.version,x.onUpdate&&x.onUpdate(x)}A.__version=x.version}function ie(A,x,B){if(x.image.length!==6)return;const W=nt(A,x),Z=x.source;t.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+B);const G=i.get(Z);if(Z.version!==G.__version||W===!0){t.activeTexture(n.TEXTURE0+B);const Me=Ye.getPrimaries(Ye.workingColorSpace),te=x.colorSpace===Rn?null:Ye.getPrimaries(x.colorSpace),me=x.colorSpace===Rn||Me===te?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);const ve=x.isCompressedTexture||x.image[0].isCompressedTexture,J=x.image[0]&&x.image[0].isDataTexture,ue=[];for(let $=0;$<6;$++)!ve&&!J?ue[$]=_(x.image[$],!0,r.maxCubemapSize):ue[$]=J?x.image[$].image:x.image[$],ue[$]=Le(x,ue[$]);const Ce=ue[0],Se=s.convert(x.format,x.colorSpace),le=s.convert(x.type),Be=E(x.internalFormat,Se,le,x.colorSpace),L=x.isVideoTexture!==!0,ee=G.__version===void 0||W===!0,re=Z.dataReady;let fe=R(x,Ce);Ie(n.TEXTURE_CUBE_MAP,x);let j;if(ve){L&&ee&&t.texStorage2D(n.TEXTURE_CUBE_MAP,fe,Be,Ce.width,Ce.height);for(let $=0;$<6;$++){j=ue[$].mipmaps;for(let ge=0;ge<j.length;ge++){const Ue=j[ge];x.format!==Zt?Se!==null?L?re&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,ge,0,0,Ue.width,Ue.height,Se,Ue.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,ge,Be,Ue.width,Ue.height,0,Ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?re&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,ge,0,0,Ue.width,Ue.height,Se,le,Ue.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,ge,Be,Ue.width,Ue.height,0,Se,le,Ue.data)}}}else{if(j=x.mipmaps,L&&ee){j.length>0&&fe++;const $=Ve(ue[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,fe,Be,$.width,$.height)}for(let $=0;$<6;$++)if(J){L?re&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,ue[$].width,ue[$].height,Se,le,ue[$].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,Be,ue[$].width,ue[$].height,0,Se,le,ue[$].data);for(let ge=0;ge<j.length;ge++){const rt=j[ge].image[$].image;L?re&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,ge+1,0,0,rt.width,rt.height,Se,le,rt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,ge+1,Be,rt.width,rt.height,0,Se,le,rt.data)}}else{L?re&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,Se,le,ue[$]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,Be,Se,le,ue[$]);for(let ge=0;ge<j.length;ge++){const Ue=j[ge];L?re&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,ge+1,0,0,Se,le,Ue.image[$]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,ge+1,Be,Se,le,Ue.image[$])}}}m(x)&&f(n.TEXTURE_CUBE_MAP),G.__version=Z.version,x.onUpdate&&x.onUpdate(x)}A.__version=x.version}function be(A,x,B,W,Z,G){const Me=s.convert(B.format,B.colorSpace),te=s.convert(B.type),me=E(B.internalFormat,Me,te,B.colorSpace),ve=i.get(x),J=i.get(B);if(J.__renderTarget=x,!ve.__hasExternalTextures){const ue=Math.max(1,x.width>>G),Ce=Math.max(1,x.height>>G);Z===n.TEXTURE_3D||Z===n.TEXTURE_2D_ARRAY?t.texImage3D(Z,G,me,ue,Ce,x.depth,0,Me,te,null):t.texImage2D(Z,G,me,ue,Ce,0,Me,te,null)}t.bindFramebuffer(n.FRAMEBUFFER,A),de(x)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,W,Z,J.__webglTexture,0,je(x)):(Z===n.TEXTURE_2D||Z>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,W,Z,J.__webglTexture,G),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ae(A,x,B){if(n.bindRenderbuffer(n.RENDERBUFFER,A),x.depthBuffer){const W=x.depthTexture,Z=W&&W.isDepthTexture?W.type:null,G=v(x.stencilBuffer,Z),Me=x.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,te=je(x);de(x)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,te,G,x.width,x.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,te,G,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,G,x.width,x.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Me,n.RENDERBUFFER,A)}else{const W=x.textures;for(let Z=0;Z<W.length;Z++){const G=W[Z],Me=s.convert(G.format,G.colorSpace),te=s.convert(G.type),me=E(G.internalFormat,Me,te,G.colorSpace),ve=je(x);B&&de(x)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,ve,me,x.width,x.height):de(x)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ve,me,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,me,x.width,x.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Pe(A,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,A),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const W=i.get(x.depthTexture);W.__renderTarget=x,(!W.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),q(x.depthTexture,0);const Z=W.__webglTexture,G=je(x);if(x.depthTexture.format===Qi)de(x)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,Z,0,G):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,Z,0);else if(x.depthTexture.format===er)de(x)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,Z,0,G):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function st(A){const x=i.get(A),B=A.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==A.depthTexture){const W=A.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),W){const Z=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,W.removeEventListener("dispose",Z)};W.addEventListener("dispose",Z),x.__depthDisposeCallback=Z}x.__boundDepthTexture=W}if(A.depthTexture&&!x.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");const W=A.texture.mipmaps;W&&W.length>0?Pe(x.__webglFramebuffer[0],A):Pe(x.__webglFramebuffer,A)}else if(B){x.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[W]),x.__webglDepthbuffer[W]===void 0)x.__webglDepthbuffer[W]=n.createRenderbuffer(),Ae(x.__webglDepthbuffer[W],A,!1);else{const Z=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,G=x.__webglDepthbuffer[W];n.bindRenderbuffer(n.RENDERBUFFER,G),n.framebufferRenderbuffer(n.FRAMEBUFFER,Z,n.RENDERBUFFER,G)}}else{const W=A.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=n.createRenderbuffer(),Ae(x.__webglDepthbuffer,A,!1);else{const Z=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,G=x.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,G),n.framebufferRenderbuffer(n.FRAMEBUFFER,Z,n.RENDERBUFFER,G)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function ke(A,x,B){const W=i.get(A);x!==void 0&&be(W.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),B!==void 0&&st(A)}function P(A){const x=A.texture,B=i.get(A),W=i.get(x);A.addEventListener("dispose",C);const Z=A.textures,G=A.isWebGLCubeRenderTarget===!0,Me=Z.length>1;if(Me||(W.__webglTexture===void 0&&(W.__webglTexture=n.createTexture()),W.__version=x.version,o.memory.textures++),G){B.__webglFramebuffer=[];for(let te=0;te<6;te++)if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer[te]=[];for(let me=0;me<x.mipmaps.length;me++)B.__webglFramebuffer[te][me]=n.createFramebuffer()}else B.__webglFramebuffer[te]=n.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer=[];for(let te=0;te<x.mipmaps.length;te++)B.__webglFramebuffer[te]=n.createFramebuffer()}else B.__webglFramebuffer=n.createFramebuffer();if(Me)for(let te=0,me=Z.length;te<me;te++){const ve=i.get(Z[te]);ve.__webglTexture===void 0&&(ve.__webglTexture=n.createTexture(),o.memory.textures++)}if(A.samples>0&&de(A)===!1){B.__webglMultisampledFramebuffer=n.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let te=0;te<Z.length;te++){const me=Z[te];B.__webglColorRenderbuffer[te]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,B.__webglColorRenderbuffer[te]);const ve=s.convert(me.format,me.colorSpace),J=s.convert(me.type),ue=E(me.internalFormat,ve,J,me.colorSpace,A.isXRRenderTarget===!0),Ce=je(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,Ce,ue,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+te,n.RENDERBUFFER,B.__webglColorRenderbuffer[te])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(B.__webglDepthRenderbuffer=n.createRenderbuffer(),Ae(B.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(G){t.bindTexture(n.TEXTURE_CUBE_MAP,W.__webglTexture),Ie(n.TEXTURE_CUBE_MAP,x);for(let te=0;te<6;te++)if(x.mipmaps&&x.mipmaps.length>0)for(let me=0;me<x.mipmaps.length;me++)be(B.__webglFramebuffer[te][me],A,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+te,me);else be(B.__webglFramebuffer[te],A,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0);m(x)&&f(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Me){for(let te=0,me=Z.length;te<me;te++){const ve=Z[te],J=i.get(ve);let ue=n.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(ue=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ue,J.__webglTexture),Ie(ue,ve),be(B.__webglFramebuffer,A,ve,n.COLOR_ATTACHMENT0+te,ue,0),m(ve)&&f(ue)}t.unbindTexture()}else{let te=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(te=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(te,W.__webglTexture),Ie(te,x),x.mipmaps&&x.mipmaps.length>0)for(let me=0;me<x.mipmaps.length;me++)be(B.__webglFramebuffer[me],A,x,n.COLOR_ATTACHMENT0,te,me);else be(B.__webglFramebuffer,A,x,n.COLOR_ATTACHMENT0,te,0);m(x)&&f(te),t.unbindTexture()}A.depthBuffer&&st(A)}function $e(A){const x=A.textures;for(let B=0,W=x.length;B<W;B++){const Z=x[B];if(m(Z)){const G=b(A),Me=i.get(Z).__webglTexture;t.bindTexture(G,Me),f(G),t.unbindTexture()}}}const ye=[],Fe=[];function _e(A){if(A.samples>0){if(de(A)===!1){const x=A.textures,B=A.width,W=A.height;let Z=n.COLOR_BUFFER_BIT;const G=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Me=i.get(A),te=x.length>1;if(te)for(let ve=0;ve<x.length;ve++)t.bindFramebuffer(n.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Me.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Me.__webglMultisampledFramebuffer);const me=A.texture.mipmaps;me&&me.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Me.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Me.__webglFramebuffer);for(let ve=0;ve<x.length;ve++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(Z|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(Z|=n.STENCIL_BUFFER_BIT)),te){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Me.__webglColorRenderbuffer[ve]);const J=i.get(x[ve]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,J,0)}n.blitFramebuffer(0,0,B,W,0,0,B,W,Z,n.NEAREST),l===!0&&(ye.length=0,Fe.length=0,ye.push(n.COLOR_ATTACHMENT0+ve),A.depthBuffer&&A.resolveDepthBuffer===!1&&(ye.push(G),Fe.push(G),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Fe)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,ye))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),te)for(let ve=0;ve<x.length;ve++){t.bindFramebuffer(n.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.RENDERBUFFER,Me.__webglColorRenderbuffer[ve]);const J=i.get(x[ve]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Me.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.TEXTURE_2D,J,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Me.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&l){const x=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[x])}}}function je(A){return Math.min(r.maxSamples,A.samples)}function de(A){const x=i.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Oe(A){const x=o.render.frame;d.get(A)!==x&&(d.set(A,x),A.update())}function Le(A,x){const B=A.colorSpace,W=A.format,Z=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||B!==Ii&&B!==Rn&&(Ye.getTransfer(B)===et?(W!==Zt||Z!==rn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),x}function Ve(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=N,this.resetTextureUnits=O,this.setTexture2D=q,this.setTexture2DArray=X,this.setTexture3D=K,this.setTextureCube=H,this.rebindTextures=ke,this.setupRenderTarget=P,this.updateRenderTargetMipmap=$e,this.updateMultisampleRenderTarget=_e,this.setupDepthRenderbuffer=st,this.setupFrameBufferTexture=be,this.useMultisampledRTT=de}function y_(n,e){function t(i,r=Rn){let s;const o=Ye.getTransfer(r);if(i===rn)return n.UNSIGNED_BYTE;if(i===Qo)return n.UNSIGNED_SHORT_4_4_4_4;if(i===ea)return n.UNSIGNED_SHORT_5_5_5_1;if(i===mc)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===fc)return n.BYTE;if(i===pc)return n.SHORT;if(i===ji)return n.UNSIGNED_SHORT;if(i===Jo)return n.INT;if(i===ei)return n.UNSIGNED_INT;if(i===mn)return n.FLOAT;if(i===ir)return n.HALF_FLOAT;if(i===gc)return n.ALPHA;if(i===_c)return n.RGB;if(i===Zt)return n.RGBA;if(i===Qi)return n.DEPTH_COMPONENT;if(i===er)return n.DEPTH_STENCIL;if(i===vc)return n.RED;if(i===ta)return n.RED_INTEGER;if(i===xc)return n.RG;if(i===na)return n.RG_INTEGER;if(i===ia)return n.RGBA_INTEGER;if(i===Hr||i===kr||i===Vr||i===Gr)if(o===et)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Hr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===kr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Vr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Gr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Hr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===kr)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Vr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Gr)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===go||i===_o||i===vo||i===xo)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===go)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===_o)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===vo)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===xo)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Mo||i===So||i===yo)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===Mo||i===So)return o===et?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===yo)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Eo||i===To||i===bo||i===Ao||i===wo||i===Ro||i===Co||i===Po||i===Do||i===Lo||i===Io||i===Uo||i===No||i===Fo)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===Eo)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===To)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===bo)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Ao)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===wo)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ro)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Co)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Po)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Do)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Lo)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Io)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Uo)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===No)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Fo)return o===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Wr||i===Oo||i===Bo)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Wr)return o===et?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Oo)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Bo)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Mc||i===zo||i===Ho||i===ko)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Wr)return s.COMPRESSED_RED_RGTC1_EXT;if(i===zo)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Ho)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===ko)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Ji?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}class kc extends wt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}}const E_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,T_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class b_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new kc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Mn({vertexShader:E_,fragmentShader:T_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ft(new is(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class A_ extends Ni{constructor(e,t){super();const i=this;let r=null,s=1,o=null,a="local-floor",l=1,c=null,d=null,u=null,h=null,p=null,g=null;const _=new b_,m={},f=t.getContextAttributes();let b=null,E=null;const v=[],R=[],T=new We;let C=null;const D=new Gt;D.viewport=new tt;const y=new Gt;y.viewport=new tt;const M=[D,y],w=new Vh;let O=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let ae=v[Y];return ae===void 0&&(ae=new Ds,v[Y]=ae),ae.getTargetRaySpace()},this.getControllerGrip=function(Y){let ae=v[Y];return ae===void 0&&(ae=new Ds,v[Y]=ae),ae.getGripSpace()},this.getHand=function(Y){let ae=v[Y];return ae===void 0&&(ae=new Ds,v[Y]=ae),ae.getHandSpace()};function V(Y){const ae=R.indexOf(Y.inputSource);if(ae===-1)return;const ie=v[ae];ie!==void 0&&(ie.update(Y.inputSource,Y.frame,c||o),ie.dispatchEvent({type:Y.type,data:Y.inputSource}))}function q(){r.removeEventListener("select",V),r.removeEventListener("selectstart",V),r.removeEventListener("selectend",V),r.removeEventListener("squeeze",V),r.removeEventListener("squeezestart",V),r.removeEventListener("squeezeend",V),r.removeEventListener("end",q),r.removeEventListener("inputsourceschange",X);for(let Y=0;Y<v.length;Y++){const ae=R[Y];ae!==null&&(R[Y]=null,v[Y].disconnect(ae))}O=null,N=null,_.reset();for(const Y in m)delete m[Y];e.setRenderTarget(b),p=null,h=null,u=null,r=null,E=null,Ze.stop(),i.isPresenting=!1,e.setPixelRatio(C),e.setSize(T.width,T.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){s=Y,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return h!==null?h:p},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(Y){if(r=Y,r!==null){if(b=e.getRenderTarget(),r.addEventListener("select",V),r.addEventListener("selectstart",V),r.addEventListener("selectend",V),r.addEventListener("squeeze",V),r.addEventListener("squeezestart",V),r.addEventListener("squeezeend",V),r.addEventListener("end",q),r.addEventListener("inputsourceschange",X),f.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(T),typeof XRWebGLBinding<"u"&&(u=new XRWebGLBinding(r,t)),u!==null&&"createProjectionLayer"in XRWebGLBinding.prototype){let ie=null,be=null,Ae=null;f.depth&&(Ae=f.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ie=f.stencil?er:Qi,be=f.stencil?Ji:ei);const Pe={colorFormat:t.RGBA8,depthFormat:Ae,scaleFactor:s};h=u.createProjectionLayer(Pe),r.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),E=new ti(h.textureWidth,h.textureHeight,{format:Zt,type:rn,depthTexture:new Lc(h.textureWidth,h.textureHeight,be,void 0,void 0,void 0,void 0,void 0,void 0,ie),stencilBuffer:f.stencil,colorSpace:e.outputColorSpace,samples:f.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{const ie={antialias:f.antialias,alpha:!0,depth:f.depth,stencil:f.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,t,ie),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),E=new ti(p.framebufferWidth,p.framebufferHeight,{format:Zt,type:rn,colorSpace:e.outputColorSpace,stencilBuffer:f.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),Ze.setContext(r),Ze.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function X(Y){for(let ae=0;ae<Y.removed.length;ae++){const ie=Y.removed[ae],be=R.indexOf(ie);be>=0&&(R[be]=null,v[be].disconnect(ie))}for(let ae=0;ae<Y.added.length;ae++){const ie=Y.added[ae];let be=R.indexOf(ie);if(be===-1){for(let Pe=0;Pe<v.length;Pe++)if(Pe>=R.length){R.push(ie),be=Pe;break}else if(R[Pe]===null){R[Pe]=ie,be=Pe;break}if(be===-1)break}const Ae=v[be];Ae&&Ae.connect(ie)}}const K=new I,H=new I;function ne(Y,ae,ie){K.setFromMatrixPosition(ae.matrixWorld),H.setFromMatrixPosition(ie.matrixWorld);const be=K.distanceTo(H),Ae=ae.projectionMatrix.elements,Pe=ie.projectionMatrix.elements,st=Ae[14]/(Ae[10]-1),ke=Ae[14]/(Ae[10]+1),P=(Ae[9]+1)/Ae[5],$e=(Ae[9]-1)/Ae[5],ye=(Ae[8]-1)/Ae[0],Fe=(Pe[8]+1)/Pe[0],_e=st*ye,je=st*Fe,de=be/(-ye+Fe),Oe=de*-ye;if(ae.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(Oe),Y.translateZ(de),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Ae[10]===-1)Y.projectionMatrix.copy(ae.projectionMatrix),Y.projectionMatrixInverse.copy(ae.projectionMatrixInverse);else{const Le=st+de,Ve=ke+de,A=_e-Oe,x=je+(be-Oe),B=P*ke/Ve*Le,W=$e*ke/Ve*Le;Y.projectionMatrix.makePerspective(A,x,B,W,Le,Ve),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function oe(Y,ae){ae===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(ae.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(r===null)return;let ae=Y.near,ie=Y.far;_.texture!==null&&(_.depthNear>0&&(ae=_.depthNear),_.depthFar>0&&(ie=_.depthFar)),w.near=y.near=D.near=ae,w.far=y.far=D.far=ie,(O!==w.near||N!==w.far)&&(r.updateRenderState({depthNear:w.near,depthFar:w.far}),O=w.near,N=w.far),w.layers.mask=Y.layers.mask|6,D.layers.mask=w.layers.mask&3,y.layers.mask=w.layers.mask&5;const be=Y.parent,Ae=w.cameras;oe(w,be);for(let Pe=0;Pe<Ae.length;Pe++)oe(Ae[Pe],be);Ae.length===2?ne(w,D,y):w.projectionMatrix.copy(D.projectionMatrix),xe(Y,w,be)};function xe(Y,ae,ie){ie===null?Y.matrix.copy(ae.matrixWorld):(Y.matrix.copy(ie.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(ae.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(ae.projectionMatrix),Y.projectionMatrixInverse.copy(ae.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=tr*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return w},this.getFoveation=function(){if(!(h===null&&p===null))return l},this.setFoveation=function(Y){l=Y,h!==null&&(h.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(w)},this.getCameraTexture=function(Y){return m[Y]};let Ie=null;function nt(Y,ae){if(d=ae.getViewerPose(c||o),g=ae,d!==null){const ie=d.views;p!==null&&(e.setRenderTargetFramebuffer(E,p.framebuffer),e.setRenderTarget(E));let be=!1;ie.length!==w.cameras.length&&(w.cameras.length=0,be=!0);for(let ke=0;ke<ie.length;ke++){const P=ie[ke];let $e=null;if(p!==null)$e=p.getViewport(P);else{const Fe=u.getViewSubImage(h,P);$e=Fe.viewport,ke===0&&(e.setRenderTargetTextures(E,Fe.colorTexture,Fe.depthStencilTexture),e.setRenderTarget(E))}let ye=M[ke];ye===void 0&&(ye=new Gt,ye.layers.enable(ke),ye.viewport=new tt,M[ke]=ye),ye.matrix.fromArray(P.transform.matrix),ye.matrix.decompose(ye.position,ye.quaternion,ye.scale),ye.projectionMatrix.fromArray(P.projectionMatrix),ye.projectionMatrixInverse.copy(ye.projectionMatrix).invert(),ye.viewport.set($e.x,$e.y,$e.width,$e.height),ke===0&&(w.matrix.copy(ye.matrix),w.matrix.decompose(w.position,w.quaternion,w.scale)),be===!0&&w.cameras.push(ye)}const Ae=r.enabledFeatures;if(Ae&&Ae.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&u){const ke=u.getDepthInformation(ie[0]);ke&&ke.isValid&&ke.texture&&_.init(ke,r.renderState)}if(Ae&&Ae.includes("camera-access")&&(e.state.unbindTexture(),u))for(let ke=0;ke<ie.length;ke++){const P=ie[ke].camera;if(P){let $e=m[P];$e||($e=new kc,m[P]=$e);const ye=u.getCameraImage(P);$e.sourceTexture=ye}}}for(let ie=0;ie<v.length;ie++){const be=R[ie],Ae=v[ie];be!==null&&Ae!==void 0&&Ae.update(be,ae,c||o)}Ie&&Ie(Y,ae),ae.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ae}),g=null}const Ze=new Fc;Ze.setAnimationLoop(nt),this.setAnimationLoop=function(Y){Ie=Y},this.dispose=function(){}}}const Wn=new sn,w_=new at;function R_(n,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function i(m,f){f.color.getRGB(m.fogColor.value,Cc(n)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function r(m,f,b,E,v){f.isMeshBasicMaterial||f.isMeshLambertMaterial?s(m,f):f.isMeshToonMaterial?(s(m,f),u(m,f)):f.isMeshPhongMaterial?(s(m,f),d(m,f)):f.isMeshStandardMaterial?(s(m,f),h(m,f),f.isMeshPhysicalMaterial&&p(m,f,v)):f.isMeshMatcapMaterial?(s(m,f),g(m,f)):f.isMeshDepthMaterial?s(m,f):f.isMeshDistanceMaterial?(s(m,f),_(m,f)):f.isMeshNormalMaterial?s(m,f):f.isLineBasicMaterial?(o(m,f),f.isLineDashedMaterial&&a(m,f)):f.isPointsMaterial?l(m,f,b,E):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function s(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Pt&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Pt&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);const b=e.get(f),E=b.envMap,v=b.envMapRotation;E&&(m.envMap.value=E,Wn.copy(v),Wn.x*=-1,Wn.y*=-1,Wn.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(Wn.y*=-1,Wn.z*=-1),m.envMapRotation.value.setFromMatrix4(w_.makeRotationFromEuler(Wn)),m.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function o(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function a(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,b,E){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*b,m.scale.value=E*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function d(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function u(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function h(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,b){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Pt&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function _(m,f){const b=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function C_(n,e,t,i){let r={},s={},o=[];const a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,E){const v=E.program;i.uniformBlockBinding(b,v)}function c(b,E){let v=r[b.id];v===void 0&&(g(b),v=d(b),r[b.id]=v,b.addEventListener("dispose",m));const R=E.program;i.updateUBOMapping(b,R);const T=e.render.frame;s[b.id]!==T&&(h(b),s[b.id]=T)}function d(b){const E=u();b.__bindingPointIndex=E;const v=n.createBuffer(),R=b.__size,T=b.usage;return n.bindBuffer(n.UNIFORM_BUFFER,v),n.bufferData(n.UNIFORM_BUFFER,R,T),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,E,v),v}function u(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(b){const E=r[b.id],v=b.uniforms,R=b.__cache;n.bindBuffer(n.UNIFORM_BUFFER,E);for(let T=0,C=v.length;T<C;T++){const D=Array.isArray(v[T])?v[T]:[v[T]];for(let y=0,M=D.length;y<M;y++){const w=D[y];if(p(w,T,y,R)===!0){const O=w.__offset,N=Array.isArray(w.value)?w.value:[w.value];let V=0;for(let q=0;q<N.length;q++){const X=N[q],K=_(X);typeof X=="number"||typeof X=="boolean"?(w.__data[0]=X,n.bufferSubData(n.UNIFORM_BUFFER,O+V,w.__data)):X.isMatrix3?(w.__data[0]=X.elements[0],w.__data[1]=X.elements[1],w.__data[2]=X.elements[2],w.__data[3]=0,w.__data[4]=X.elements[3],w.__data[5]=X.elements[4],w.__data[6]=X.elements[5],w.__data[7]=0,w.__data[8]=X.elements[6],w.__data[9]=X.elements[7],w.__data[10]=X.elements[8],w.__data[11]=0):(X.toArray(w.__data,V),V+=K.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,O,w.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function p(b,E,v,R){const T=b.value,C=E+"_"+v;if(R[C]===void 0)return typeof T=="number"||typeof T=="boolean"?R[C]=T:R[C]=T.clone(),!0;{const D=R[C];if(typeof T=="number"||typeof T=="boolean"){if(D!==T)return R[C]=T,!0}else if(D.equals(T)===!1)return D.copy(T),!0}return!1}function g(b){const E=b.uniforms;let v=0;const R=16;for(let C=0,D=E.length;C<D;C++){const y=Array.isArray(E[C])?E[C]:[E[C]];for(let M=0,w=y.length;M<w;M++){const O=y[M],N=Array.isArray(O.value)?O.value:[O.value];for(let V=0,q=N.length;V<q;V++){const X=N[V],K=_(X),H=v%R,ne=H%K.boundary,oe=H+ne;v+=ne,oe!==0&&R-oe<K.storage&&(v+=R-oe),O.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=v,v+=K.storage}}}const T=v%R;return T>0&&(v+=R-T),b.__size=v,b.__cache={},this}function _(b){const E={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(E.boundary=4,E.storage=4):b.isVector2?(E.boundary=8,E.storage=8):b.isVector3||b.isColor?(E.boundary=16,E.storage=12):b.isVector4?(E.boundary=16,E.storage=16):b.isMatrix3?(E.boundary=48,E.storage=48):b.isMatrix4?(E.boundary=64,E.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),E}function m(b){const E=b.target;E.removeEventListener("dispose",m);const v=o.indexOf(E.__bindingPointIndex);o.splice(v,1),n.deleteBuffer(r[E.id]),delete r[E.id],delete s[E.id]}function f(){for(const b in r)n.deleteBuffer(r[b]);o=[],r={},s={}}return{bind:l,update:c,dispose:f}}class P_{constructor(e={}){const{canvas:t=eh(),context:i=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:h=!1}=e;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=o;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,f=null;const b=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Un,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const v=this;let R=!1;this._outputColorSpace=Ot;let T=0,C=0,D=null,y=-1,M=null;const w=new tt,O=new tt;let N=null;const V=new Xe(0);let q=0,X=t.width,K=t.height,H=1,ne=null,oe=null;const xe=new tt(0,0,X,K),Ie=new tt(0,0,X,K);let nt=!1;const Ze=new ca;let Y=!1,ae=!1;const ie=new at,be=new I,Ae=new tt,Pe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let st=!1;function ke(){return D===null?H:1}let P=i;function $e(S,U){return t.getContext(S,U)}try{const S={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${jo}`),t.addEventListener("webglcontextlost",re,!1),t.addEventListener("webglcontextrestored",fe,!1),t.addEventListener("webglcontextcreationerror",j,!1),P===null){const U="webgl2";if(P=$e(U,S),P===null)throw $e(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let ye,Fe,_e,je,de,Oe,Le,Ve,A,x,B,W,Z,G,Me,te,me,ve,J,ue,Ce,Se,le,Be;function L(){ye=new Hm(P),ye.init(),Se=new y_(P,ye),Fe=new Im(P,ye,e,Se),_e=new M_(P,ye),Fe.reversedDepthBuffer&&h&&_e.buffers.depth.setReversed(!0),je=new Gm(P),de=new a_,Oe=new S_(P,ye,_e,de,Fe,Se,je),Le=new Nm(v),Ve=new zm(v),A=new $h(P),le=new Dm(P,A),x=new km(P,A,je,le),B=new Xm(P,x,A,je),J=new Wm(P,Fe,Oe),te=new Um(de),W=new o_(v,Le,Ve,ye,Fe,le,te),Z=new R_(v,de),G=new c_,Me=new m_(ye),ve=new Pm(v,Le,Ve,_e,B,p,l),me=new v_(v,B,Fe),Be=new C_(P,je,Fe,_e),ue=new Lm(P,ye,je),Ce=new Vm(P,ye,je),je.programs=W.programs,v.capabilities=Fe,v.extensions=ye,v.properties=de,v.renderLists=G,v.shadowMap=me,v.state=_e,v.info=je}L();const ee=new A_(v,P);this.xr=ee,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const S=ye.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=ye.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return H},this.setPixelRatio=function(S){S!==void 0&&(H=S,this.setSize(X,K,!1))},this.getSize=function(S){return S.set(X,K)},this.setSize=function(S,U,z=!0){if(ee.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=S,K=U,t.width=Math.floor(S*H),t.height=Math.floor(U*H),z===!0&&(t.style.width=S+"px",t.style.height=U+"px"),this.setViewport(0,0,S,U)},this.getDrawingBufferSize=function(S){return S.set(X*H,K*H).floor()},this.setDrawingBufferSize=function(S,U,z){X=S,K=U,H=z,t.width=Math.floor(S*z),t.height=Math.floor(U*z),this.setViewport(0,0,S,U)},this.getCurrentViewport=function(S){return S.copy(w)},this.getViewport=function(S){return S.copy(xe)},this.setViewport=function(S,U,z,k){S.isVector4?xe.set(S.x,S.y,S.z,S.w):xe.set(S,U,z,k),_e.viewport(w.copy(xe).multiplyScalar(H).round())},this.getScissor=function(S){return S.copy(Ie)},this.setScissor=function(S,U,z,k){S.isVector4?Ie.set(S.x,S.y,S.z,S.w):Ie.set(S,U,z,k),_e.scissor(O.copy(Ie).multiplyScalar(H).round())},this.getScissorTest=function(){return nt},this.setScissorTest=function(S){_e.setScissorTest(nt=S)},this.setOpaqueSort=function(S){ne=S},this.setTransparentSort=function(S){oe=S},this.getClearColor=function(S){return S.copy(ve.getClearColor())},this.setClearColor=function(){ve.setClearColor(...arguments)},this.getClearAlpha=function(){return ve.getClearAlpha()},this.setClearAlpha=function(){ve.setClearAlpha(...arguments)},this.clear=function(S=!0,U=!0,z=!0){let k=0;if(S){let F=!1;if(D!==null){const Q=D.texture.format;F=Q===ia||Q===na||Q===ta}if(F){const Q=D.texture.type,ce=Q===rn||Q===ei||Q===ji||Q===Ji||Q===Qo||Q===ea,pe=ve.getClearColor(),he=ve.getClearAlpha(),Re=pe.r,De=pe.g,Ee=pe.b;ce?(g[0]=Re,g[1]=De,g[2]=Ee,g[3]=he,P.clearBufferuiv(P.COLOR,0,g)):(_[0]=Re,_[1]=De,_[2]=Ee,_[3]=he,P.clearBufferiv(P.COLOR,0,_))}else k|=P.COLOR_BUFFER_BIT}U&&(k|=P.DEPTH_BUFFER_BIT),z&&(k|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",re,!1),t.removeEventListener("webglcontextrestored",fe,!1),t.removeEventListener("webglcontextcreationerror",j,!1),ve.dispose(),G.dispose(),Me.dispose(),de.dispose(),Le.dispose(),Ve.dispose(),B.dispose(),le.dispose(),Be.dispose(),W.dispose(),ee.dispose(),ee.removeEventListener("sessionstart",Jt),ee.removeEventListener("sessionend",ma),On.stop()};function re(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),R=!0}function fe(){console.log("THREE.WebGLRenderer: Context Restored."),R=!1;const S=je.autoReset,U=me.enabled,z=me.autoUpdate,k=me.needsUpdate,F=me.type;L(),je.autoReset=S,me.enabled=U,me.autoUpdate=z,me.needsUpdate=k,me.type=F}function j(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function $(S){const U=S.target;U.removeEventListener("dispose",$),ge(U)}function ge(S){Ue(S),de.remove(S)}function Ue(S){const U=de.get(S).programs;U!==void 0&&(U.forEach(function(z){W.releaseProgram(z)}),S.isShaderMaterial&&W.releaseShaderCache(S))}this.renderBufferDirect=function(S,U,z,k,F,Q){U===null&&(U=Pe);const ce=F.isMesh&&F.matrixWorld.determinant()<0,pe=tu(S,U,z,k,F);_e.setMaterial(k,ce);let he=z.index,Re=1;if(k.wireframe===!0){if(he=x.getWireframeAttribute(z),he===void 0)return;Re=2}const De=z.drawRange,Ee=z.attributes.position;let Ge=De.start*Re,Qe=(De.start+De.count)*Re;Q!==null&&(Ge=Math.max(Ge,Q.start*Re),Qe=Math.min(Qe,(Q.start+Q.count)*Re)),he!==null?(Ge=Math.max(Ge,0),Qe=Math.min(Qe,he.count)):Ee!=null&&(Ge=Math.max(Ge,0),Qe=Math.min(Qe,Ee.count));const ut=Qe-Ge;if(ut<0||ut===1/0)return;le.setup(F,k,pe,z,he);let ot,it=ue;if(he!==null&&(ot=A.get(he),it=Ce,it.setIndex(ot)),F.isMesh)k.wireframe===!0?(_e.setLineWidth(k.wireframeLinewidth*ke()),it.setMode(P.LINES)):it.setMode(P.TRIANGLES);else if(F.isLine){let we=k.linewidth;we===void 0&&(we=1),_e.setLineWidth(we*ke()),F.isLineSegments?it.setMode(P.LINES):F.isLineLoop?it.setMode(P.LINE_LOOP):it.setMode(P.LINE_STRIP)}else F.isPoints?it.setMode(P.POINTS):F.isSprite&&it.setMode(P.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)wi("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),it.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(ye.get("WEBGL_multi_draw"))it.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const we=F._multiDrawStarts,lt=F._multiDrawCounts,qe=F._multiDrawCount,It=he?A.get(he).bytesPerElement:1,ni=de.get(k).currentProgram.getUniforms();for(let Ut=0;Ut<qe;Ut++)ni.setValue(P,"_gl_DrawID",Ut),it.render(we[Ut]/It,lt[Ut])}else if(F.isInstancedMesh)it.renderInstances(Ge,ut,F.count);else if(z.isInstancedBufferGeometry){const we=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,lt=Math.min(z.instanceCount,we);it.renderInstances(Ge,ut,lt)}else it.render(Ge,ut)};function rt(S,U,z){S.transparent===!0&&S.side===pn&&S.forceSinglePass===!1?(S.side=Pt,S.needsUpdate=!0,ur(S,U,z),S.side=Nn,S.needsUpdate=!0,ur(S,U,z),S.side=pn):ur(S,U,z)}this.compile=function(S,U,z=null){z===null&&(z=S),f=Me.get(z),f.init(U),E.push(f),z.traverseVisible(function(F){F.isLight&&F.layers.test(U.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),S!==z&&S.traverseVisible(function(F){F.isLight&&F.layers.test(U.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),f.setupLights();const k=new Set;return S.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const Q=F.material;if(Q)if(Array.isArray(Q))for(let ce=0;ce<Q.length;ce++){const pe=Q[ce];rt(pe,z,F),k.add(pe)}else rt(Q,z,F),k.add(Q)}),f=E.pop(),k},this.compileAsync=function(S,U,z=null){const k=this.compile(S,U,z);return new Promise(F=>{function Q(){if(k.forEach(function(ce){de.get(ce).currentProgram.isReady()&&k.delete(ce)}),k.size===0){F(S);return}setTimeout(Q,10)}ye.get("KHR_parallel_shader_compile")!==null?Q():setTimeout(Q,10)})};let Ke=null;function on(S){Ke&&Ke(S)}function Jt(){On.stop()}function ma(){On.start()}const On=new Fc;On.setAnimationLoop(on),typeof self<"u"&&On.setContext(self),this.setAnimationLoop=function(S){Ke=S,ee.setAnimationLoop(S),S===null?On.stop():On.start()},ee.addEventListener("sessionstart",Jt),ee.addEventListener("sessionend",ma),this.render=function(S,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),ee.enabled===!0&&ee.isPresenting===!0&&(ee.cameraAutoUpdate===!0&&ee.updateCamera(U),U=ee.getCamera()),S.isScene===!0&&S.onBeforeRender(v,S,U,D),f=Me.get(S,E.length),f.init(U),E.push(f),ie.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Ze.setFromProjectionMatrix(ie,nn,U.reversedDepth),ae=this.localClippingEnabled,Y=te.init(this.clippingPlanes,ae),m=G.get(S,b.length),m.init(),b.push(m),ee.enabled===!0&&ee.isPresenting===!0){const Q=v.xr.getDepthSensingMesh();Q!==null&&ss(Q,U,-1/0,v.sortObjects)}ss(S,U,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(ne,oe),st=ee.enabled===!1||ee.isPresenting===!1||ee.hasDepthSensing()===!1,st&&ve.addToRenderList(m,S),this.info.render.frame++,Y===!0&&te.beginShadows();const z=f.state.shadowsArray;me.render(z,S,U),Y===!0&&te.endShadows(),this.info.autoReset===!0&&this.info.reset();const k=m.opaque,F=m.transmissive;if(f.setupLights(),U.isArrayCamera){const Q=U.cameras;if(F.length>0)for(let ce=0,pe=Q.length;ce<pe;ce++){const he=Q[ce];_a(k,F,S,he)}st&&ve.render(S);for(let ce=0,pe=Q.length;ce<pe;ce++){const he=Q[ce];ga(m,S,he,he.viewport)}}else F.length>0&&_a(k,F,S,U),st&&ve.render(S),ga(m,S,U);D!==null&&C===0&&(Oe.updateMultisampleRenderTarget(D),Oe.updateRenderTargetMipmap(D)),S.isScene===!0&&S.onAfterRender(v,S,U),le.resetDefaultState(),y=-1,M=null,E.pop(),E.length>0?(f=E[E.length-1],Y===!0&&te.setGlobalState(v.clippingPlanes,f.state.camera)):f=null,b.pop(),b.length>0?m=b[b.length-1]:m=null};function ss(S,U,z,k){if(S.visible===!1)return;if(S.layers.test(U.layers)){if(S.isGroup)z=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(U);else if(S.isLight)f.pushLight(S),S.castShadow&&f.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||Ze.intersectsSprite(S)){k&&Ae.setFromMatrixPosition(S.matrixWorld).applyMatrix4(ie);const ce=B.update(S),pe=S.material;pe.visible&&m.push(S,ce,pe,z,Ae.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||Ze.intersectsObject(S))){const ce=B.update(S),pe=S.material;if(k&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Ae.copy(S.boundingSphere.center)):(ce.boundingSphere===null&&ce.computeBoundingSphere(),Ae.copy(ce.boundingSphere.center)),Ae.applyMatrix4(S.matrixWorld).applyMatrix4(ie)),Array.isArray(pe)){const he=ce.groups;for(let Re=0,De=he.length;Re<De;Re++){const Ee=he[Re],Ge=pe[Ee.materialIndex];Ge&&Ge.visible&&m.push(S,ce,Ge,z,Ae.z,Ee)}}else pe.visible&&m.push(S,ce,pe,z,Ae.z,null)}}const Q=S.children;for(let ce=0,pe=Q.length;ce<pe;ce++)ss(Q[ce],U,z,k)}function ga(S,U,z,k){const F=S.opaque,Q=S.transmissive,ce=S.transparent;f.setupLightsView(z),Y===!0&&te.setGlobalState(v.clippingPlanes,z),k&&_e.viewport(w.copy(k)),F.length>0&&cr(F,U,z),Q.length>0&&cr(Q,U,z),ce.length>0&&cr(ce,U,z),_e.buffers.depth.setTest(!0),_e.buffers.depth.setMask(!0),_e.buffers.color.setMask(!0),_e.setPolygonOffset(!1)}function _a(S,U,z,k){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[k.id]===void 0&&(f.state.transmissionRenderTarget[k.id]=new ti(1,1,{generateMipmaps:!0,type:ye.has("EXT_color_buffer_half_float")||ye.has("EXT_color_buffer_float")?ir:rn,minFilter:Cn,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ye.workingColorSpace}));const Q=f.state.transmissionRenderTarget[k.id],ce=k.viewport||w;Q.setSize(ce.z*v.transmissionResolutionScale,ce.w*v.transmissionResolutionScale);const pe=v.getRenderTarget(),he=v.getActiveCubeFace(),Re=v.getActiveMipmapLevel();v.setRenderTarget(Q),v.getClearColor(V),q=v.getClearAlpha(),q<1&&v.setClearColor(16777215,.5),v.clear(),st&&ve.render(z);const De=v.toneMapping;v.toneMapping=Un;const Ee=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),f.setupLightsView(k),Y===!0&&te.setGlobalState(v.clippingPlanes,k),cr(S,z,k),Oe.updateMultisampleRenderTarget(Q),Oe.updateRenderTargetMipmap(Q),ye.has("WEBGL_multisampled_render_to_texture")===!1){let Ge=!1;for(let Qe=0,ut=U.length;Qe<ut;Qe++){const ot=U[Qe],it=ot.object,we=ot.geometry,lt=ot.material,qe=ot.group;if(lt.side===pn&&it.layers.test(k.layers)){const It=lt.side;lt.side=Pt,lt.needsUpdate=!0,va(it,z,k,we,lt,qe),lt.side=It,lt.needsUpdate=!0,Ge=!0}}Ge===!0&&(Oe.updateMultisampleRenderTarget(Q),Oe.updateRenderTargetMipmap(Q))}v.setRenderTarget(pe,he,Re),v.setClearColor(V,q),Ee!==void 0&&(k.viewport=Ee),v.toneMapping=De}function cr(S,U,z){const k=U.isScene===!0?U.overrideMaterial:null;for(let F=0,Q=S.length;F<Q;F++){const ce=S[F],pe=ce.object,he=ce.geometry,Re=ce.group;let De=ce.material;De.allowOverride===!0&&k!==null&&(De=k),pe.layers.test(z.layers)&&va(pe,U,z,he,De,Re)}}function va(S,U,z,k,F,Q){S.onBeforeRender(v,U,z,k,F,Q),S.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),F.onBeforeRender(v,U,z,k,S,Q),F.transparent===!0&&F.side===pn&&F.forceSinglePass===!1?(F.side=Pt,F.needsUpdate=!0,v.renderBufferDirect(z,U,k,F,S,Q),F.side=Nn,F.needsUpdate=!0,v.renderBufferDirect(z,U,k,F,S,Q),F.side=pn):v.renderBufferDirect(z,U,k,F,S,Q),S.onAfterRender(v,U,z,k,F,Q)}function ur(S,U,z){U.isScene!==!0&&(U=Pe);const k=de.get(S),F=f.state.lights,Q=f.state.shadowsArray,ce=F.state.version,pe=W.getParameters(S,F.state,Q,U,z),he=W.getProgramCacheKey(pe);let Re=k.programs;k.environment=S.isMeshStandardMaterial?U.environment:null,k.fog=U.fog,k.envMap=(S.isMeshStandardMaterial?Ve:Le).get(S.envMap||k.environment),k.envMapRotation=k.environment!==null&&S.envMap===null?U.environmentRotation:S.envMapRotation,Re===void 0&&(S.addEventListener("dispose",$),Re=new Map,k.programs=Re);let De=Re.get(he);if(De!==void 0){if(k.currentProgram===De&&k.lightsStateVersion===ce)return Ma(S,pe),De}else pe.uniforms=W.getUniforms(S),S.onBeforeCompile(pe,v),De=W.acquireProgram(pe,he),Re.set(he,De),k.uniforms=pe.uniforms;const Ee=k.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Ee.clippingPlanes=te.uniform),Ma(S,pe),k.needsLights=iu(S),k.lightsStateVersion=ce,k.needsLights&&(Ee.ambientLightColor.value=F.state.ambient,Ee.lightProbe.value=F.state.probe,Ee.directionalLights.value=F.state.directional,Ee.directionalLightShadows.value=F.state.directionalShadow,Ee.spotLights.value=F.state.spot,Ee.spotLightShadows.value=F.state.spotShadow,Ee.rectAreaLights.value=F.state.rectArea,Ee.ltc_1.value=F.state.rectAreaLTC1,Ee.ltc_2.value=F.state.rectAreaLTC2,Ee.pointLights.value=F.state.point,Ee.pointLightShadows.value=F.state.pointShadow,Ee.hemisphereLights.value=F.state.hemi,Ee.directionalShadowMap.value=F.state.directionalShadowMap,Ee.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Ee.spotShadowMap.value=F.state.spotShadowMap,Ee.spotLightMatrix.value=F.state.spotLightMatrix,Ee.spotLightMap.value=F.state.spotLightMap,Ee.pointShadowMap.value=F.state.pointShadowMap,Ee.pointShadowMatrix.value=F.state.pointShadowMatrix),k.currentProgram=De,k.uniformsList=null,De}function xa(S){if(S.uniformsList===null){const U=S.currentProgram.getUniforms();S.uniformsList=Xr.seqWithValue(U.seq,S.uniforms)}return S.uniformsList}function Ma(S,U){const z=de.get(S);z.outputColorSpace=U.outputColorSpace,z.batching=U.batching,z.batchingColor=U.batchingColor,z.instancing=U.instancing,z.instancingColor=U.instancingColor,z.instancingMorph=U.instancingMorph,z.skinning=U.skinning,z.morphTargets=U.morphTargets,z.morphNormals=U.morphNormals,z.morphColors=U.morphColors,z.morphTargetsCount=U.morphTargetsCount,z.numClippingPlanes=U.numClippingPlanes,z.numIntersection=U.numClipIntersection,z.vertexAlphas=U.vertexAlphas,z.vertexTangents=U.vertexTangents,z.toneMapping=U.toneMapping}function tu(S,U,z,k,F){U.isScene!==!0&&(U=Pe),Oe.resetTextureUnits();const Q=U.fog,ce=k.isMeshStandardMaterial?U.environment:null,pe=D===null?v.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:Ii,he=(k.isMeshStandardMaterial?Ve:Le).get(k.envMap||ce),Re=k.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,De=!!z.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Ee=!!z.morphAttributes.position,Ge=!!z.morphAttributes.normal,Qe=!!z.morphAttributes.color;let ut=Un;k.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(ut=v.toneMapping);const ot=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,it=ot!==void 0?ot.length:0,we=de.get(k),lt=f.state.lights;if(Y===!0&&(ae===!0||S!==M)){const Et=S===M&&k.id===y;te.setState(k,S,Et)}let qe=!1;k.version===we.__version?(we.needsLights&&we.lightsStateVersion!==lt.state.version||we.outputColorSpace!==pe||F.isBatchedMesh&&we.batching===!1||!F.isBatchedMesh&&we.batching===!0||F.isBatchedMesh&&we.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&we.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&we.instancing===!1||!F.isInstancedMesh&&we.instancing===!0||F.isSkinnedMesh&&we.skinning===!1||!F.isSkinnedMesh&&we.skinning===!0||F.isInstancedMesh&&we.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&we.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&we.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&we.instancingMorph===!1&&F.morphTexture!==null||we.envMap!==he||k.fog===!0&&we.fog!==Q||we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==te.numPlanes||we.numIntersection!==te.numIntersection)||we.vertexAlphas!==Re||we.vertexTangents!==De||we.morphTargets!==Ee||we.morphNormals!==Ge||we.morphColors!==Qe||we.toneMapping!==ut||we.morphTargetsCount!==it)&&(qe=!0):(qe=!0,we.__version=k.version);let It=we.currentProgram;qe===!0&&(It=ur(k,U,F));let ni=!1,Ut=!1,Oi=!1;const ct=It.getUniforms(),Bt=we.uniforms;if(_e.useProgram(It.program)&&(ni=!0,Ut=!0,Oi=!0),k.id!==y&&(y=k.id,Ut=!0),ni||M!==S){_e.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),ct.setValue(P,"projectionMatrix",S.projectionMatrix),ct.setValue(P,"viewMatrix",S.matrixWorldInverse);const Rt=ct.map.cameraPosition;Rt!==void 0&&Rt.setValue(P,be.setFromMatrixPosition(S.matrixWorld)),Fe.logarithmicDepthBuffer&&ct.setValue(P,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&ct.setValue(P,"isOrthographic",S.isOrthographicCamera===!0),M!==S&&(M=S,Ut=!0,Oi=!0)}if(F.isSkinnedMesh){ct.setOptional(P,F,"bindMatrix"),ct.setOptional(P,F,"bindMatrixInverse");const Et=F.skeleton;Et&&(Et.boneTexture===null&&Et.computeBoneTexture(),ct.setValue(P,"boneTexture",Et.boneTexture,Oe))}F.isBatchedMesh&&(ct.setOptional(P,F,"batchingTexture"),ct.setValue(P,"batchingTexture",F._matricesTexture,Oe),ct.setOptional(P,F,"batchingIdTexture"),ct.setValue(P,"batchingIdTexture",F._indirectTexture,Oe),ct.setOptional(P,F,"batchingColorTexture"),F._colorsTexture!==null&&ct.setValue(P,"batchingColorTexture",F._colorsTexture,Oe));const zt=z.morphAttributes;if((zt.position!==void 0||zt.normal!==void 0||zt.color!==void 0)&&J.update(F,z,It),(Ut||we.receiveShadow!==F.receiveShadow)&&(we.receiveShadow=F.receiveShadow,ct.setValue(P,"receiveShadow",F.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&(Bt.envMap.value=he,Bt.flipEnvMap.value=he.isCubeTexture&&he.isRenderTargetTexture===!1?-1:1),k.isMeshStandardMaterial&&k.envMap===null&&U.environment!==null&&(Bt.envMapIntensity.value=U.environmentIntensity),Ut&&(ct.setValue(P,"toneMappingExposure",v.toneMappingExposure),we.needsLights&&nu(Bt,Oi),Q&&k.fog===!0&&Z.refreshFogUniforms(Bt,Q),Z.refreshMaterialUniforms(Bt,k,H,K,f.state.transmissionRenderTarget[S.id]),Xr.upload(P,xa(we),Bt,Oe)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(Xr.upload(P,xa(we),Bt,Oe),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&ct.setValue(P,"center",F.center),ct.setValue(P,"modelViewMatrix",F.modelViewMatrix),ct.setValue(P,"normalMatrix",F.normalMatrix),ct.setValue(P,"modelMatrix",F.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){const Et=k.uniformsGroups;for(let Rt=0,os=Et.length;Rt<os;Rt++){const Bn=Et[Rt];Be.update(Bn,It),Be.bind(Bn,It)}}return It}function nu(S,U){S.ambientLightColor.needsUpdate=U,S.lightProbe.needsUpdate=U,S.directionalLights.needsUpdate=U,S.directionalLightShadows.needsUpdate=U,S.pointLights.needsUpdate=U,S.pointLightShadows.needsUpdate=U,S.spotLights.needsUpdate=U,S.spotLightShadows.needsUpdate=U,S.rectAreaLights.needsUpdate=U,S.hemisphereLights.needsUpdate=U}function iu(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(S,U,z){const k=de.get(S);k.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),de.get(S.texture).__webglTexture=U,de.get(S.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:z,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,U){const z=de.get(S);z.__webglFramebuffer=U,z.__useDefaultFramebuffer=U===void 0};const ru=P.createFramebuffer();this.setRenderTarget=function(S,U=0,z=0){D=S,T=U,C=z;let k=!0,F=null,Q=!1,ce=!1;if(S){const he=de.get(S);if(he.__useDefaultFramebuffer!==void 0)_e.bindFramebuffer(P.FRAMEBUFFER,null),k=!1;else if(he.__webglFramebuffer===void 0)Oe.setupRenderTarget(S);else if(he.__hasExternalTextures)Oe.rebindTextures(S,de.get(S.texture).__webglTexture,de.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const Ee=S.depthTexture;if(he.__boundDepthTexture!==Ee){if(Ee!==null&&de.has(Ee)&&(S.width!==Ee.image.width||S.height!==Ee.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Oe.setupDepthRenderbuffer(S)}}const Re=S.texture;(Re.isData3DTexture||Re.isDataArrayTexture||Re.isCompressedArrayTexture)&&(ce=!0);const De=de.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(De[U])?F=De[U][z]:F=De[U],Q=!0):S.samples>0&&Oe.useMultisampledRTT(S)===!1?F=de.get(S).__webglMultisampledFramebuffer:Array.isArray(De)?F=De[z]:F=De,w.copy(S.viewport),O.copy(S.scissor),N=S.scissorTest}else w.copy(xe).multiplyScalar(H).floor(),O.copy(Ie).multiplyScalar(H).floor(),N=nt;if(z!==0&&(F=ru),_e.bindFramebuffer(P.FRAMEBUFFER,F)&&k&&_e.drawBuffers(S,F),_e.viewport(w),_e.scissor(O),_e.setScissorTest(N),Q){const he=de.get(S.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+U,he.__webglTexture,z)}else if(ce){const he=U;for(let Re=0;Re<S.textures.length;Re++){const De=de.get(S.textures[Re]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+Re,De.__webglTexture,z,he)}}else if(S!==null&&z!==0){const he=de.get(S.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,he.__webglTexture,z)}y=-1},this.readRenderTargetPixels=function(S,U,z,k,F,Q,ce,pe=0){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let he=de.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&ce!==void 0&&(he=he[ce]),he){_e.bindFramebuffer(P.FRAMEBUFFER,he);try{const Re=S.textures[pe],De=Re.format,Ee=Re.type;if(!Fe.textureFormatReadable(De)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Fe.textureTypeReadable(Ee)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=S.width-k&&z>=0&&z<=S.height-F&&(S.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+pe),P.readPixels(U,z,k,F,Se.convert(De),Se.convert(Ee),Q))}finally{const Re=D!==null?de.get(D).__webglFramebuffer:null;_e.bindFramebuffer(P.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(S,U,z,k,F,Q,ce,pe=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let he=de.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&ce!==void 0&&(he=he[ce]),he)if(U>=0&&U<=S.width-k&&z>=0&&z<=S.height-F){_e.bindFramebuffer(P.FRAMEBUFFER,he);const Re=S.textures[pe],De=Re.format,Ee=Re.type;if(!Fe.textureFormatReadable(De))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Fe.textureTypeReadable(Ee))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ge=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,Ge),P.bufferData(P.PIXEL_PACK_BUFFER,Q.byteLength,P.STREAM_READ),S.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+pe),P.readPixels(U,z,k,F,Se.convert(De),Se.convert(Ee),0);const Qe=D!==null?de.get(D).__webglFramebuffer:null;_e.bindFramebuffer(P.FRAMEBUFFER,Qe);const ut=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await th(P,ut,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,Ge),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,Q),P.deleteBuffer(Ge),P.deleteSync(ut),Q}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,U=null,z=0){const k=Math.pow(2,-z),F=Math.floor(S.image.width*k),Q=Math.floor(S.image.height*k),ce=U!==null?U.x:0,pe=U!==null?U.y:0;Oe.setTexture2D(S,0),P.copyTexSubImage2D(P.TEXTURE_2D,z,0,0,ce,pe,F,Q),_e.unbindTexture()};const su=P.createFramebuffer(),ou=P.createFramebuffer();this.copyTextureToTexture=function(S,U,z=null,k=null,F=0,Q=null){Q===null&&(F!==0?(wi("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Q=F,F=0):Q=0);let ce,pe,he,Re,De,Ee,Ge,Qe,ut;const ot=S.isCompressedTexture?S.mipmaps[Q]:S.image;if(z!==null)ce=z.max.x-z.min.x,pe=z.max.y-z.min.y,he=z.isBox3?z.max.z-z.min.z:1,Re=z.min.x,De=z.min.y,Ee=z.isBox3?z.min.z:0;else{const zt=Math.pow(2,-F);ce=Math.floor(ot.width*zt),pe=Math.floor(ot.height*zt),S.isDataArrayTexture?he=ot.depth:S.isData3DTexture?he=Math.floor(ot.depth*zt):he=1,Re=0,De=0,Ee=0}k!==null?(Ge=k.x,Qe=k.y,ut=k.z):(Ge=0,Qe=0,ut=0);const it=Se.convert(U.format),we=Se.convert(U.type);let lt;U.isData3DTexture?(Oe.setTexture3D(U,0),lt=P.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(Oe.setTexture2DArray(U,0),lt=P.TEXTURE_2D_ARRAY):(Oe.setTexture2D(U,0),lt=P.TEXTURE_2D),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,U.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,U.unpackAlignment);const qe=P.getParameter(P.UNPACK_ROW_LENGTH),It=P.getParameter(P.UNPACK_IMAGE_HEIGHT),ni=P.getParameter(P.UNPACK_SKIP_PIXELS),Ut=P.getParameter(P.UNPACK_SKIP_ROWS),Oi=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,ot.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,ot.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Re),P.pixelStorei(P.UNPACK_SKIP_ROWS,De),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Ee);const ct=S.isDataArrayTexture||S.isData3DTexture,Bt=U.isDataArrayTexture||U.isData3DTexture;if(S.isDepthTexture){const zt=de.get(S),Et=de.get(U),Rt=de.get(zt.__renderTarget),os=de.get(Et.__renderTarget);_e.bindFramebuffer(P.READ_FRAMEBUFFER,Rt.__webglFramebuffer),_e.bindFramebuffer(P.DRAW_FRAMEBUFFER,os.__webglFramebuffer);for(let Bn=0;Bn<he;Bn++)ct&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,de.get(S).__webglTexture,F,Ee+Bn),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,de.get(U).__webglTexture,Q,ut+Bn)),P.blitFramebuffer(Re,De,ce,pe,Ge,Qe,ce,pe,P.DEPTH_BUFFER_BIT,P.NEAREST);_e.bindFramebuffer(P.READ_FRAMEBUFFER,null),_e.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(F!==0||S.isRenderTargetTexture||de.has(S)){const zt=de.get(S),Et=de.get(U);_e.bindFramebuffer(P.READ_FRAMEBUFFER,su),_e.bindFramebuffer(P.DRAW_FRAMEBUFFER,ou);for(let Rt=0;Rt<he;Rt++)ct?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,zt.__webglTexture,F,Ee+Rt):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,zt.__webglTexture,F),Bt?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,Et.__webglTexture,Q,ut+Rt):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,Et.__webglTexture,Q),F!==0?P.blitFramebuffer(Re,De,ce,pe,Ge,Qe,ce,pe,P.COLOR_BUFFER_BIT,P.NEAREST):Bt?P.copyTexSubImage3D(lt,Q,Ge,Qe,ut+Rt,Re,De,ce,pe):P.copyTexSubImage2D(lt,Q,Ge,Qe,Re,De,ce,pe);_e.bindFramebuffer(P.READ_FRAMEBUFFER,null),_e.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else Bt?S.isDataTexture||S.isData3DTexture?P.texSubImage3D(lt,Q,Ge,Qe,ut,ce,pe,he,it,we,ot.data):U.isCompressedArrayTexture?P.compressedTexSubImage3D(lt,Q,Ge,Qe,ut,ce,pe,he,it,ot.data):P.texSubImage3D(lt,Q,Ge,Qe,ut,ce,pe,he,it,we,ot):S.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,Q,Ge,Qe,ce,pe,it,we,ot.data):S.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,Q,Ge,Qe,ot.width,ot.height,it,ot.data):P.texSubImage2D(P.TEXTURE_2D,Q,Ge,Qe,ce,pe,it,we,ot);P.pixelStorei(P.UNPACK_ROW_LENGTH,qe),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,It),P.pixelStorei(P.UNPACK_SKIP_PIXELS,ni),P.pixelStorei(P.UNPACK_SKIP_ROWS,Ut),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Oi),Q===0&&U.generateMipmaps&&P.generateMipmap(lt),_e.unbindTexture()},this.copyTextureToTexture3D=function(S,U,z=null,k=null,F=0){return wi('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(S,U,z,k,F)},this.initRenderTarget=function(S){de.get(S).__webglFramebuffer===void 0&&Oe.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?Oe.setTextureCube(S,0):S.isData3DTexture?Oe.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?Oe.setTexture2DArray(S,0):Oe.setTexture2D(S,0),_e.unbindTexture()},this.resetState=function(){T=0,C=0,D=null,_e.reset(),le.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return nn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Ye._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ye._getUnpackColorSpace()}}function Vc(n,e){let t=-1/0;for(let i=0;i<n.values.length;i+=1){const r=n.values[i];r>t&&(t=r)}return t*e.elevationScale}function lr(n,e){const t=(n.cols-1)*n.cellSizeMeters/2,i=(n.rows-1)*n.cellSizeMeters/2,r=Vc(n,e);return{x:t,y:r/2,z:i}}function Gc(n,e){const t=lr(n,e),i=n.cols*n.cellSizeMeters,r=n.rows*n.cellSizeMeters,s=Math.sqrt(i*i+r*r),o=Vc(n,e),{radiusFactor:a,heightFactor:l,elevationLiftFactor:c}=e.cameraState.overview,d=s*a,u=Math.PI/18,h=d*Math.cos(u),p=d*Math.sin(u);return{x:t.x+h,y:o*c+s*l,z:t.z+p}}function D_(n,e){let t=-1/0;for(let i=0;i<n.values.length;i+=1){const r=n.values[i];r>t&&(t=r)}return t*e.elevationScale}function L_(n,e,t,i,r=1){const s=lr(n,e),o=n.cols*n.cellSizeMeters,a=n.rows*n.cellSizeMeters,l=Math.sqrt(o*o+a*a),c=D_(n,e),d=t.holdDriftStartRadiusFactor??t.radiusFactor,u=t.holdDriftStartHeightFactor??t.heightFactor,h=Eu(r),p=h===1?t.radiusFactor:d+(t.radiusFactor-d)*h,g=h===1?t.heightFactor:u+(t.heightFactor-u)*h,_=l*p,m=Math.PI/18,f=t.holdDriftStartAzimuthDegrees!==void 0?t.holdDriftStartAzimuthDegrees*Math.PI/180:m,b=h===1?m:f+(m-f)*h,E={x:s.x+_*Math.cos(b),y:c*1.5+l*g,z:s.z+_*Math.sin(b)};return yu(E,s,i*Math.PI/180)}function Vs(n,e,t,i,r,s){const o=jn(e,i,n),a=n===0||n===1?0:Math.sin(n*Math.PI)*s;return o.y+=a,{position:o,target:jn(t,r,n)}}const Wc=1e-12;function yi(n,e,t,i,r){const s=i-t;return Math.abs(s)<=Wc?r<=t?n:e:(i-r)/s*n+(r-t)/s*e}function Gs(n,e,t,i,r,s,o,a,l){const c=yi(n,e,r,s,l),d=yi(e,t,s,o,l),u=yi(t,i,o,a,l),h=yi(c,d,r,o,l),p=yi(d,u,s,a,l);return yi(h,p,s,o,l)}function I_(n,e,t,i,r,s,o,a,l){if(l===0)return{...e};if(l===1)return{...t};const c=s+(o-s)*l;return{x:Gs(n.x,e.x,t.x,i.x,r,s,o,a,c),y:Gs(n.y,e.y,t.y,i.y,r,s,o,a,c),z:Gs(n.z,e.z,t.z,i.z,r,s,o,a,c)}}function Xc(n,e,t){const i=Math.min(n.length,e.length);if(i<=1)return e[0]??{x:0,y:0,z:0};const r=i-1,s=Math.min(n[r],Math.max(n[0],t));let o=i-2;if(s!==n[r]){for(let E=0;E<i-1;E+=1)if(s<=n[E+1]){o=E;break}}const a=n[o],l=n[o+1]-a,c=Math.abs(l)<=Wc?0:(s-a)/l,d=e.length-1,u=e[Math.max(0,o-1)],h=e[o],p=e[o+1],g=e[Math.min(d,o+2)],_=a,m=n[o+1],f=o===0?_-(m-_):n[o-1],b=o+2>=i?m+(m-_):n[o+2];return I_(u,h,p,g,f,_,m,b,c)}const U_={x:0,y:0,z:1},N_={x:1,y:0,z:0};function Dn(n,e,t){return lu(n,e,t)}function F_(n,e,t,i){const r=Dn(n,e,t-i),s=Dn(n,e,t+i);return Ko(oc(s,r),U_)}function bl(n,e,t,i){return F_(n,e,t,i)}function O_(n){return Ko({x:n.z,y:0,z:-n.x},N_)}const B_=.4,z_=.3,H_=.78;function qc(n,e,t,i,r){const s=[],o=[];for(const a of r.keyPoses){const l=Dn(t,i,a.progress),c=a.anchorReferenceProgress??a.progress,d=Dn(t,i,c),u=a.headingReferenceProgress??a.progress,h=bl(t,i,u,a.headingWindowProgress),p=O_(h);s.push({x:d.x-h.x*a.behindMeters+p.x*a.lateralOffsetMeters,y:d.y+a.heightMeters,z:d.z-h.z*a.behindMeters+p.z*a.lateralOffsetMeters});const g=Math.min(1,a.progress+a.lookAheadProgress),_=Dn(t,i,g),m=$o(oc(_,l)),f=bl(t,i,a.progress,a.headingWindowProgress),b=$i(l,Ki(f,m)),E=jn(b,_,B_),v=jn(l,E,z_);let R;a.landmarkPoiId==="yakuoin"?R=Dn(n,e,H_):a.landmarkPoiId==="summit"&&(R=n[n.length-1]);const T=a.landmarkWeight>0&&R?jn(v,R,a.landmarkWeight):v;o.push($i(T,{x:0,y:a.targetLiftMeters,z:0}))}return{keyProgressValues:r.keyPoses.map(a=>a.progress),positionKeys:s,targetKeys:o}}function k_(n,e){return Xc(n.keyProgressValues,n.positionKeys,e)}function V_(n,e){return Xc(n.keyProgressValues,n.targetKeys,e)}const G_=Ko({x:1,y:0,z:1}),Yc={x:0,y:1,z:0};function W_(n,e,t){const i=$o({x:e.cols*e.cellSizeMeters,y:0,z:e.rows*e.cellSizeMeters}),r=Ki(G_,i*t.radiusFactor),s=Ki(Yc,i*t.heightFactor);return $i(n,$i(r,s))}function X_(n,e){return $i(n,Ki(Yc,e))}function q_(n,e){return{position:Gc(n,e),target:lr(n,e)}}function Ws(n,e,t,i,r=1){return{position:L_(n,e,t.highOverview,i,r),target:lr(n,e)}}function Xs(n,e){return{position:k_(n,e),target:V_(n,e)}}function Y_(n,e,t){const r=Math.hypot(e.cols*e.cellSizeMeters,e.rows*e.cellSizeMeters)*.006;return{position:W_(n,e,t.summit),target:X_(n,r)}}function Al(n,e,t){return{position:jn(n.position,e.position,t),target:jn(n.target,e.target,t)}}function $_(n){const{phase:e,grid:t,settings:i,worldRoutePoints:r,cumulativeDistances:s,routeGuidancePoints:o=r,routeGuidanceCumulativeDistances:a=s,cameraRail:l,cameraState:c}=n,d=l??qc(r,s,o,a,c.rail),u=q_(t,i);if(e.kind==="high-overview-hold")return Ws(t,i,c,e.t*c.highOverview.orbitDegrees,e.t);if(e.kind==="descend-to-overview"){const g=Ws(t,i,c,c.highOverview.orbitDegrees,1);return Al(g,u,e.t)}if(e.kind==="overview")return u;if(e.kind==="transition-in"){const g=Xs(d,0);return Vs(e.t,u.position,u.target,g.position,g.target,c.timeline.arcLiftMeters)}if(e.kind==="route-follow")return Xs(d,e.progress);const h=r[r.length-1],p=Y_(h,t,c);if(e.kind==="transition-to-summit"){const g=Xs(d,1);return Vs(e.t,g.position,g.target,p.position,p.target,c.timeline.arcLiftMeters)}if(e.kind==="summit-hold")return p;if(e.kind==="ascend-to-high-overview"){const g=Ws(t,i,c,0,0);return Al(u,g,e.t)}return Vs(e.t,p.position,p.target,u.position,u.target,c.timeline.arcLiftMeters)}const wl={approachMs:450,dwellMs:950,departMs:450},K_={kiyotaki:"secondary",takaosanguchi_kasumidai:"secondary",joshinmon:"secondary",otokozaka_onnazaka:"primary",yakuoin:"primary",summit:"primary"},qs={primary:wl,secondary:wl},bi={markerScalePeak:1.15,labelEmphasisScale:1.12,otherSpotDimOpacity:.65,ringPulsePeriodMs:700,ringPulseAmplitude:.25},$c=100,hn={poiId:"summit",tier:"primary"};function Qr(n){return{poiId:n.poiId,tier:n.tier,phase:"idle",intensity:0,isActive:!1}}function Z_(n,e,t,i){if(!Number.isFinite(n)||!Number.isFinite(e.progressAt)||!Number.isFinite(i)||i<=0)return Qr(e);const r=Math.max(0,t.approachMs)/i,s=Math.max(0,t.dwellMs)/i/2,o=Math.max(0,t.departMs)/i,a=Math.min(s,$c/i/2),l=n-e.progressAt;return Math.abs(l)<=a?{poiId:e.poiId,tier:e.tier,phase:"arrive",intensity:1,isActive:!0}:Math.abs(l)<=s?{poiId:e.poiId,tier:e.tier,phase:"dwell",intensity:1,isActive:!0}:r>0&&l>-s-r&&l<-s?{poiId:e.poiId,tier:e.tier,phase:"approach",intensity:(l+s+r)/r,isActive:!0}:o>0&&l>s&&l<s+o?{poiId:e.poiId,tier:e.tier,phase:"depart",intensity:1-(l-s)/o,isActive:!0}:Qr(e)}function j_(n,e){const t=Qr(hn),i=n.phaseElapsedMs;if(!Number.isFinite(i)||i<0)return t;const r=h=>Number.isFinite(h)?Math.max(0,h):0;if(n.phaseKind==="transition-to-summit"){const h=r(n.transitionToSummitMs),p=Math.min(r(e.approachMs),h),g=h-p;return p<=0||i<=g||i>h?t:{poiId:hn.poiId,tier:hn.tier,phase:"approach",intensity:Math.min(1,Math.max(0,(i-g)/p)),isActive:!0}}if(n.phaseKind!=="summit-hold")return t;const s=r(n.summitHoldMs);if(s<=0||i>=s)return t;const o=Math.min($c,s),a=Math.min(r(e.departMs),Math.max(0,s-o)),l=Math.max(0,s-a),c=Math.min(r(e.dwellMs),l),d=l-c,u=c+d;return i<Math.min(o,u)?{poiId:hn.poiId,tier:hn.tier,phase:"arrive",intensity:1,isActive:!0}:i<u||a<=0?{poiId:hn.poiId,tier:hn.tier,phase:"dwell",intensity:1,isActive:!0}:{poiId:hn.poiId,tier:hn.tier,phase:"depart",intensity:Math.min(1,Math.max(0,(s-i)/a)),isActive:!0}}function J_(n,e,t,i){const r=e.map(o=>({...Z_(n,o,t[o.tier],i),isPrimaryActive:!1}));let s=-1;for(let o=0;o<r.length;o+=1){const a=r[o];if(!a.isActive)continue;const l=r[s];(s===-1||a.intensity>l.intensity||a.intensity===l.intensity&&a.tier==="primary"&&l.tier!=="primary")&&(s=o)}return s!==-1&&(r[s].isPrimaryActive=!0),r}function Rl(n){return n.map(e=>({...Qr(e),isPrimaryActive:!1}))}function Q_(n,e){return Object.entries(e).flatMap(([t,i])=>{const r=tc(n,t);return r===void 0?[]:[{poiId:t,progressAt:r,tier:i}]})}const Cl=[[35.631103,139.266899],[35.63185,139.266792],[35.632022,139.266329],[35.632152,139.266098],[35.63228,139.265876],[35.632463,139.265638],[35.632559,139.265425],[35.632645,139.265185],[35.632749,139.264973],[35.632773,139.264868],[35.632869,139.26462],[35.633004,139.264275],[35.633061,139.263989],[35.63314,139.263809],[35.633241,139.263569],[35.633263,139.263517],[35.633311,139.263329],[35.633292,139.263207],[35.633358,139.262941],[35.633437,139.262741],[35.633527,139.262524],[35.633591,139.262366],[35.633645,139.262258],[35.633719,139.262118],[35.633773,139.261967],[35.633905,139.261742],[35.634119,139.261477],[35.63426,139.261216],[35.634284,139.261085],[35.634339,139.26095],[35.634411,139.260803],[35.634447,139.260722],[35.634488,139.260625],[35.634495,139.260547],[35.634504,139.26041],[35.634492,139.260298],[35.634454,139.260195],[35.634366,139.260074],[35.634363,139.26004],[35.634389,139.26003],[35.63442,139.260053],[35.634467,139.260082],[35.634523,139.260163],[35.63457,139.260222],[35.634623,139.260298],[35.634683,139.260367],[35.63473,139.260478],[35.634796,139.260631],[35.63483,139.260833],[35.634886,139.261004],[35.634917,139.261092],[35.634929,139.26114],[35.634944,139.261223],[35.634954,139.261234],[35.634962,139.26124],[35.634971,139.261247],[35.635013,139.261206],[35.635035,139.261157],[35.635057,139.261042],[35.635091,139.260853],[35.63511,139.260702],[35.635115,139.260376],[35.635119,139.26029],[35.635115,139.260242],[35.635102,139.260172],[35.635094,139.260118],[35.635093,139.260096],[35.635102,139.26008],[35.635118,139.260092],[35.635132,139.260122],[35.635173,139.260202],[35.635223,139.26028],[35.635315,139.260386],[35.635363,139.260443],[35.635404,139.260497],[35.635424,139.260521],[35.635444,139.260525],[35.635456,139.260504],[35.635448,139.260478],[35.635414,139.260361],[35.635379,139.260224],[35.635352,139.260103],[35.635305,139.259942],[35.635262,139.259775],[35.635226,139.259629],[35.635173,139.259484],[35.635086,139.259276],[35.635053,139.259199],[35.634991,139.259098],[35.634936,139.258957],[35.634864,139.258813],[35.634784,139.258655],[35.634721,139.258513],[35.634681,139.258421],[35.63462,139.258125],[35.634602,139.258038],[35.634554,139.257836],[35.634469,139.257569],[35.634443,139.257503],[35.634422,139.257444],[35.634401,139.257416],[35.634342,139.257316],[35.634301,139.257257],[35.634247,139.257193],[35.634146,139.257078],[35.634118,139.257054],[35.63408,139.257022],[35.634,139.256992],[35.633918,139.257003],[35.633838,139.257049],[35.633751,139.257092],[35.633468,139.257248],[35.633342,139.257308],[35.633234,139.257305],[35.633151,139.25728],[35.633039,139.257281],[35.632918,139.257284],[35.632759,139.257293],[35.632602,139.257318],[35.632539,139.257348],[35.632488,139.257401],[35.632403,139.257442],[35.632324,139.257451],[35.632243,139.257453],[35.632211,139.257425],[35.632175,139.257388],[35.632151,139.257351],[35.632122,139.257316],[35.632043,139.257216],[35.63201,139.25716],[35.631952,139.257046],[35.631837,139.256877],[35.631797,139.256807],[35.631758,139.256742],[35.631708,139.256685],[35.631628,139.256613],[35.631511,139.256537],[35.631419,139.256528],[35.631221,139.25652],[35.631172,139.256501],[35.630898,139.256432],[35.630687,139.256376],[35.630548,139.256301],[35.630458,139.256194],[35.630392,139.25596],[35.63036,139.255635],[35.630281,139.25535],[35.630197,139.255086],[35.630192,139.254986],[35.630191,139.254831],[35.630209,139.254657],[35.630245,139.254493],[35.63021,139.254369],[35.630058,139.254309],[35.629995,139.25419],[35.629984,139.254055],[35.62998,139.253705],[35.629963,139.253466],[35.62994,139.253286],[35.629925,139.25323],[35.629911,139.253213],[35.629887,139.25317],[35.629865,139.253133],[35.629791,139.253037],[35.629633,139.252809],[35.629473,139.252566],[35.629218,139.252171],[35.629061,139.251908],[35.628897,139.251583],[35.628849,139.251521],[35.62883,139.251433],[35.628867,139.251128],[35.628848,139.251002],[35.628673,139.250853],[35.628147,139.250682],[35.628048,139.250598],[35.62796,139.250377],[35.627818,139.250301],[35.627602,139.250285],[35.627533,139.250218],[35.627381,139.250151],[35.627197,139.250056],[35.626891,139.250101],[35.626535,139.250142],[35.626307,139.250388],[35.626261,139.250511],[35.626244,139.250709],[35.626149,139.250919],[35.626093,139.251019],[35.625966,139.25099],[35.625783,139.250886],[35.625706,139.250795],[35.625687,139.250688],[35.625627,139.25055],[35.625585,139.250297],[35.625676,139.250289],[35.62575,139.250045],[35.625759,139.250042],[35.625745,139.250002],[35.625912,139.24994],[35.625931,139.249932],[35.626087,139.24987],[35.626106,139.24971],[35.626096,139.249731],[35.626087,139.24987],[35.626142,139.249976],[35.626456,139.249816],[35.626539,139.24981],[35.626458,139.249623],[35.626443,139.249633],[35.62639,139.249543],[35.626373,139.249508],[35.626344,139.249395],[35.626405,139.249369],[35.626354,139.249168],[35.626338,139.249104],[35.626307,139.249008],[35.626277,139.248986],[35.626205,139.248967],[35.626186,139.248919],[35.626187,139.248858],[35.626219,139.24861],[35.626195,139.24843],[35.626116,139.24828],[35.625914,139.247816],[35.625918,139.247714],[35.625928,139.247496],[35.626004,139.247186],[35.626155,139.247021],[35.626181,139.246913],[35.626358,139.246479],[35.626412,139.246263],[35.626236,139.246081],[35.626192,139.245889],[35.625912,139.245635],[35.625847,139.245495],[35.625773,139.245311],[35.625797,139.245169],[35.625803,139.24499],[35.625782,139.244929],[35.625765,139.244693],[35.625654,139.244438],[35.625612,139.24436],[35.62556,139.244319],[35.625409,139.244107],[35.625368,139.244071],[35.625178,139.243793],[35.625172,139.243724],[35.625055,139.243664],[35.624944,139.243481],[35.624933,139.243471],[35.624821,139.243362],[35.624736,139.243293],[35.624723,139.243284],[35.624654,139.243198],[35.625227,139.243688]],e0=140,t0=161,n0=170,i0=205,Ir=(()=>{
  try {
    const _sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const _rk = _sp ? (_sp.get('route') || 'route_1') : 'route_1';
    const _ro = typeof window !== 'undefined' && window.__ALL_ROUTES_3D && window.__ALL_ROUTES_3D[_rk];
    if (_ro && _rk !== 'route_1') {
      return {
        isOfficial: true,
        source: "OpenStreetMap Mt. Takao Hiking Routes",
        sourceType: "community-mapped",
        retrievedDate: "2026-09-21",
        license: "ODbL",
        attributionText: "© OpenStreetMap contributors",
        points: _ro.points
      };
    }
  } catch(e) {}
  return {
    isOfficial: !1,
    source: "OpenStreetMap relation 1216428",
    sourceType: "community-mapped",
    retrievedDate: "2026-08-16",
    license: "ODbL",
    attributionText: "© OpenStreetMap contributors",
    points: Cl.map(([n,e],t)=>t===0?{lat:n,lng:e,label:"清滝駅",poiId:"kiyotaki"}:t===e0?{lat:n,lng:e,label:"高尾山駅・霞台",poiId:"takaosanguchi_kasumidai"}:t===t0?{lat:n,lng:e,label:"浄心門",poiId:"joshinmon"}:t===n0?{lat:n,lng:e,label:"男坂・女坂分岐",poiId:"otokozaka_onnazaka"}:t===i0?{lat:n,lng:e,label:"薬王院",poiId:"yakuoin"}:t===Cl.length-1?{lat:n,lng:e,label:"高尾山頂",poiId:"summit"}:{lat:n,lng:e})
  };
})();function r0(n,e,t){return{position:{...e},visible:t.enabled&&Number.isFinite(n)&&n>0&&n<1}}function s0(n,e,t,i){const r=e[e.length-1],s=i.enabled&&Number.isFinite(t)&&t>0&&t<1&&Number.isFinite(r)&&r>0;return Array.from({length:i.directionCue.dashCount},(o,a)=>{if(!s)return{visible:!1};const l=(a+1)*i.directionCue.spacingMeters,c=t+l/r;return c>1?{visible:!1}:{position:Dn(n,e,c),visible:!0}})}function o0(n,e,t){const{minOpacity:i,maxOpacity:r,phaseStep:s,pulsePeriodMs:o}=t.directionCue,l=((n/o-e*s)%1+1)%1,c=.5-.5*Math.cos(l*Math.PI*2);return i+(r-i)*c}function a0(n){const{scene:e,config:t}=n,i=new _n;i.name="route-head-marker",i.visible=!1;const r=new _n;r.name="route-direction-cue";const s=new Jn(t.radiusMeters,20,12),o=new Jn(t.glowRadiusMeters,20,12),a=new gn({color:t.color,depthTest:!0,depthWrite:!1}),l=new gn({color:t.color,transparent:!0,opacity:t.glowOpacity,depthTest:!0,depthWrite:!1,blending:Ci}),c=new ft(o,l);c.name="route-head-glow",c.renderOrder=1;const d=new ft(s,a);d.name="route-head-core",d.renderOrder=2,i.add(c,d);const u=new Jn(t.directionCue.radiusMeters,12,8),h=Array.from({length:t.directionCue.dashCount},()=>new gn({color:t.color,transparent:!0,opacity:t.directionCue.minOpacity,depthTest:!0,depthWrite:!1})),p=h.map((g,_)=>{const m=new ft(u,g);return m.name=`route-direction-dash-${_+1}`,m.renderOrder=1,m.visible=!1,r.add(m),m});return e.add(i,r),{object3D:i,directionCueObject3D:r,updatePosition(g,_){i.position.set(g.x,g.y,g.z),i.visible=t.enabled&&_},updateDirectionDashes(g,_){p.forEach((m,f)=>{const b=g[f];m.visible=t.enabled&&b?.visible===!0&&b.position!==void 0,m.visible&&b.position&&m.position.set(b.position.x,b.position.y,b.position.z),h[f].opacity=o0(_,f,t)})},dispose(){e.remove(i,r),s.dispose(),o.dispose(),u.dispose(),a.dispose(),l.dispose(),h.forEach(g=>g.dispose())}}}const Pl=2**23,l0=2**24,Dl=.01;function c0(n,e,t){const i=n*65536+e*256+t;return i<Pl?i*Dl:i===Pl?null:(i-l0)*Dl}function Zn(n,e){return n*e}function qr(n,e){const{north:t,south:i,east:r,west:s}=e.bounds,o=Math.max(0,Math.min(e.cols-1,(n.lng-s)/(r-s)*(e.cols-1))),a=Math.max(0,Math.min(e.rows-1,(t-n.lat)/(t-i)*(e.rows-1)));return{col:o,row:a}}function Kc(n,e,t){const i=Math.min(Math.max(e,0),n.cols-1),r=Math.min(Math.max(t,0),n.rows-1),s=Math.floor(i),o=Math.floor(r),a=Math.min(s+1,n.cols-1),l=Math.min(o+1,n.rows-1),c=i-s,d=r-o,u=n.values[o*n.cols+s],h=n.values[o*n.cols+a],p=n.values[l*n.cols+s],g=n.values[l*n.cols+a],_=u*(1-c)+h*c,m=p*(1-c)+g*c;return _*(1-d)+m*d}function u0(n,e,t,i,r){const s=[];for(let o=0;o<n.points.length-1;o+=1){const a=n.points[o],l=n.points[o+1],{col:c,row:d}=qr(a,e),{col:u,row:h}=qr(l,e),p=Math.hypot((u-c)*e.cellSizeMeters,(h-d)*e.cellSizeMeters),g=Math.max(1,Math.ceil(p/r));for(let _=o===0?0:1;_<=g;_+=1){const m=_/g,f=a.lat+(l.lat-a.lat)*m,b=a.lng+(l.lng-a.lng)*m,{col:E,row:v}=qr({lat:f,lng:b},e),R=Kc(e,E,v);s.push({x:E*e.cellSizeMeters,y:Zn(R,t.elevationScale)+i,z:v*e.cellSizeMeters})}}return s}function d0(n,e,t){return{x:n.x+(e.x-n.x)*t,y:n.y+(e.y-n.y)*t,z:n.z+(e.z-n.z)*t}}function h0(n,e,t){if(n.length<=1)return n;const i=e[e.length-1],r=[n[0]];let s=1;for(let o=t;o<i;o+=t){for(;s<e.length-1&&e[s]<o;)s+=1;const a=s-1,l=e[a],c=e[s]-l,d=c===0?0:(o-l)/c;r.push(d0(n[a],n[s],d))}return r.push(n[n.length-1]),r}function f0(n,e,t,i){return n.length<=1?n:n.map((r,s)=>{if(s===0||s===n.length-1)return r;const o=e[s],a=o-t,l=o+t,c=Number.EPSILON*Math.max(1,e[e.length-1])*16;let d=0,u=0,h=0,p=0;for(let v=0;v<n.length;v+=1){const R=e[v];if(R<a-c||R>l+c)continue;const T=n[v];d+=T.x,u+=T.y,h+=T.z,p+=1}const g={x:d/p,y:u/p,z:h/p},_=g.x-r.x,m=g.y-r.y,f=g.z-r.z,b=Math.hypot(_,m,f);if(b<=i||b===0)return g;const E=i/b;return{x:r.x+_*E,y:r.y+m*E,z:r.z+f*E}})}function p0(n,e,t){const i=h0(n,e,t.resampleSpacingMeters),r=$r(i),s=f0(i,r,t.smoothingWindowRadiusMeters,t.maxDeviationMeters);return{points:s,cumulativeDistances:$r(s)}}const Ll=new Fn,Ur=new I;class Zc extends kh{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new dt(e,3)),this.setAttribute("uv",new dt(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,i=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),i.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const i=new Go(t,6,1);return this.setAttribute("instanceStart",new Pn(i,3,0)),this.setAttribute("instanceEnd",new Pn(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const i=new Go(t,6,1);return this.setAttribute("instanceColorStart",new Pn(i,3,0)),this.setAttribute("instanceColorEnd",new Pn(i,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new Ph(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Fn);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Ll.setFromBufferAttribute(t),this.boundingBox.union(Ll))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new sr),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const i=this.boundingSphere.center;this.boundingBox.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)Ur.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Ur)),Ur.fromBufferAttribute(t,s),r=Math.max(r,i.distanceToSquared(Ur));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}}se.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new We(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};Ct.line={uniforms:aa.merge([se.common,se.fog,se.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class es extends Mn{constructor(e){super({type:"LineMaterial",uniforms:aa.clone(Ct.line.uniforms),vertexShader:Ct.line.vertexShader,fragmentShader:Ct.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const Ys=new tt,Il=new I,Ul=new I,vt=new tt,xt=new tt,Qt=new tt,$s=new I,Ks=new at,Mt=new qh,Nl=new I,Nr=new Fn,Fr=new sr,en=new tt;let tn,Qn;function Fl(n,e,t){return en.set(0,0,-e,1).applyMatrix4(n.projectionMatrix),en.multiplyScalar(1/en.w),en.x=Qn/t.width,en.y=Qn/t.height,en.applyMatrix4(n.projectionMatrixInverse),en.multiplyScalar(1/en.w),Math.abs(Math.max(en.x,en.y))}function m0(n,e){const t=n.matrixWorld,i=n.geometry,r=i.attributes.instanceStart,s=i.attributes.instanceEnd,o=Math.min(i.instanceCount,r.count);for(let a=0,l=o;a<l;a++){Mt.start.fromBufferAttribute(r,a),Mt.end.fromBufferAttribute(s,a),Mt.applyMatrix4(t);const c=new I,d=new I;tn.distanceSqToSegment(Mt.start,Mt.end,d,c),d.distanceTo(c)<Qn*.5&&e.push({point:d,pointOnLine:c,distance:tn.origin.distanceTo(d),object:n,face:null,faceIndex:a,uv:null,uv1:null})}}function g0(n,e,t){const i=e.projectionMatrix,s=n.material.resolution,o=n.matrixWorld,a=n.geometry,l=a.attributes.instanceStart,c=a.attributes.instanceEnd,d=Math.min(a.instanceCount,l.count),u=-e.near;tn.at(1,Qt),Qt.w=1,Qt.applyMatrix4(e.matrixWorldInverse),Qt.applyMatrix4(i),Qt.multiplyScalar(1/Qt.w),Qt.x*=s.x/2,Qt.y*=s.y/2,Qt.z=0,$s.copy(Qt),Ks.multiplyMatrices(e.matrixWorldInverse,o);for(let h=0,p=d;h<p;h++){if(vt.fromBufferAttribute(l,h),xt.fromBufferAttribute(c,h),vt.w=1,xt.w=1,vt.applyMatrix4(Ks),xt.applyMatrix4(Ks),vt.z>u&&xt.z>u)continue;if(vt.z>u){const E=vt.z-xt.z,v=(vt.z-u)/E;vt.lerp(xt,v)}else if(xt.z>u){const E=xt.z-vt.z,v=(xt.z-u)/E;xt.lerp(vt,v)}vt.applyMatrix4(i),xt.applyMatrix4(i),vt.multiplyScalar(1/vt.w),xt.multiplyScalar(1/xt.w),vt.x*=s.x/2,vt.y*=s.y/2,xt.x*=s.x/2,xt.y*=s.y/2,Mt.start.copy(vt),Mt.start.z=0,Mt.end.copy(xt),Mt.end.z=0;const _=Mt.closestPointToPointParameter($s,!0);Mt.at(_,Nl);const m=jr.lerp(vt.z,xt.z,_),f=m>=-1&&m<=1,b=$s.distanceTo(Nl)<Qn*.5;if(f&&b){Mt.start.fromBufferAttribute(l,h),Mt.end.fromBufferAttribute(c,h),Mt.start.applyMatrix4(o),Mt.end.applyMatrix4(o);const E=new I,v=new I;tn.distanceSqToSegment(Mt.start,Mt.end,v,E),t.push({point:v,pointOnLine:E,distance:tn.origin.distanceTo(v),object:n,face:null,faceIndex:h,uv:null,uv1:null})}}}class _0 extends ft{constructor(e=new Zc,t=new es({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,i=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let o=0,a=0,l=t.count;o<l;o++,a+=2)Il.fromBufferAttribute(t,o),Ul.fromBufferAttribute(i,o),r[a]=a===0?0:r[a-1],r[a+1]=r[a]+Il.distanceTo(Ul);const s=new Go(r,2,1);return e.setAttribute("instanceDistanceStart",new Pn(s,1,0)),e.setAttribute("instanceDistanceEnd",new Pn(s,1,1)),this}raycast(e,t){const i=this.material.worldUnits,r=e.camera;r===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const s=e.params.Line2!==void 0&&e.params.Line2.threshold||0;tn=e.ray;const o=this.matrixWorld,a=this.geometry,l=this.material;Qn=l.linewidth+s,a.boundingSphere===null&&a.computeBoundingSphere(),Fr.copy(a.boundingSphere).applyMatrix4(o);let c;if(i)c=Qn*.5;else{const u=Math.max(r.near,Fr.distanceToPoint(tn.origin));c=Fl(r,u,l.resolution)}if(Fr.radius+=c,tn.intersectsSphere(Fr)===!1)return;a.boundingBox===null&&a.computeBoundingBox(),Nr.copy(a.boundingBox).applyMatrix4(o);let d;if(i)d=Qn*.5;else{const u=Math.max(r.near,Nr.distanceToPoint(tn.origin));d=Fl(r,u,l.resolution)}Nr.expandByScalar(d),tn.intersectsBox(Nr)!==!1&&(i?m0(this,t):g0(this,r,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(Ys),this.material.uniforms.resolution.value.set(Ys.z,Ys.w))}}class qo extends Zc{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,i=new Float32Array(2*t);for(let r=0;r<t;r+=3)i[2*r]=e[r],i[2*r+1]=e[r+1],i[2*r+2]=e[r+2],i[2*r+3]=e[r+3],i[2*r+4]=e[r+4],i[2*r+5]=e[r+5];return super.setPositions(i),this}setColors(e){const t=e.length-3,i=new Float32Array(2*t);for(let r=0;r<t;r+=3)i[2*r]=e[r],i[2*r+1]=e[r+1],i[2*r+2]=e[r+2],i[2*r+3]=e[r+3],i[2*r+4]=e[r+4],i[2*r+5]=e[r+5];return super.setColors(i),this}setFromPoints(e){const t=e.length-1,i=new Float32Array(6*t);for(let r=0;r<t;r++)i[6*r]=e[r].x,i[6*r+1]=e[r].y,i[6*r+2]=e[r].z||0,i[6*r+3]=e[r+1].x,i[6*r+4]=e[r+1].y,i[6*r+5]=e[r+1].z||0;return super.setPositions(i),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class Ol extends _0{constructor(e=new qo,t=new es({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}function v0(n){return[...[...n.haloLayers].sort((t,i)=>i.widthPx-t.widthPx).map(t=>({role:"halo",widthPx:t.widthPx,opacity:t.opacity,color:t.color})),{role:"core",widthPx:n.coreWidthPx,opacity:1,color:n.coreColor}]}function Bl(n){return n>=2}function x0(n,e){const t=new _n,i=Math.max(e.length-1,0),r=new qo;r.setFromPoints(e);const s=new es({worldUnits:!1,linewidth:n.baseLayer.widthPx,color:n.baseLayer.color,fog:!1,depthTest:!0,depthWrite:!1,transparent:!0,opacity:n.baseLayer.opacity}),o=new Ol(r,s);o.name="route-base",o.visible=Bl(e.length),t.add(o);const a=v0(n).map(l=>{const c=new qo;c.setFromPoints(e);const d=new es({worldUnits:!1,linewidth:l.widthPx,color:l.color,fog:!1,depthTest:!0,depthWrite:!1,transparent:l.role==="halo",opacity:l.role==="halo"?l.opacity:1,...l.role==="halo"?{blending:Ci}:{}}),u=new Ol(c,d);return u.name=`route-${l.role}`,u.visible=!1,t.add(u),{geometry:c,line:u}});return{object3D:t,updatePoints(l){const c=Bl(l.length);for(const{line:u}of a)u.visible=c;if(!c)return;const d=Math.min(l.length-1,i);for(const{geometry:u}of a){const p=u.getAttribute("instanceStart").data,g=p.array;for(let _=0;_<d;_+=1){const m=l[_],f=l[_+1],b=_*6;g[b]=m.x,g[b+1]=m.y,g[b+2]=m.z,g[b+3]=f.x,g[b+4]=f.y,g[b+5]=f.z}p.needsUpdate=!0,u.instanceCount=d}}}}const M0=1672,S0=941,y0="/3d-viewer/data/lite-background/takao-lite-bg-daylight.png",E0=[{x:640,y:870},{x:622,y:780},{x:595,y:690},{x:580,y:590},{x:615,y:495},{x:660,y:425},{x:697,y:332},{x:725,y:290},{x:760,y:240},{x:800,y:210},{x:850,y:205},{x:900,y:195},{x:940,y:183},{x:970,y:172}],T0=[{id:"kiyotaki-station",x:640,y:870,text:"清滝駅"},{id:"yakuoin",x:697,y:332,text:"薬王院"},{id:"takao-summit",x:970,y:172,text:"高尾山頂"}],b0="http://www.w3.org/2000/svg",Zs="#33E6FF",A0="#E8FCFF",w0="#E6EEF2",R0="0.28",zl="1",Hl="0.55",C0="0.42",P0="0.16";let D0=0;function Vt(n){return document.createElementNS(b0,n)}function js(n){n.setAttribute("fill","none"),n.setAttribute("stroke-linecap","round"),n.setAttribute("stroke-linejoin","round")}function At(n){return String(Number(n.toFixed(4)))}function L0(n){return n.length===0?"":n.map((e,t)=>`${t===0?"M":"L"} ${At(e.x)} ${At(e.y)}`).join(" ")}function I0(n,e,t){const i=document.createElement("div");i.className="lite-route-overlay",i.style.position="absolute",i.style.inset="0",i.style.width="100%",i.style.height="100%",i.style.overflow="hidden",i.style.pointerEvents="none",i.setAttribute("aria-hidden","true");const r=Vt("svg");r.setAttribute("data-lite-route-role","svg"),r.setAttribute("preserveAspectRatio","xMidYMid slice"),r.style.position="absolute",r.style.inset="0",r.style.width="100%",r.style.height="100%",r.style.pointerEvents="none";const s=Vt("defs"),o=Vt("filter"),a=`lite-route-glow-${D0++}`;o.setAttribute("id",a),o.setAttribute("x","-50%"),o.setAttribute("y","-50%"),o.setAttribute("width","200%"),o.setAttribute("height","200%"),o.setAttribute("color-interpolation-filters","sRGB");const l=Vt("feGaussianBlur");l.setAttribute("in","SourceGraphic"),l.setAttribute("stdDeviation","3.5"),l.setAttribute("result","blurred-source"),o.appendChild(l);const c=Vt("feMerge"),d=Vt("feMergeNode");d.setAttribute("in","blurred-source"),c.appendChild(d);const u=Vt("feMergeNode");u.setAttribute("in","SourceGraphic"),c.appendChild(u),o.appendChild(c),s.appendChild(o),r.appendChild(s);const h=Vt("path");h.setAttribute("data-lite-route-role","base-path"),h.setAttribute("stroke",w0),h.setAttribute("stroke-width","1.5"),h.setAttribute("opacity",R0),js(h),r.appendChild(h);const p=Vt("path");p.setAttribute("data-lite-route-role","glow-path"),p.setAttribute("stroke",Zs),p.setAttribute("stroke-width","8"),p.setAttribute("opacity",Hl),p.setAttribute("filter",`url(#${a})`),js(p),r.appendChild(p);const g=Vt("path");g.setAttribute("data-lite-route-role","active-path"),g.setAttribute("stroke",Zs),g.setAttribute("stroke-width","3.25"),g.setAttribute("opacity",zl),js(g),r.appendChild(g);const _=Vt("circle");_.setAttribute("data-lite-route-role","head"),_.setAttribute("r","4.5"),_.setAttribute("fill",A0),_.setAttribute("stroke",Zs),_.setAttribute("stroke-width","2"),_.setAttribute("filter",`url(#${a})`),_.style.display="none",r.appendChild(_);const m="http://www.w3.org/1999/xhtml",f=Vt("foreignObject");f.setAttribute("data-lite-route-role","labels-fo"),f.setAttribute("x","0"),f.setAttribute("y","0");const b=document.createElementNS(m,"div");b.className="lite-route-labels",b.setAttribute("data-lite-route-role","labels"),b.style.position="relative",b.style.width="100%",b.style.height="100%",b.style.pointerEvents="none",f.appendChild(b),r.appendChild(f),i.appendChild(r),n.appendChild(i);let E=[],v=[],R=0,T=0,C="active";function D(){const M=R*T,w=R-M,O=`${At(R)} ${At(R)}`,N=At(w);for(const X of[p,g])X.setAttribute("stroke-dasharray",O),X.setAttribute("stroke-dashoffset",N);const V=C==="subtle";if(g.setAttribute("opacity",V?C0:zl),p.setAttribute("opacity",V?P0:Hl),_.setAttribute("opacity",V?"0.55":"1"),R<=0||E.length<2||T<=0||T>=1){_.style.display="none";return}const q=M;for(let X=1;X<E.length;X+=1){const K=v[X];if(q>K)continue;const H=v[X-1],ne=K-H;if(ne<=0)continue;const oe=E[X-1],xe=E[X],Ie=(q-H)/ne;_.setAttribute("cx",At(oe.x+(xe.x-oe.x)*Ie)),_.setAttribute("cy",At(oe.y+(xe.y-oe.y)*Ie)),_.style.display="";return}_.style.display="none"}const y={root:i,setRoutePoints(M){E=M.map(({x:O,y:N})=>({x:O,y:N})),v=E.length===0?[]:[0],R=0;for(let O=1;O<E.length;O+=1){const N=E[O-1],V=E[O];R+=Math.hypot(V.x-N.x,V.y-N.y),v.push(R)}const w=L0(E);h.setAttribute("d",w),p.setAttribute("d",w),g.setAttribute("d",w),D()},setProgress(M,w){T=Number.isFinite(M)?Math.min(1,Math.max(0,M)):0,C=w,D()},setLabels(M){const w=M.map(O=>{const N=document.createElement("div");return N.className="lite-route-label",N.setAttribute("data-label-id",O.id),N.textContent=O.text,N.style.position="absolute",N.style.left=`${At(O.x)}px`,N.style.top=`${At(O.y)}px`,N.style.transform="translate(-50%, calc(-100% - 8px))",N.style.pointerEvents="none",N.style.backgroundColor="rgba(7, 14, 20, 0.68)",N.style.color="#f4fbfd",N.style.padding="4px 9px",N.style.border="1px solid rgba(216, 242, 247, 0.58)",N.style.borderRadius="4px",N.style.backdropFilter="blur(6px)",N.style.boxShadow="0 4px 14px rgba(0, 0, 0, 0.24)",N.style.fontFamily='system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',N.style.fontSize="12px",N.style.fontWeight="600",N.style.letterSpacing="0.04em",N.style.lineHeight="1.35",N.style.textShadow="0 1px 3px rgba(0, 0, 0, 0.8)",N.style.whiteSpace="nowrap",N});b.replaceChildren(...w)},resize(M,w){r.setAttribute("width",At(M)),r.setAttribute("height",At(w)),r.setAttribute("viewBox",`0 0 ${At(M)} ${At(w)}`),f.setAttribute("width",At(M)),f.setAttribute("height",At(w))},dispose(){i.remove(),E=[],v=[],R=0}};return y.resize(e,t),y.setRoutePoints([]),y}const pa=11e3,Yr=3e3,ts=8e3,U0=ts-Yr,N0=pa-ts,Js={scale:1,translateXPercent:0,translateYPercent:0};function F0(n){return!Number.isFinite(n)||n<0?0:n%pa}function O0(n){const e=F0(n);if(e<Yr)return{cut:"hero",cutElapsedMs:e,cutProgress:e/Yr,routeProgress:1,stageTransform:{...Js}};if(e<ts){const i=e-Yr,r=i/U0;return{cut:"ascent",cutElapsedMs:i,cutProgress:r,routeProgress:r,stageTransform:{...Js}}}const t=e-ts;return{cut:"crop",cutElapsedMs:t,cutProgress:t/N0,routeProgress:1,stageTransform:{...Js}}}const Gi={lat:35.6255,lng:139.2432},kl=1800,Vl=111320,B0=200;function jc(n,e,t){if(!Number.isInteger(n)||!Number.isInteger(e)||n<=0||e<=0)throw new RangeError("Synthetic DEM dimensions must be positive integers.");if(!Number.isFinite(t))throw new RangeError("Synthetic DEM peak elevation must be finite.");const i=(n-1)/2,r=(e-1)/2,s=Math.max(i,1),o=Math.max(r,1),a=n%2===0?.5/s:0,l=e%2===0?.5/o:0,c=a*a+l*l,d=Math.min(B0,t*.5),u=new Float32Array(n*e);for(let g=0;g<e;g+=1)for(let _=0;_<n;_+=1){const m=(_-i)/s,f=(g-r)/o,b=Math.max(0,m*m+f*f-c),E=d+(t-d)*Math.exp(-4*b);u[g*n+_]=E}const h=kl/Vl,p=kl/(Vl*Math.cos(Gi.lat*Math.PI/180));return{cols:n,rows:e,values:u,cellSizeMeters:6e3/Math.max(n,e),bounds:{north:Gi.lat+h,south:Gi.lat-h,east:Gi.lng+p,west:Gi.lng-p}}}const z0=100,H0=100,k0=599,V0=/\/(\d+)\/(\d+)\/(\d+)\.png(?:[?#].*)?$/,Gl=111320,Jc=150;function G0(n,e,t,i){const r=(n.north+n.south)/2,s=Gl*Math.cos(r*Math.PI/180),o=(n.east-n.west)*s,a=(n.north-n.south)*Gl,l=o/e,c=a/t;return(l+c)/2*i}function W0(n,e,t,i,r){if(i===1)return{cols:n,rows:e,values:t,cellSizeMeters:r};const s=Math.floor((n-1)/i)+1,o=Math.floor((e-1)/i)+1,a=new Float32Array(s*o);for(let l=0;l<o;l+=1){const c=l*i,d=Math.min(c+i,e);for(let u=0;u<s;u+=1){const h=u*i,p=Math.min(h+i,n);let g=0,_=0;for(let m=c;m<d;m+=1)for(let f=h;f<p;f+=1)g+=t[m*n+f],_+=1;a[l*s+u]=g/_}}return{cols:s,rows:o,values:a,cellSizeMeters:r}}function X0(n,e,t){if(!Number.isInteger(e)||!Number.isInteger(t)||e<=0||t<=0)throw new RangeError("DEM dimensions must be positive integers.");const i=e*t;if(n.length!==i*4)throw new RangeError("RGBA pixel length does not match the DEM dimensions.");const r=new Float32Array(i);for(let s=0;s<i;s+=1){const o=s*4,a=c0(n[o],n[o+1],n[o+2]);r[s]=a??0}return r}function q0(n){const e=V0.exec(n);if(!e)throw new Error(`DEM tile URL does not end in /{z}/{x}/{y}.png: ${n}`);return{zoom:Number(e[1]),x:Number(e[2]),y:Number(e[3])}}function Wl(n,e){const t=2**e,i=Math.PI*(1-2*n/t);return Math.atan(Math.sinh(i))*180/Math.PI}function Y0(n){const e=jc(z0,H0,k0),t=(e.bounds.north-e.bounds.south)/2,i=(e.bounds.east-e.bounds.west)/2;return{...e,bounds:{north:n.lat+t,south:n.lat-t,east:n.lng+i,west:n.lng-i}}}async function $0(n,e=Jc){if(n.length===0)throw new Error("At least one DEM tile URL is required.");const t=n.map(q0),i=t[0].zoom;if(t.some(s=>s.zoom!==i))throw new Error("All DEM tiles must use the same zoom level.");const r=[];try{for(let v=0;v<n.length;v+=1){const R=await fetch(n[v]);if(!R.ok)throw new Error(`Failed to load DEM tile ${n[v]}: HTTP ${R.status}`);const T=await createImageBitmap(await R.blob());r.push({...t[v],image:T})}const s=r[0].image.width,o=r[0].image.height;if(s<=0||o<=0||r.some(({image:v})=>v.width!==s||v.height!==o))throw new Error("DEM tiles must have matching, non-zero dimensions.");const a=Math.min(...t.map(({x:v})=>v)),l=Math.max(...t.map(({x:v})=>v)),c=Math.min(...t.map(({y:v})=>v)),d=Math.max(...t.map(({y:v})=>v)),u=document.createElement("canvas");u.width=(l-a+1)*s,u.height=(d-c+1)*o;const h=u.getContext("2d",{willReadFrequently:!0});if(!h)throw new Error("Could not create a 2D canvas context for DEM decoding.");for(const{x:v,y:R,image:T}of r)h.drawImage(T,(v-a)*s,(R-c)*o);const p=h.getImageData(0,0,u.width,u.height).data,g=2**i,_={north:Wl(c,i),south:Wl(d+1,i),west:a/g*360-180,east:(l+1)/g*360-180},m=X0(p,u.width,u.height),f=Math.max(1,Math.ceil(Math.max(u.width,u.height)/e)),b=G0(_,u.width,u.height,f),E=W0(u.width,u.height,m,f,b);return{cols:E.cols,rows:E.rows,values:E.values,cellSizeMeters:E.cellSizeMeters,bounds:_}}finally{for(const{image:s}of r)s.close()}}async function K0(n,e,t=Jc){try{return await $0(n,t)}catch(i){return console.warn("DEM loading failed; using the PoC synthetic terrain.",i),Y0(e)}}function Z0(n,e){const t=new Float32Array(n.cols*n.rows);if(t.fill(1),!e.enabled)return t;const i=(n.cols-1)/2,r=(n.rows-1)/2,s=Math.max(0,Math.min(1,e.fadeStartFactor));for(let o=0;o<n.rows;o+=1){const a=r===0?0:Math.abs(o-r)/r;for(let l=0;l<n.cols;l+=1){const c=i===0?0:Math.abs(l-i)/i,d=Math.min(1,Math.hypot(c,a));if(d<=s)continue;const u=(d-s)/(1-s),h=u*u*(3-2*u);t[o*n.cols+l]=1-h}}return t}const Or=2;function Yo(n){return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}function j0(n,e){const t=n.rows*n.cols;let i=Number.POSITIVE_INFINITY,r=Number.NEGATIVE_INFINITY;for(let c=0;c<t;c+=1){const d=n.values[c];d<i&&(i=d),d>r&&(r=d)}const s=new Float32Array(t*3),o=Yo(e.lowElevationColor),a=Yo(e.highElevationColor),l=r-i;for(let c=0;c<t;c+=1){const d=l===0?0:(n.values[c]-i)/l,u=c*3;s[u]=o[0]+(a[0]-o[0])*d,s[u+1]=o[1]+(a[1]-o[1])*d,s[u+2]=o[2]+(a[2]-o[2])*d}return s}function J0(n,e){const t=new Float32Array(n.rows*n.cols*3);for(let i=0;i<n.rows;i+=1){const r=Math.max(i-Or,0),s=Math.min(i+Or,n.rows-1);for(let o=0;o<n.cols;o+=1){const a=Math.max(o-Or,0),l=Math.min(o+Or,n.cols-1),c=Zn(n.values[i*n.cols+a],e.elevationScale),d=Zn(n.values[i*n.cols+l],e.elevationScale),u=Zn(n.values[r*n.cols+o],e.elevationScale),h=Zn(n.values[s*n.cols+o],e.elevationScale),p=(d-c)/((l-a)*n.cellSizeMeters),g=(h-u)/((s-r)*n.cellSizeMeters),_=-p,m=1,f=-g,b=Math.hypot(_,m,f),E=(i*n.cols+o)*3;t[E]=_/b,t[E+1]=m/b,t[E+2]=f/b}}return t}function Q0(n,e){const t=n.length/3,i=Math.sqrt(e.x**2+e.y**2+e.z**2),r=e.x/i,s=e.y/i,o=e.z/i,a=new Float32Array(t);let l=Number.POSITIVE_INFINITY,c=Number.NEGATIVE_INFINITY;for(let h=0;h<t;h+=1){const p=h*3,g=n[p]*r+n[p+1]*s+n[p+2]*o;a[h]=g,g<l&&(l=g),g>c&&(c=g)}const d=c-l,u=new Float32Array(t);for(let h=0;h<t;h+=1){const p=d>1e-6?(a[h]-l)/d:Math.max(0,Math.min(1,a[h]));u[h]=Math.max(0,Math.min(1,p))}return u}function ev(n,e,t,i){const r=j0(n,t),s=J0(n,e),o=Q0(s,i),a=new Float32Array(r.length),{hillshadeMinFactor:l,hillshadeMaxFactor:c}=t,d=c-l;for(let u=0;u<o.length;u+=1){const h=l+o[u]*d,p=u*3;a[p]=Math.min(1,r[p]*h),a[p+1]=Math.min(1,r[p+1]*h),a[p+2]=Math.min(1,r[p+2]*h)}if(t.edgeFade?.enabled){const u=Z0(n,t.edgeFade),h=Yo(t.edgeFade.fadeColor);for(let p=0;p<u.length;p+=1){const g=u[p],_=p*3;a[_]=h[0]+(a[_]-h[0])*g,a[_+1]=h[1]+(a[_+1]-h[1])*g,a[_+2]=h[2]+(a[_+2]-h[2])*g}}return a}function tv(n,e,t,i,r,s){const o=s===void 0?i:{...i,hillshadeMinFactor:1,hillshadeMaxFactor:1},a=ev(e,t,o,r);return n.setAttribute("color",new Dt(a,3)),new Ic({vertexColors:!0,color:16777215,roughness:i.roughness,metalness:i.metalness,map:s??null})}function nv(n){if(!Number.isInteger(n.cols)||!Number.isInteger(n.rows)||n.cols<=0||n.rows<=0)throw new RangeError("Terrain grid dimensions must be positive integers.");const e=new Float32Array(n.rows*n.cols*2),t=Math.max(n.cols-1,1),i=Math.max(n.rows-1,1);for(let r=0;r<n.rows*n.cols;r+=1){const s=Math.floor(r/n.cols),o=r%n.cols,a=r*2,l=t>0?o/t:0,c=i>0?1-s/i:0;e[a]=l,e[a+1]=c}return e}function iv(n,e){const t=new Float32Array(n.rows*n.cols*3);for(let i=0;i<n.rows*n.cols;i+=1){const r=Math.floor(i/n.cols),s=i%n.cols,o=i*3;t[o]=s*n.cellSizeMeters,t[o+1]=Zn(n.values[i],e.elevationScale),t[o+2]=r*n.cellSizeMeters}return t}function rv(n,e){const t=new Lt;t.setAttribute("position",new Dt(iv(n,e),3)),t.setAttribute("uv",new Dt(nv(n),2));const i=[];for(let r=0;r<n.rows-1;r+=1)for(let s=0;s<n.cols-1;s+=1){const o=r*n.cols+s,a=o+1,l=o+n.cols,c=l+1;i.push(o,l,a),i.push(a,l,c)}return t.setIndex(i),t.computeVertexNormals(),t}async function sv(n,e){const i=await new Fh().loadAsync(n);return i.colorSpace=Ot,i.wrapS=Zi,i.wrapT=Zi,i.magFilter=Kt,i.minFilter=Cn,i.generateMipmaps=!0,e!==void 0&&(i.anisotropy=Math.min(e,16)),i.needsUpdate=!0,i}const ov=1800;function Br(n,e){n.push(e),n.length>ov&&n.shift()}function Xi(n,e){if(n.length===0)return 0;const t=Math.min(Math.max(e,0),1),i=Math.min(Math.max(Math.ceil(t*n.length)-1,0),n.length-1);return n[i]}function av(n){const e=n.length,t=n.reduce((r,s)=>r+s,0),i=[...n].sort((r,s)=>r-s);return{frameCount:e,totalElapsedMs:t,averageFps:t>0?e*1e3/t:0,p50Ms:Xi(i,.5),p90Ms:Xi(i,.9),p95Ms:Xi(i,.95),p99Ms:Xi(i,.99),maxMs:i[i.length-1]??0,longFrameCounts:{over33_3ms:n.filter(r=>r>33.3).length,over50ms:n.filter(r=>r>50).length,over66_7ms:n.filter(r=>r>66.7).length,over100ms:n.filter(r=>r>100).length}}}function Qs(n){const e=n.length,t=[...n].sort((r,s)=>r-s),i=n.reduce((r,s)=>r+s,0);return{sampleCount:e,avgPerMs:e>0?i/e:0,maxPerMs:t[t.length-1]??0,p95PerMs:Xi(t,.95)}}function lv(){const n=[],e=[],t=[],i=[];let r;return{recordFrame(s){r!==void 0&&Br(n,s-r),r=s},recordMovement(s,o){o<=0||(Br(e,s.cameraPositionDelta/o),Br(t,s.cameraTargetDelta/o),Br(i,s.routeProgressDelta/o))},getFrameSummary(){return n.length>0?av(n):void 0},getMovementSummary(){if(e.length!==0)return{cameraPositionPerMs:Qs(e),cameraTargetPerMs:Qs(t),routeProgressPerMs:Qs(i)}},reset(){n.length=0,e.length=0,t.length=0,i.length=0,r=void 0}}}const cv=1800;function Qc(n,e){const t=n.x*e.x+n.y*e.y+n.z*e.z+n.w*e.w;if(!Number.isFinite(t))return 0;const i=Math.min(Math.max(Math.abs(t),0),1);return Math.max(0,2*Math.acos(i))}function zr(n){let e=0,t=0;for(const i of n){if(!Number.isFinite(i)||i===0)continue;const r=Math.sign(i);t!==0&&r!==t&&(e+=1),t=r}return e}function Xl(n,e){const t=[],i=Math.min(n.length,e.length);for(let d=0;d<i;d+=1){const u=n[d],h=e[d];Number.isFinite(u)&&Number.isFinite(h)&&t.push([u,h])}if(t.length<2)return 0;const r=t.reduce((d,[u])=>d+u,0)/t.length,s=t.reduce((d,[,u])=>d+u,0)/t.length;let o=0,a=0,l=0;for(const[d,u]of t){const h=d-r,p=u-s;o+=h*p,a+=h*h,l+=p*p}if(a===0||l===0)return 0;const c=o/Math.sqrt(a*l);return Number.isFinite(c)?Math.min(Math.max(c,-1),1):0}function wn(n){const e=n.filter(Number.isFinite);if(e.length===0)return{avg:0,max:0,p95:0};const t=[...e].sort((r,s)=>r-s),i=Math.min(Math.ceil(t.length*.95)-1,t.length-1);return{avg:e.reduce((r,s)=>r+s,0)/e.length,max:t[t.length-1],p95:t[i]}}function uv(n,e){return Math.hypot(e.x-n.x,e.y-n.y,e.z-n.z)}function dv(n,e){const t={x:e.w*-n.x+e.x*n.w+e.y*-n.z-e.z*-n.y,y:e.w*-n.y-e.x*-n.z+e.y*n.w+e.z*-n.x,z:e.w*-n.z+e.x*-n.y-e.y*-n.x+e.z*n.w,w:e.w*n.w-e.x*-n.x-e.y*-n.y-e.z*-n.z},i=t.w<0?-1:1,s=[t.x*i,t.y*i,t.z*i].reduce((o,a)=>Math.abs(a)>Math.abs(o)?a:o,0);return Math.sign(s)*Qc(n,e)}function hv(n){return Number.isFinite(n)&&n>0}function fv(n){const e=[],t=[],i=[],r=[],s=[],o=[],a=[],l=[],c=[],d=[],u=[],h=[],p=[],g=[],_=[];let m,f,b,E;for(let v=1;v<n.length;v+=1){const R=n[v-1],T=n[v],C=uv(R.position,T.position),D=Qc(R.quaternion,T.quaternion);if(e.push(C),t.push(D),c.push(T.position.x-R.position.x),d.push(T.position.y-R.position.y),u.push(T.position.z-R.position.z),h.push(dv(R.quaternion,T.quaternion)),!hv(T.frameGapMs))continue;const y=T.frameGapMs,M=C/y,w=D/y;if(i.push(M),r.push(w),p.push(y),g.push(C),_.push(D),m!==void 0){const O=(M-m)/y;s.push(O),b!==void 0&&a.push((O-b)/y),b=O}if(f!==void 0){const O=(w-f)/y;o.push(O),E!==void 0&&l.push((O-E)/y),E=O}m=M,f=w}return{sampleCount:n.length,linear:{displacementPerFrame:wn(e),velocityPerMs:wn(i),accelerationPerMs2:wn(s),jerkPerMs3:wn(a)},angular:{displacementRadPerFrame:wn(t),velocityRadPerMs:wn(r),accelerationRadPerMs2:wn(o),jerkRadPerMs3:wn(l)},directionReversalCount:{linearAxisReversals:zr(c)+zr(d)+zr(u),angularReversals:zr(h)},longFrameJumpCorrelation:{sampleCount:p.length,pearsonRLinear:Xl(p,g),pearsonRAngular:Xl(p,_)}}}function pv(){const n=[];return{recordSample(e,t){n.push({timestampMs:e.timestampMs,position:{...e.position},quaternion:{...e.quaternion},frameGapMs:t}),n.length>cv&&n.shift()},getSummary(){return n.length>0?fv(n):void 0},reset(){n.length=0}}}const mv=["route-progress","camera-update","route-line-update","route-head-marker","label-occlusion","spot-arrival","arrival-card","renderer-render"];function gv(){return{count:0,totalMs:0,avgMs:0,maxMs:0}}function _v(n,e){const t=Object.fromEntries(e.map(i=>[i,gv()]));return n.forEach(i=>{const r=e.find(o=>i.name===`hp:${o}`);if(r===void 0)return;const s=t[r];s.count+=1,s.totalMs+=i.duration,s.maxMs=Math.max(s.maxMs,i.duration)}),e.forEach(i=>{const r=t[i];r.avgMs=r.count>0?r.totalMs/r.count:0}),t}function vv(n,e,t){let i=0;return{begin(r){n(`hp:${r}:start`)},end(r){const s=`hp:${r}`;n(`${s}:end`),e(s,`${s}:start`,`${s}:end`)},getSummary(){const r=t();return _v(r.slice(i),mv)},reset(){i=t().length}}}function xv(n){switch(n){case"baseline":case"no-route-update":case"no-label-occlusion":case"no-spot-animation":case"no-route-and-labels":return n;default:return"baseline"}}function Mv(n){switch(n){case"no-route-update":return{skipRouteVisualUpdate:!0,skipLabelOcclusion:!1,skipSpotAnimation:!1};case"no-label-occlusion":return{skipRouteVisualUpdate:!1,skipLabelOcclusion:!0,skipSpotAnimation:!1};case"no-spot-animation":return{skipRouteVisualUpdate:!1,skipLabelOcclusion:!1,skipSpotAnimation:!0};case"no-route-and-labels":return{skipRouteVisualUpdate:!0,skipLabelOcclusion:!0,skipSpotAnimation:!1};case"baseline":return{skipRouteVisualUpdate:!1,skipLabelOcclusion:!1,skipSpotAnimation:!1}}}function Sv(){return{position:{x:0,y:0,z:0},target:{x:0,y:0,z:0},initialized:!1}}function ql(n,e){const t=1-Math.exp(-Math.max(0,n)/Math.max(1e-6,e));return Math.min(1,Math.max(0,t))}function Ln(n){return{x:n.x,y:n.y,z:n.z}}function Yl(n,e,t){return{x:n.x+(e.x-n.x)*t,y:n.y+(e.y-n.y)*t,z:n.z+(e.z-n.z)*t}}function yv(n){const e={position:Ln(n.position),target:Ln(n.target)};return{pose:e,nextState:{position:Ln(e.position),target:Ln(e.target),initialized:!0}}}function Ev(n,e,t,i,r){if(i==="baseline"||!e.initialized)return yv(n);const s=i==="stable-position"||i==="stable-both",o=i==="stable-orientation"||i==="stable-both",a=s?Yl(e.position,n.position,ql(t,r.positionTauMs)):Ln(n.position),l=o?Yl(e.target,n.target,ql(t,r.targetTauMs)):Ln(n.target);return{pose:{position:a,target:l},nextState:{position:Ln(a),target:Ln(l),initialized:!0}}}function Tv(n){return`linear-gradient(to bottom, ${n.gradientTopColor} 0%, ${n.gradientBottomColor} 100%)`}function bv(n,e){const t=n.cols*n.cellSizeMeters,i=n.rows*n.cellSizeMeters,r=Math.sqrt(t*t+i*i);return{color:e.fogColor,near:r*e.fogNearFactor,far:r*e.fogFarFactor}}function Av(n,e,t,i){n.style.background=Tv(i),e.background=null;const{color:r,near:s,far:o}=bv(t,i);e.fog=new la(r,s,o)}function wv(n){const{container:e,config:t,poiDisplayTextById:i}=n,r=document.createElement("div"),s=t.accentColor.toString(16).padStart(6,"0");r.className="arrival-card arrival-card--hidden",r.style.position="fixed",r.style.left="50%",r.style.bottom=`${t.bottomMarginPx}px`,r.style.transform=`translateX(-50%) translateY(${t.slideOffsetPx}px)`,r.style.opacity="0",r.style.transition=`opacity ${t.fadeMs}ms ease, transform ${t.fadeMs}ms ease`,r.style.pointerEvents="none",r.style.zIndex="15",r.style.background=t.backgroundColor,r.style.color=t.textColor,r.style.borderTop=`2px solid #${s}`,r.style.padding="10px 24px 11px",r.style.borderRadius="4px",r.style.fontFamily="sans-serif",r.style.fontSize="18px",r.style.fontWeight="600",r.style.letterSpacing="0.08em",r.style.lineHeight="1.4",r.style.textAlign="center",r.style.whiteSpace="nowrap",r.style.boxSizing="border-box",e.appendChild(r);let o=!1,a="";return{element:r,update(l){const c=l.find(_=>_.isPrimaryActive&&(_.phase==="arrive"||_.phase==="dwell"||_.phase==="depart")),d=c!==void 0,u=c===void 0?"":i.get(c.poiId)??c.poiId,h=c?.phase==="depart"?c.intensity:d?1:0,p=d!==o,g=u!==a;p&&(r.className=d?"arrival-card arrival-card--visible":"arrival-card arrival-card--hidden",r.style.transform=d?"translateX(-50%) translateY(0)":`translateX(-50%) translateY(${t.slideOffsetPx}px)`,c?.phase!=="depart"&&(r.style.opacity=String(h))),g&&(r.textContent=u),(p||g)&&(o=d,a=u),c?.phase==="depart"&&(r.style.opacity=String(h))},dispose(){r.remove()}}}class Rv extends _t{constructor(e=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=e,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new We(.5,.5),this.addEventListener("removed",function(){this.traverse(function(t){t.element instanceof t.element.ownerDocument.defaultView.Element&&t.element.parentNode!==null&&t.element.remove()})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this.center=e.center,this}}const Ei=new I,$l=new at,Kl=new at,Zl=new I,jl=new I;class Cv{constructor(e={}){const t=this;let i,r,s,o;const a={objects:new WeakMap},l=e.element!==void 0?e.element:document.createElement("div");l.style.overflow="hidden",this.domElement=l,this.getSize=function(){return{width:i,height:r}},this.render=function(g,_){g.matrixWorldAutoUpdate===!0&&g.updateMatrixWorld(),_.parent===null&&_.matrixWorldAutoUpdate===!0&&_.updateMatrixWorld(),$l.copy(_.matrixWorldInverse),Kl.multiplyMatrices(_.projectionMatrix,$l),d(g,g,_),p(g)},this.setSize=function(g,_){i=g,r=_,s=i/2,o=r/2,l.style.width=g+"px",l.style.height=_+"px"};function c(g){g.isCSS2DObject&&(g.element.style.display="none");for(let _=0,m=g.children.length;_<m;_++)c(g.children[_])}function d(g,_,m){if(g.visible===!1){c(g);return}if(g.isCSS2DObject){Ei.setFromMatrixPosition(g.matrixWorld),Ei.applyMatrix4(Kl);const f=Ei.z>=-1&&Ei.z<=1&&g.layers.test(m.layers)===!0,b=g.element;b.style.display=f===!0?"":"none",f===!0&&(g.onBeforeRender(t,_,m),b.style.transform="translate("+-100*g.center.x+"%,"+-100*g.center.y+"%)translate("+(Ei.x*s+s)+"px,"+(-Ei.y*o+o)+"px)",b.parentNode!==l&&l.appendChild(b),g.onAfterRender(t,_,m));const E={distanceToCameraSquared:u(m,g)};a.objects.set(g,E)}for(let f=0,b=g.children.length;f<b;f++)d(g.children[f],_,m)}function u(g,_){return Zl.setFromMatrixPosition(g.matrixWorld),jl.setFromMatrixPosition(_.matrixWorld),Zl.distanceToSquared(jl)}function h(g){const _=[];return g.traverseVisible(function(m){m.isCSS2DObject&&_.push(m)}),_}function p(g){const _=h(g).sort(function(f,b){if(f.renderOrder!==b.renderOrder)return b.renderOrder-f.renderOrder;const E=a.objects.get(f).distanceToCameraSquared,v=a.objects.get(b).distanceToCameraSquared;return E-v}),m=_.length;for(let f=0,b=_.length;f<b;f++)_[f].element.style.zIndex=m-f}}}function Pv(n,e,t){return e!==null&&e<n-t}function Dv(n,e,t=0){return(n+t)%e===0}const Lv=2;function Iv(n){return{occluded:n,pendingOccluded:null,pendingSinceFrame:null}}function Uv(n,e,t=Lv){if(n===e.occluded){const s={occluded:e.occluded,pendingOccluded:null,pendingSinceFrame:null};return{occluded:s.occluded,nextState:s}}const i=e.pendingOccluded===n?(e.pendingSinceFrame??0)+1:1;if(i>=t){const s={occluded:n,pendingOccluded:null,pendingSinceFrame:null};return{occluded:s.occluded,nextState:s}}const r={occluded:e.occluded,pendingOccluded:n,pendingSinceFrame:i};return{occluded:r.occluded,nextState:r}}function Nv(n,e){return n>e.hideBeyondMeters}const Fv=.08,Ov=.03,Bv=.6;function zv(n,e=Fv,t=Ov){const i=n.map(()=>1);for(let r=0;r<n.length;r+=1){const s=n[r];if(!s.isActive)for(let o=r+1;o<n.length;o+=1){const a=n[o];if(a.isActive)continue;const l=s.ndcX-a.ndcX,c=s.ndcY-a.ndcY,d=Math.sqrt(l*l+c*c);let u;if(d<t)u=0;else if(d<e)u=Bv;else continue;const h=s.priority>a.priority||s.priority===a.priority&&s.poiId>a.poiId?r:o;i[h]=Math.min(i[h],u)}}return n.map((r,s)=>({poiId:r.poiId,opacityMultiplier:i[s]}))}function Hv(n){if(n.w<=0)return{visible:!1,ndcX:0,ndcY:0};const e=n.x/n.w,t=n.y/n.w;return{visible:e>=-1&&e<=1&&t>=-1&&t<=1,ndcX:e,ndcY:t}}function kv(n,e){const t=[];return n.points.forEach(i=>{if(i.poiId===void 0)return;const r=e.find(s=>s.poiId===i.poiId);r!==void 0&&t.push({point:{...i,poiId:i.poiId},presentation:r})}),t}function Vv(n,e,t){return n.map(({point:i,presentation:r})=>{const{col:s,row:o}=qr(i,e),a=Kc(e,s,o);return{poiId:i.poiId,displayText:r.displayText,base:{x:s*e.cellSizeMeters,y:Zn(a,t.elevationScale),z:o*e.cellSizeMeters}}})}function Jl(n){return{...n.base}}function Gv(n,e){return n===void 0||!n.isActive?{scaleMultiplier:1,opacityMultiplier:e?bi.otherSpotDimOpacity:1,emphasized:!1}:{scaleMultiplier:1+(bi.labelEmphasisScale-1)*n.intensity,opacityMultiplier:1,emphasized:n.phase==="arrive"||n.phase==="dwell"}}const Wv=1.5;function Xv(n){return jr.clamp(n,0,1)}function eo(n,e,t){n.scale.set(e.x*t,e.y*t,e.z*t)}function qv(n,e){const t=e.style==="pin-stand"?.1:.08,i=e.style==="pin-stand"?.36:.18,r=e.style==="pin-stand"?.75:.7,s={position:{...n},head:{position:{x:0,y:e.standHeightMeters+e.headRadiusMeters,z:0},scale:{x:e.headRadiusMeters,y:e.headRadiusMeters,z:e.headRadiusMeters*i}},pole:{position:{x:0,y:e.standHeightMeters/2,z:0},scale:{x:e.headRadiusMeters*t,y:e.standHeightMeters,z:e.headRadiusMeters*t}},shadow:{position:{x:0,y:.2,z:0},scale:{x:e.headRadiusMeters*r,y:e.headRadiusMeters*r,z:1}}};if(e.glow?.enabled){const o=e.headRadiusMeters*e.glow.radiusFactor;s.glow={position:{...s.head.position},scale:{x:o,y:o,z:o}}}return e.beaconRing?.enabled&&(s.beaconRing={position:{...s.shadow.position},scale:{x:1,y:1,z:1}}),s}function Yv(n){const{scene:e,anchors:t,config:i}=n,r=new _n;r.name="waypoint-markers",e.add(r);const s=[],o=[],a=[];if(i.enabled)switch(i.style){case"pin-stand":{const l=new Jn(1,24,16),c=new ua(1,1,1,12),d=new Jr(1,24),u=new Jr(1,24);u.rotateX(-Math.PI/2);const h=i.glow?.enabled?new Jn(1,20,12):void 0,p=i.beaconRing?.enabled?new da(i.headRadiusMeters*i.beaconRing.innerRadiusFactor,i.headRadiusMeters*i.beaconRing.outerRadiusFactor,32):void 0;p?.rotateX(-Math.PI/2),s.push(l,c,d,u),h&&s.push(h),p&&s.push(p);const g=new Ic({color:i.color,roughness:.6,metalness:.05}),_=new gn({color:2106667,depthWrite:!1}),m=new gn({color:0,transparent:!0,opacity:.22,depthWrite:!1});o.push(g,_,m);const f=i.glow?.enabled?new gn({color:i.glow.color,transparent:!0,opacity:i.glow.opacity,blending:Ci,depthWrite:!1,depthTest:!0}):void 0,b=i.beaconRing?.enabled?new gn({color:i.beaconRing.color,transparent:!0,opacity:i.beaconRing.opacity,blending:Ci,depthWrite:!1,depthTest:!0}):void 0;f&&o.push(f),b&&o.push(b);for(const{anchor:E,displayText:v,poiId:R}of t){const T=qv(E,i),C=new _n;C.name=`waypoint-marker:${v}`,C.position.set(T.position.x,T.position.y,T.position.z);const D=new ft(c,g);D.position.set(T.pole.position.x,T.pole.position.y,T.pole.position.z),D.scale.set(T.pole.scale.x,T.pole.scale.y,T.pole.scale.z);const y=new ft(l,g);y.name="waypoint-marker-head",y.position.set(T.head.position.x,T.head.position.y,T.head.position.z),y.scale.set(T.head.scale.x,T.head.scale.y,T.head.scale.z);const M=f?.clone();M&&o.push(M);const w=h&&M&&T.glow?new ft(h,M):void 0;w&&T.glow&&(w.name="waypoint-marker-glow",w.position.set(T.glow.position.x,T.glow.position.y,T.glow.position.z),w.scale.set(T.glow.scale.x,T.glow.scale.y,T.glow.scale.z));const O=new ft(d,_);O.position.set(T.head.position.x,T.head.position.y,T.head.position.z+T.head.scale.z+.05),O.scale.setScalar(i.headRadiusMeters*.45);const N=new ft(u,m);N.position.set(T.shadow.position.x,T.shadow.position.y,T.shadow.position.z),N.scale.set(T.shadow.scale.x,T.shadow.scale.y,T.shadow.scale.z);const V=b?.clone();V&&o.push(V);const q=p&&V&&T.beaconRing?new ft(p,V):void 0;q&&T.beaconRing&&(q.name="waypoint-marker-beacon-ring",q.position.set(T.beaconRing.position.x,T.beaconRing.position.y,T.beaconRing.position.z),q.scale.set(T.beaconRing.scale.x,T.beaconRing.scale.y,T.beaconRing.scale.z)),q&&C.add(q),C.add(N,D),w&&C.add(w),C.add(y,O),r.add(C),a.push({poiId:R,head:y,headBaseScale:y.scale.clone(),...w?{glow:w,glowBaseScale:w.scale.clone(),glowBaseOpacity:w.material.opacity}:{},...q?{beaconRing:q,beaconRingBaseScale:q.scale.clone(),beaconRingBaseOpacity:q.material.opacity}:{}})}break}}return{object3D:r,updateArrivalStates(l,c){const d=l.some(u=>u.isPrimaryActive);for(const u of a){const h=l.find(f=>f.poiId===u.poiId),p=d&&h!==void 0?Xv(h.intensity):0,g=jr.lerp(1,bi.markerScalePeak,p),_=h?.isPrimaryActive===!0,m=d&&!_?bi.otherSpotDimOpacity:jr.lerp(1,Wv,p);if(eo(u.head,u.headBaseScale,g),u.glow&&u.glowBaseScale&&u.glowBaseOpacity!==void 0&&(eo(u.glow,u.glowBaseScale,g),u.glow.material.opacity=Math.min(1,u.glowBaseOpacity*m)),u.beaconRing&&u.beaconRingBaseScale&&u.beaconRingBaseOpacity!==void 0){const f=h?.phase==="arrive"?1+bi.ringPulseAmplitude*(.5+.5*Math.cos(Math.PI*2*c/bi.ringPulsePeriodMs)):1;eo(u.beaconRing,u.beaconRingBaseScale,f),u.beaconRing.material.opacity=Math.min(1,u.beaconRingBaseOpacity*m)}}},dispose(){e.remove(r);for(const l of s)l.dispose();for(const l of o)l.dispose()}}}const $v=12;function Kv(n,e,t,i){const r=i?e:n.occluded;return{occluded:r,distanceHidden:n.distanceHidden,offScreen:t,scale:n.scale,visible:!r&&!n.distanceHidden&&!t}}function Zv(n,e,t){const i=Nv(e,t);return{occluded:n.occluded,distanceHidden:i,offScreen:n.offScreen,scale:1,visible:!n.occluded&&!i&&!n.offScreen}}function jv(n){return n.visible?{className:"route-label",style:{visibility:"visible",scale:"1",transformOrigin:"center center",pointerEvents:"none",backgroundColor:"rgba(0, 0, 0, 0.55)",color:"#ffffff",padding:"2px 8px",borderRadius:"3px",fontSize:"13px"}}:{className:"route-label route-label--hidden",style:{visibility:"hidden",scale:"1",transformOrigin:"center center",pointerEvents:"none",backgroundColor:"rgba(0, 0, 0, 0.55)",color:"#ffffff",padding:"2px 8px",borderRadius:"3px",fontSize:"13px"}}}function Jv(n,e){n.className=e.className,n.style.visibility=e.style.visibility,n.style.scale=e.style.scale,n.style.transformOrigin=e.style.transformOrigin,n.style.pointerEvents=e.style.pointerEvents,n.style.backgroundColor=e.style.backgroundColor,n.style.color=e.style.color,n.style.padding=e.style.padding,n.style.borderRadius=e.style.borderRadius,n.style.fontSize=e.style.fontSize}function to(n){const e=jv(n.state);Jv(n.labelElement,e),n.labelElement.style.scale="1",n.labelElement.style.opacity=String(n.arrivalOpacityMultiplier*n.overlapOpacityMultiplier)}function Qv(n){const{container:e,scene:t,camera:i,terrainMesh:r,route:s,grid:o,settings:a}=n,l=new Cv;l.domElement.className="route-label-renderer",l.domElement.style.position="absolute",l.domElement.style.top="0",l.domElement.style.left="0",l.domElement.style.pointerEvents="none",l.setSize(e.clientWidth||a.resolutionWidth,e.clientHeight||a.resolutionHeight),e.appendChild(l.domElement);const c=kv(s,a.labels.points),d=Vv(c,o,a),u=d.map(v=>({anchor:Jl(v),displayText:v.displayText,poiId:v.poiId})),h=d.map(v=>({anchor:Jl(v),displayText:v.displayText,poiId:v.poiId})),p=Yv({scene:t,anchors:h,config:a.visual.waypoints}),g={occluded:!1,distanceHidden:!1,offScreen:!1,scale:1,visible:!0},_=u.map(({anchor:v,displayText:R,poiId:T})=>{const C=document.createElement("div");C.style.pointerEvents="none";const D=document.createElement("div");D.textContent=R,D.style.position="absolute",D.style.left="0",D.style.top="0",D.style.whiteSpace="nowrap",D.style.transform=`translate(-50%, calc(-100% - ${$v}px))`,C.appendChild(D);const y=new Rv(C);y.position.set(v.x,v.y,v.z),t.add(y);const M={object:y,labelElement:D,anchor:new I(v.x,v.y,v.z),poiId:T,state:g,arrivalOpacityMultiplier:1,occlusionHysteresis:Iv(!1),lastNdc:{x:0,y:0},overlapOpacityMultiplier:1,hasProjected:!1};return to(M),M}),m=new Gh,f=new I,b=new I,E=new tt;return{renderer:l,objects:_.map(({object:v})=>v),setSize(v,R){l.setSize(v,R)},updateOcclusion(v,R){i.getWorldPosition(f),r.updateWorldMatrix(!0,!0);for(const[T,C]of _.entries()){const D=Dv(v,a.labels.occlusion.throttleFrames,T);let y=C.state.occluded;E.set(C.anchor.x,C.anchor.y,C.anchor.z,1).applyMatrix4(i.matrixWorldInverse).applyMatrix4(i.projectionMatrix);const M=Hv(E);if(C.lastNdc={x:M.ndcX,y:M.ndcY},C.hasProjected=!0,D){b.subVectors(C.anchor,f);const O=b.length();b.normalize(),m.set(f,b),m.far=O;const N=m.intersectObject(r,!0)[0];y=Pv(O,N?.distance??null,a.labels.occlusion.epsilonMeters)}const w=Uv(y,C.occlusionHysteresis);C.occlusionHysteresis=w.nextState,C.state=Kv(C.state,w.occluded,!M.visible,D),C.state=Zv(C.state,f.distanceTo(C.anchor),a.labels.distanceScaling),to(C)}},updateArrivalStates(v,R){const T=v.some(M=>M.isPrimaryActive),C=_.map((M,w)=>{const O=v.find(N=>N.poiId===M.poiId);return{poiId:M.poiId,ndcX:M.lastNdc.x,ndcY:M.lastNdc.y,isActive:M.hasProjected?O?.isActive??!1:!0,priority:w}}),D=zv(C),y=new Map(D.map(M=>[M.poiId,M.opacityMultiplier]));for(const M of _){const w=v.find(N=>N.poiId===M.poiId),{opacityMultiplier:O}=Gv(w,T);M.arrivalOpacityMultiplier=O,M.overlapOpacityMultiplier=y.get(M.poiId)??1,to(M)}p.updateArrivalStates(v,R)},render(){l.render(t,i)},dispose(){for(const v of _)t.remove(v.object);p.dispose(),l.domElement.remove()}}}function ex(n){const e=new Oh(n.hemisphereSkyColor,n.hemisphereGroundColor,n.hemisphereIntensity),t=new Hh(n.directionalColor,n.directionalIntensity);return t.position.set(n.directionalPosition.x,n.directionalPosition.y,n.directionalPosition.z),{hemisphere:e,directional:t}}function tx(n,e={}){const t=e.hardCapRatio??2,i=Math.min(n,t);return e.variantCapRatio===void 0?i:Math.min(i,e.variantCapRatio)}function Ql(n,e,t,i,r,s){const o=j_({phaseKind:e,phaseElapsedMs:t,transitionToSummitMs:i,summitHoldMs:r},s);return n.map(a=>a.poiId==="summit"?{...o,isPrimaryActive:o.isActive}:a)}const nx=[14528,14529,14530].flatMap(n=>[6453,6454,6455].map(e=>`/3d-viewer/data/dem/14/${n}/${e}.png`));async function ix(n){const e=document.createElement("div");e.textContent="Loading…",e.setAttribute("role","status"),e.style.cssText=["position: fixed","inset: 0","z-index: 1000","display: grid","place-items: center","color: #fff","font: 14px/1.4 sans-serif","pointer-events: none"].join(";"),n.appendChild(e);const t=document.createElement("div");t.className="lite-fixed-background",t.style.position="absolute",t.style.inset="0",t.style.width="100%",t.style.height="100%",t.style.overflow="hidden",t.style.backgroundImage=`url("${y0}")`,t.style.backgroundSize="cover",t.style.backgroundPosition="center center",t.style.backgroundRepeat="no-repeat",n.appendChild(t);const i=I0(t,M0,S0);i.setRoutePoints(E0),i.setLabels(T0),e.remove();const r={playDurationMs:pa,holdAtEndMs:0};let s=ic(),o;const a=()=>{document.visibilityState==="visible"&&(o=void 0)};document.addEventListener("visibilitychange",a);const l=c=>{const d=o===void 0?0:c-o;o=c,s=rc(s,d,r);const u=O0(s.elapsedMs);i.setProgress(u.routeProgress,u.cut==="hero"?"subtle":"active"),window.requestAnimationFrame(l)};window.requestAnimationFrame(l)}async function rx(n,e,t="full"){if(t==="lite"){await ix(n);return}const i=new URLSearchParams(window.location.search),r=i.get("perf")==="1",s=Number(i.get("terrainRes"))||256,o=i.get("dprCap"),a=o===null?void 0:Number(o),l=lv();let c,d,u=0;const h=i.get("cameraDiag"),p=h==="stable-orientation"||h==="stable-position"||h==="stable-both"?h:"baseline",g=i.get("motionClock"),_=g==="raw"?{strategy:"raw"}:g==="fixed-step"?{strategy:"fixed-step"}:{strategy:"capped"},m=Mv(xv(i.get("isolate"))),f={positionTauMs:120,targetTauMs:120};let b=Sv();const E=r?pv():void 0,v=r?vv(Le=>performance.mark(Le),(Le,Ve,A)=>performance.measure(Le,Ve,A),()=>performance.getEntriesByType("measure")):void 0,R=new bh,T=new Gt(45,e.resolutionWidth/e.resolutionHeight,.1,1e5),C=document.createElement("div");C.textContent="Loading…",C.setAttribute("role","status"),C.style.cssText=["position: fixed","inset: 0","z-index: 1000","display: grid","place-items: center","color: #fff","font: 14px/1.4 sans-serif","pointer-events: none"].join(";"),n.appendChild(C);const D=new P_({antialias:!0,alpha:!0});D.setClearColor(0,0),D.setPixelRatio(tx(window.devicePixelRatio,{variantCapRatio:a})),n.appendChild(D.domElement);const y=(async()=>{try{return await K0(nx,e.terrainOrigin,s)}catch(Le){return console.warn("DEM loading failed; using a synthetic Takao terrain fallback.",Le),jc(50,50,599)}})(),M=(async()=>{if(e.visual.terrain.textureUrl)try{const Le=await sv(e.visual.terrain.textureUrl,D.capabilities.getMaxAnisotropy()),Ve=e.visual.terrain.textureRepeat;return Ve&&Le.repeat.set(Ve.x,Ve.y),Le}catch(Le){console.warn("Terrain texture loading failed; falling back to vertex-color terrain.",Le);return}})(),[w,O]=await Promise.all([y,M]);Av(n,R,w,e.visual.background);const N=rv(w,e),V=tv(N,w,e,e.visual.terrain,e.visual.lighting.directionalPosition,O),q=new ft(N,V);R.add(q);const X=5,K=w.cellSizeMeters*.5,H=u0(Ir,w,e,X,K),ne=$r(H),oe=p0(H,ne,e.cameraState.guidance),xe=qc(H,ne,oe.points,oe.cumulativeDistances,e.cameraState.rail),Ie=Zo(e.cameraState.timeline),nt=e.routeAnimation.playDurationMs,Ze=nt+e.cameraState.timeline.transitionToSummitMs,Y=xu(Ir,e.cameraState.routeFollowSpots.events,no);H.map(Le=>new I(Le.x,Le.y,Le.z));const ae=x0(e.visual.route,H);R.add(ae.object3D),ae.updatePoints(Sa(H,ne,0));const ie=a0({scene:R,config:e.visual.routeHeadMarker}),{hemisphere:be,directional:Ae}=ex(e.visual.lighting);R.add(be,Ae);const Pe=Gc(w,e),st=lr(w,e);T.position.set(Pe.x,Pe.y,Pe.z),T.lookAt(st.x,st.y,st.z);const ke=Qv({container:n,scene:R,camera:T,terrainMesh:q,route:Ir,grid:w,settings:e}),P=wv({container:n,config:e.visual.arrivalCard,poiDisplayTextById:new Map(e.labels.points.map(Le=>[Le.poiId,Le.displayText]))}),$e=Q_(Ir,K_),ye=()=>{const Le=n.clientWidth||e.resolutionWidth,Ve=n.clientHeight||e.resolutionHeight;T.aspect=Le/Ve,T.updateProjectionMatrix(),D.setSize(Le,Ve),ke.setSize(Le,Ve)};ye(),window.addEventListener("resize",ye),D.compile(R,T),D.render(R,T),ke.render(),C.remove();let Fe=ic(),_e,je,de=0;const Oe=()=>{document.visibilityState==="visible"&&(_e=void 0)};document.addEventListener("visibilitychange",Oe),D.setAnimationLoop(Le=>{r&&l.recordFrame(Le);const Ve=_e===void 0?0:Le-_e;_e=Le;{const W=fu(Ve,_);Fe=rc(Fe,W,e.routeAnimation)}v?.begin("route-progress");const A=sc(Fe.elapsedMs,Ie,e.routeAnimation.playDurationMs,Y);v?.end("route-progress");{v?.begin("camera-update");const W=Tu(Fe.elapsedMs,e.routeAnimation,e.cameraState.timeline,Y);je=W.kind;const Z=$_({phase:W,elapsedMs:Fe.elapsedMs,animationConfig:e.routeAnimation,grid:w,settings:e,worldRoutePoints:H,cumulativeDistances:ne,routeGuidancePoints:oe.points,routeGuidanceCumulativeDistances:oe.cumulativeDistances,cameraRail:xe,cameraState:e.cameraState}),{pose:G,nextState:Me}=Ev(Z,b,Ve,p,f);if(b=Me,T.position.set(G.position.x,G.position.y,G.position.z),T.lookAt(G.target.x,G.target.y,G.target.z),r){const te=new I(G.target.x,G.target.y,G.target.z),me=c?T.position.distanceTo(c):0,ve=d?te.distanceTo(d):0,J=Math.abs(A-u);l.recordMovement({cameraPositionDelta:me,cameraTargetDelta:ve,routeProgressDelta:J},Ve),c=T.position.clone(),d=te,u=A,E?.recordSample({timestampMs:Le,position:{x:T.position.x,y:T.position.y,z:T.position.z},quaternion:{x:T.quaternion.x,y:T.quaternion.y,z:T.quaternion.z,w:T.quaternion.w}},Ve)}v?.end("camera-update")}if(!m.skipRouteVisualUpdate){v?.begin("route-line-update");const W=Sa(H,ne,A);ae.updatePoints(W),v?.end("route-line-update")}v?.begin("route-head-marker");const x=r0(A,Dn(H,ne,A),e.visual.routeHeadMarker);ie.updatePosition(x.position,x.visible),ie.updateDirectionDashes(s0(H,ne,A,e.visual.routeHeadMarker),Fe.elapsedMs),v?.end("route-head-marker"),m.skipLabelOcclusion||(v?.begin("label-occlusion"),ke.updateOcclusion(de,Ve),v?.end("label-occlusion")),de+=1;let B;if(m.skipSpotAnimation)B=Rl($e);else{v?.begin("spot-arrival");const W=je==="route-follow"?J_(A,$e,qs,no):Rl($e);B=je==="transition-to-summit"?Ql(W,"transition-to-summit",Fe.elapsedMs-nt,e.cameraState.timeline.transitionToSummitMs,e.cameraState.timeline.summitHoldMs,qs.primary):je==="summit-hold"?Ql(W,"summit-hold",Fe.elapsedMs-Ze,e.cameraState.timeline.transitionToSummitMs,e.cameraState.timeline.summitHoldMs,qs.primary):W,ke.updateArrivalStates(B,Fe.elapsedMs),v?.end("spot-arrival"),v?.begin("arrival-card"),P.update(B),v?.end("arrival-card")}v?.begin("renderer-render"),D.render(R,T),ke.render(),v?.end("renderer-render")}),r&&(window.__framePacingSummary=()=>({frame:l.getFrameSummary(),movement:l.getMovementSummary()}),window.__cameraMotionSummary=()=>E?.getSummary(),window.__hotPathSummary=()=>v?.getSummary())}const ec=document.getElementById("app"),eu=Gu(window.location.search);ec?Vu(Ea)?(()=>{
  try {
    const _sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const _rk = _sp ? (_sp.get('route') || 'route_1') : 'route_1';
    const _ro = typeof window !== 'undefined' && window.__ALL_ROUTES_3D && window.__ALL_ROUTES_3D[_rk];
    if (_ro && _rk !== 'route_1') {
      if (_ro.labels && Ea && Ea.labels) Ea.labels.points = _ro.labels;
      if (Ea && Ea.cameraState && Ea.cameraState.routeFollowSpots) {
        Ea.cameraState.routeFollowSpots.events = _ro.labels.map(l => ({
          poiId: l.poiId,
          kind: "hold",
          decelMs: 300,
          midMs: 800,
          accelMs: 300
        }));
      }
    }
  } catch(e) {}
  return rx(ec,Ea,eu);
})().catch(n=>{console.error("Failed to set up the mountain scene.",n)}):console.error("The application settings are invalid."):console.error("Scene container #app was not found.");eu==="full"&&Zu(document.body);
