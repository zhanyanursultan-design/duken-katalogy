const $=x=>document.getElementById(x);
let planets=[
["TERRA-01","Earth-like",15,1.0,71,92,10],["KEPLER-22B","Earth-like",22,1.1,64,86,16],["EDEN-7","Earth-like",8,.9,78,89,12],["GAIA-X","Earth-like",27,1.2,58,82,19],["AQUA-9","Earth-like",4,1.0,84,91,9],
["NIVALIS","Ice world",-128,.7,62,31,22],["CRYO-4","Ice world",-86,.8,49,42,18],["BOREALIS","Ice world",-54,.9,71,55,14],["FROST-X","Ice world",-170,.5,38,18,35],["GLACIA","Ice world",-72,.8,66,48,20],
["SAHARA-X","Desert world",68,.9,3,54,41],["ARID-12","Desert world",91,1.1,1,39,58],["DUNE-5","Desert world",55,.8,8,62,37],["HELIOS-D","Desert world",112,1.3,0,27,73],["KALAHARI","Desert world",74,1.0,4,51,45],
["VULCAN-9","Volcanic",420,1.4,0,44,96],["MAGMA-X","Volcanic",610,1.6,0,29,100],["IGNIS-3","Volcanic",355,1.2,2,51,88],["PYRA","Volcanic",510,1.5,0,35,99],
["JOVIAN-X","Gas giant",-110,2.4,0,100,72],["TITAN-G","Gas giant",-145,2.1,0,100,64],["ORION-88","Gas giant",-95,2.8,0,100,79],["NEBULA-6","Gas giant",-130,2.5,0,100,68],["ATLAS-G","Gas giant",-80,2.2,0,100,75]
].map((p,i)=>({id:i,name:p[0],cls:p[1],temp:p[2],gravity:p[3],water:p[4],atmo:p[5],rad:p[6],cluster:0}));

const titles={home:["MISSION CONTROL","AI Space Research Laboratory"],train:["TRAIN AI","ASTRA Training Laboratory"],classify:["CLASSIFICATION","Unknown Planet Analysis"],cluster:["CLUSTERING","Deep Space Cluster Analysis"],dataset:["DATASET","Planetary Training Database"],theory:["AI THEORY","Machine Learning Theory"]};

document.querySelectorAll(".nav,.jump").forEach(b=>b.onclick=()=>show(b.dataset.page));
function show(id){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));$(id).classList.add("active");document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===id));$("crumb").textContent=titles[id][0];$("pageTitle").textContent=titles[id][1];if(id==="cluster")runKmeans();if(id==="dataset")renderTable();window.scrollTo(0,0)}
setInterval(()=>{$("clock").textContent=new Date().toLocaleTimeString("en-GB")},1000);

const featureKeys=["temp","gravity","water","atmo","rad"];
function normalized(list){let min={},max={};featureKeys.forEach(k=>{min[k]=Math.min(...list.map(p=>p[k]));max[k]=Math.max(...list.map(p=>p[k]))});return list.map(p=>featureKeys.map(k=>(p[k]-min[k])/((max[k]-min[k])||1)))}
function updateMemory(){let groups={};planets.forEach(p=>groups[p.cls]=(groups[p.cls]||0)+1);$("memoryNum").textContent=planets.length+" / 50";$("memoryBar").style.width=Math.min(100,planets.length/50*100)+"%";$("sideMemory").textContent=planets.length+" training samples";$("planetCount").textContent=planets.length;$("classMemory").innerHTML=Object.entries(groups).map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join("");$("dataSize").textContent=planets.length+" OBJECTS"}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}

$("trainBtn").onclick=()=>{let name=$("tName").value.trim();if(!name)return toast("Enter planet designation");planets.push({id:Date.now(),name,cls:$("tClass").value,temp:+$("tTemp").value,gravity:+$("tGravity").value,water:+$("tWater").value,atmo:+$("tAtmo").value,rad:+$("tRad").value,cluster:0});updateMemory();$("trainState").textContent="New knowledge acquired";$("terminal").innerHTML=`<p><i>SCAN</i> ${name} features received</p><p><i>LABEL</i> ${$("tClass").value}</p><p><i>ASTRA</i> training memory updated successfully</p><span class="cursor">_</span>`;toast("✓ ASTRA learned "+name)}

$("classifyBtn").onclick=()=>{let target={name:$("cName").value,temp:+$("cTemp").value,gravity:+$("cGravity").value,water:+$("cWater").value,atmo:+$("cAtmo").value,rad:+$("cRad").value};let all=[...planets,target],N=normalized(all),t=N[N.length-1];let near=planets.map((p,i)=>({p,d:Math.sqrt(N[i].reduce((s,v,j)=>s+(v-t[j])**2,0))})).sort((a,b)=>a.d-b.d).slice(0,5);let votes={};near.forEach(x=>votes[x.p.cls]=(votes[x.p.cls]||0)+1);let sorted=Object.entries(votes).sort((a,b)=>b[1]-a[1]),winner=sorted[0][0],conf=Math.round(sorted[0][1]/5*100);$("resultClass").textContent=winner.toUpperCase();$("resultDesc").textContent=`ASTRA classified ${target.name} using its 5 nearest training objects.`;$("confidence").textContent=conf+"%";$("confBar").style.width=conf+"%";$("neighbors").innerHTML=near.map((x,i)=>`<div class="neighbor"><span>${String(i+1).padStart(2,"0")} / ${x.p.name}</span><b>${x.p.cls}</b></div>`).join("");toast("Classification complete")}

