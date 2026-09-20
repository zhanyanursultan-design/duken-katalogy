const products=[
{name:"Смартфон Nova X",category:"Электроника",price:189000,rating:4.8,sales:520},
{name:"Ноутбук Air 14",category:"Электроника",price:399000,rating:4.7,sales:180},
{name:"Bluetooth құлаққап",category:"Электроника",price:24900,rating:4.6,sales:740},
{name:"Смарт сағат Fit Pro",category:"Электроника",price:59000,rating:4.5,sales:410},
{name:"4K теледидар 55",category:"Электроника",price:329000,rating:4.8,sales:120},
{name:"Ерлер футболкасы",category:"Киім",price:8900,rating:4.4,sales:680},
{name:"Қысқы күртеше",category:"Киім",price:44900,rating:4.7,sales:310},
{name:"Кроссовка Urban",category:"Киім",price:38900,rating:4.6,sales:450},
{name:"Джинсы Classic",category:"Киім",price:19900,rating:4.3,sales:370},
{name:"Худи Basic",category:"Киім",price:16900,rating:4.5,sales:560},
{name:"Кофе машинасы",category:"Үйге арналған",price:149000,rating:4.8,sales:160},
{name:"Шаңсорғыш",category:"Үйге арналған",price:89000,rating:4.6,sales:280},
{name:"Үстел шамы",category:"Үйге арналған",price:12900,rating:4.5,sales:490},
{name:"Ауа ылғалдатқыш",category:"Үйге арналған",price:27900,rating:4.4,sales:390},
{name:"Ас үй таразысы",category:"Үйге арналған",price:7900,rating:4.7,sales:610},
{name:"Кофе 1 кг",category:"Азық-түлік",price:6900,rating:4.9,sales:920},
{name:"Шоколад жинағы",category:"Азық-түлік",price:4500,rating:4.7,sales:840},
{name:"Зәйтүн майы",category:"Азық-түлік",price:5900,rating:4.6,sales:570},
{name:"Жаңғақ қоспасы",category:"Азық-түлік",price:3900,rating:4.8,sales:760},
{name:"Бал 500 г",category:"Азық-түлік",price:4200,rating:4.9,sales:690}
];
let charts={};
const titles={dashboard:["Басқару панелі","Дүкен деректерін интеллектуалды талдау жүйесі"],catalog:["Тауарлар каталогы","Оқу деректерінің құрылымы"],classification:["Классификация","KNN арқылы категорияны анықтау"],clustering:["Кластеризация","K-Means арқылы тауар сегменттерін анықтау"],analytics:["Аналитика","Негізгі бизнес көрсеткіштері"],about:["Жоба туралы","Ғылыми және практикалық сипаттама"]};
document.querySelectorAll(".nav,.jump").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
function showPage(id){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));document.getElementById(id).classList.add("active");document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===id));pageTitle.textContent=titles[id][0];pageSub.textContent=titles[id][1];if(id==="analytics")renderAnalytics();if(id==="clustering")renderCluster();}
function cats(){return [...new Set(products.map(p=>p.category))]}
function updateStats(){statProducts.textContent=products.length;statCategories.textContent=cats().length;statRating.textContent=(products.reduce((a,p)=>a+p.rating,0)/products.length).toFixed(1)}
function fillSelects(){const opts=cats().map(c=>`<option>${c}</option>`).join("");categoryFilter.innerHTML='<option value="">Барлық категория</option>'+opts;mCategory.innerHTML=opts}
function normalize(data){let keys=["price","rating","sales"];let mins={},maxs={};keys.forEach(k=>{mins[k]=Math.min(...data.map(x=>x[k]));maxs[k]=Math.max(...data.map(x=>x[k]))});return data.map(x=>keys.map(k=>(x[k]-mins[k])/((maxs[k]-mins[k])||1)))}
function kmeans(k=3){const pts=normalize(products);let centers=[pts[0].slice(),pts[Math.floor(pts.length/2)].slice(),pts[pts.length-1].slice()],assign=[];for(let it=0;it<30;it++){assign=pts.map(p=>{let ds=centers.map(c=>Math.sqrt(p.reduce((s,v,j)=>s+(v-c[j])**2,0)));return ds.indexOf(Math.min(...ds))});let next=centers.map((c,ci)=>{let group=pts.filter((_,i)=>assign[i]===ci);return group.length?c.map((_,j)=>group.reduce((s,p)=>s+p[j],0)/group.length):c});if(JSON.stringify(next)===JSON.stringify(centers))break;centers=next}products.forEach((p,i)=>p.cluster=assign[i]);return assign}
function clusterNames(){let arr=[0,1,2].map(i=>{let g=products.filter(p=>p.cluster===i);return {i,avgPrice:g.reduce((s,p)=>s+p.price,0)/(g.length||1),avgSales:g.reduce((s,p)=>s+p.sales,0)/(g.length||1)}});let highSales=[...arr].sort((a,b)=>b.avgSales-a.avgSales)[0].i;let premium=[...arr].filter(x=>x.i!==highSales).sort((a,b)=>b.avgPrice-a.avgPrice)[0].i;let names={};names[highSales]="Жоғары сұраныс";names[premium]="Премиум сегмент";arr.forEach(x=>{if(!names[x.i])names[x.i]="Орташа сегмент"});return names}
function renderTable(){kmeans();let q=search.value.toLowerCase(),cf=categoryFilter.value,names=clusterNames();productRows.innerHTML=products.filter(p=>(!q||p.name.toLowerCase().includes(q))&&(!cf||p.category===cf)).map(p=>`<tr><td><b>${p.name}</b></td><td><span class="badge">${p.category}</span></td><td>${p.price.toLocaleString()} ₸</td><td>★ ${p.rating}</td><td>${p.sales}</td><td><span class="cluster-badge">${names[p.cluster]}</span></td></tr>`).join("")}
search.oninput=renderTable;categoryFilter.onchange=renderTable;
function makeChart(id,type,data,options={}){if(charts[id])charts[id].destroy();charts[id]=new Chart(document.getElementById(id),{type,data,options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:type==="doughnut"}},scales:type==="doughnut"?{}:{x:{grid:{display:false}},y:{grid:{color:"#eef1f5"}}},...options}})}
function renderDashboard(){let labels=cats(),vals=labels.map(c=>products.filter(p=>p.category===c).length);makeChart("categoryChart","doughnut",{labels,datasets:[{data:vals,backgroundColor:["#536df5","#18a989","#e19a3b","#9b65d5"],borderWidth:0}]})}
function renderAnalytics(){let labels=cats();makeChart("priceChart","bar",{labels,datasets:[{label:"Орташа баға",data:labels.map(c=>{let g=products.filter(p=>p.category===c);return Math.round(g.reduce((s,p)=>s+p.price,0)/g.length)}),backgroundColor:"#6178f4",borderRadius:6}]});makeChart("salesChart","bar",{labels,datasets:[{label:"Сатылым",data:labels.map(c=>products.filter(p=>p.category===c).reduce((s,p)=>s+p.sales,0)),backgroundColor:"#18a989",borderRadius:6}]})}
function classify(){let target={price:+cPrice.value,rating:+cRating.value,sales:+cSales.value};let all=[...products,target],norm=normalize(all),t=norm[norm.length-1];let ds=products.map((p,i)=>({p,d:Math.sqrt(norm[i].reduce((s,v,j)=>s+(v-t[j])**2,0))})).sort((a,b)=>a.d-b.d).slice(0,5);let votes={};ds.forEach(x=>votes[x.p.category]=(votes[x.p.category]||0)+1);let result=Object.entries(votes).sort((a,b)=>b[1]-a[1])[0];classResult.textContent=result[0];classConfidence.textContent=`Сенімділік: ${Math.round(result[1]/5*100)}% • 5 ең жақын көрші негізінде`;neighborList.innerHTML=ds.map(x=>`<div class="neighbor"><span>${x.p.name}</span><b>${x.p.category}</b></div>`).join("")}
classifyBtn.onclick=classify;
function renderCluster(){kmeans();let names=clusterNames();for(let i=0;i<3;i++){let g=products.filter(p=>p.cluster===i);document.getElementById(`cl${i}name`).textContent=names[i];document.getElementById(`cl${i}count`).textContent=`${g.length} тауар`};let colors=["#526cf3","#18a989","#e19a3b"];makeChart("clusterChart","scatter",{datasets:[0,1,2].map(i=>({label:names[i],data:products.filter(p=>p.cluster===i).map(p=>({x:p.price,y:p.sales,label:p.name})),backgroundColor:colors[i],pointRadius:7,pointHoverRadius:9}))},{plugins:{legend:{display:true},tooltip:{callbacks:{label:c=>`${c.raw.label}: ${c.raw.x.toLocaleString()} ₸, ${c.raw.y} сатылым`}}},scales:{x:{title:{display:true,text:"Баға, ₸"}},y:{title:{display:true,text:"Сатылым саны"}}}});clusterDetails.innerHTML=[0,1,2].map(i=>{let g=products.filter(p=>p.cluster===i);let ap=Math.round(g.reduce((s,p)=>s+p.price,0)/(g.length||1)),as=Math.round(g.reduce((s,p)=>s+p.sales,0)/(g.length||1));return `<article class="panel cluster-detail"><h4>${names[i]}</h4><p>Орташа баға: <b>${ap.toLocaleString()} ₸</b></p><p>Орташа сатылым: <b>${as}</b></p><p>Объект саны: <b>${g.length}</b></p></article>`}).join("");renderTable()}
rerunCluster.onclick=renderCluster;
addDemo.onclick=()=>modal.classList.add("show");closeModal.onclick=()=>modal.classList.remove("show");modal.onclick=e=>{if(e.target===modal)modal.classList.remove("show")};
saveProduct.onclick=()=>{if(!mName.value.trim())return;products.push({name:mName.value.trim(),category:mCategory.value,price:+mPrice.value,rating:+mRating.value,sales:+mSales.value});modal.classList.remove("show");updateStats();fillSelects();renderTable();renderDashboard()};
updateStats();fillSelects();renderTable();renderDashboard();