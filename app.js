const $=id=>document.getElementById(id);
const names={home:["БАСТЫ БЕТ","Дүкендегі роботты машиналық оқыту"],reinforce:["REINFORCEMENT","Оқыту арқылы үйрету"],semi:["SEMI-SUPERVISED","Жартылай оқыту"],compare:["САЛЫСТЫРУ","Оқыту тәсілдерін салыстыру"],theory:["ТЕОРИЯ","Машиналық оқыту принциптері"]};
document.querySelectorAll(".nav,.go").forEach(b=>b.onclick=()=>show(b.dataset.page));
function show(p){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));$(p).classList.add("active");document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===p));$("crumb").textContent=names[p][0];$("title").textContent=names[p][1];window.scrollTo(0,0)}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1800)}

let Q={milk:{fruit:0,bread:0,milk:0},bread:{fruit:0,bread:0,milk:0},apple:{fruit:0,bread:0,milk:0}}, attempts=0,correct=0,reward=0;
const right={milk:"milk",bread:"bread",apple:"fruit"}, label={milk:"СҮТ",bread:"НАН",apple:"АЛМА"};
$("rlProduct").onchange=()=>{$("held").textContent=label[$("rlProduct").value]};
document.querySelectorAll(".shelfBtn").forEach(b=>b.onclick=()=>act($("rlProduct").value,b.dataset.shelf,true));
function act(product,shelf,visual){
 attempts++; let ok=right[product]===shelf, r=ok?10:-5; reward+=r;if(ok)correct++;Q[product][shelf]+=0.35*(r+0.8*Math.max(...Object.values(Q[product]))-Q[product][shelf]);
 if(visual){$("rlState").textContent=ok?"Дұрыс әрекет: +10 сыйақы":"Қате әрекет: -5 жаза";$("rlTerminal").innerHTML=`<p>› state: holding ${product}</p><p>› action: place on ${shelf} shelf</p><p>› reward: ${r>0?"+":""}${r}</p><p>› policy updated ✓</p>`}
 updateRL()
}
function updateRL(){let acc=attempts?Math.round(correct/attempts*100):0;$("reward").textContent=reward;$("attempts").textContent=attempts;$("correct").textContent=correct;$("rlPercent").textContent=acc+"%";$("rlBar").style.width=acc+"%";$("homeScore").textContent=reward;$("memSide").textContent=attempts+" тәжірибе"}
$("autoTrain").onclick=()=>{let ps=["milk","bread","apple"],ss=["fruit","bread","milk"];for(let i=0;i<20;i++){let p=ps[Math.floor(Math.random()*3)], explore=Math.random()<Math.max(.12,.7-attempts*.012),s;if(explore)s=ss[Math.floor(Math.random()*3)];else{s=Object.entries(Q[p]).sort((a,b)=>b[1]-a[1])[0][0];if(Object.values(Q[p]).every(v=>v===0))s=ss[Math.floor(Math.random()*3)]}act(p,s,false)}$("rlState").textContent="20 тәжірибе аяқталды";$("rlTerminal").innerHTML=`<p>› auto-training: 20 episodes complete</p><p>› robot explored shelves and received feedback</p><p>› action values updated from experience</p>`;toast("Робот 20 жаңа тәжірибеден үйренді")}

const unknowns={greenApple:{emoji:"🍏",name:"Жасыл алма",cls:"Жеміс",conf:94},baguette:{emoji:"🥖",name:"Багет",cls:"Нан өнімдері",conf:91},yogurt:{emoji:"🥣",name:"Йогурт",cls:"Сүт өнімі",conf:89}};
$("analyze").onclick=()=>{let x=unknowns[$("unknown").value];$("scanEmoji").textContent=x.emoji;$("semiResult").textContent=x.cls;$("semiText").textContent=`AI ${x.name} объектісін белгіленген мысалдарға ұқсастығы бойынша анықтады.`;$("confText").textContent=x.conf+"%";$("semiConf").textContent=x.conf+"%";$("confBar").style.width=x.conf+"%";toast("AI белгіленбеген тауарға pseudo-label ұсынды")};