let chart;
function kmeansData(){
 let N=normalized(planets),k=4,cent=[N[0].slice(),N[5].slice(),N[10].slice(),N[19].slice()],assign=[];
 for(let z=0;z<60;z++){assign=N.map(p=>{let d=cent.map(c=>Math.sqrt(p.reduce((s,v,j)=>s+(v-c[j])**2,0)));return d.indexOf(Math.min(...d))});let next=cent.map((c,ci)=>{let g=N.filter((_,i)=>assign[i]===ci);return g.length?c.map((_,j)=>g.reduce((s,p)=>s+p[j],0)/g.length):c});let diff=JSON.stringify(next)===JSON.stringify(cent);cent=next;if(diff)break}
 planets.forEach((p,i)=>p.cluster=assign[i]);return [0,1,2,3].map(i=>planets.filter(p=>p.cluster===i))
}
function clusterNames(groups){return groups.map((g,i)=>{if(!g.length)return"Empty cluster";let avg=k=>g.reduce((s,p)=>s+p[k],0)/g.length;if(avg("temp")>180)return"Extreme heat worlds";if(avg("gravity")>1.8)return"Massive gas worlds";if(avg("temp")< -35)return"Frozen outer worlds";return"Temperate rocky worlds"})}
function runKmeans(){let groups=kmeansData(),names=clusterNames(groups),colors=["#55dfd0","#6880ff","#a36cf1","#f0b45b"];$("clusterCards").innerHTML=groups.map((g,i)=>`<article><span>CLUSTER ${String(i+1).padStart(2,"0")}</span><b style="color:${colors[i]}">${names[i]}</b><small>${g.length} objects discovered</small></article>`).join("");$("clusterExplain").innerHTML=groups.map((g,i)=>{let av=k=>g.length?Math.round(g.reduce((s,p)=>s+p[k],0)/g.length):0;return`<div class="panel"><h3 style="color:${colors[i]}">${names[i]}</h3><p>Average temperature: ${av("temp")} °C<br>Average water: ${av("water")}%<br>Average radiation: ${av("rad")}<br>AI formed this group without using known class labels.</p></div>`}).join("");
 if(chart)chart.destroy();chart=new Chart($("clusterChart"),{type:"scatter",data:{datasets:groups.map((g,i)=>({label:names[i],data:g.map(p=>({x:p.temp,y:p.water,r:p.rad,n:p.name})),backgroundColor:colors[i],borderColor:colors[i],pointRadius:7,pointHoverRadius:10}))},options:{responsive:true,maintainAspectRatio:false,animation:{duration:1100},plugins:{legend:{labels:{color:"#71849d",font:{size:9}}},tooltip:{callbacks:{label:c=>`${c.raw.n}: ${c.raw.x}°C / water ${c.raw.y}%`}}},scales:{x:{title:{display:true,text:"TEMPERATURE °C",color:"#52677f"},ticks:{color:"#52677f"},grid:{color:"#142137"}},y:{title:{display:true,text:"WATER %",color:"#52677f"},ticks:{color:"#52677f"},grid:{color:"#142137"}}}}});renderTable()}
$("clusterBtn").onclick=()=>{runKmeans();toast("✓ K-Means discovered 4 clusters")}

function renderTable(){let groups=kmeansData(),names=clusterNames(groups),q=($("search").value||"").toLowerCase();$("dataRows").innerHTML=planets.filter(p=>p.name.toLowerCase().includes(q)).map(p=>`<tr><td>${p.name}</td><td><span class="classPill">${p.cls}</span></td><td>${p.temp} °C</td><td>${p.gravity} g</td><td>${p.water}%</td><td>${p.atmo}%</td><td>${p.rad}</td><td>${names[p.cluster]}</td></tr>`).join("")}
$("search").oninput=renderTable;

const canvas=$("stars"),ctx=canvas.getContext("2d");let stars=[];
function resize(){canvas.width=innerWidth;canvas.height=innerHeight;stars=Array.from({length:Math.floor(innerWidth*innerHeight/9000)},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.2+.2,a:Math.random()*.6+.2,s:Math.random()*.12+.03}))}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);for(let s of stars){s.a+=s.s*.03;if(s.a>.85||s.a<.15)s.s*=-1;ctx.fillStyle=`rgba(180,215,255,${s.a})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(draw)}
addEventListener("resize",resize);resize();draw();updateMemory();renderTable();