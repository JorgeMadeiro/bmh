// Recheque de GEO da BMH (ChatGPT com busca, API da OpenAI). Mesmas perguntas de 15/10/2026. Uso: node --env-file=.env marketing/seo/geo/rodar-chatgpt.js
// Custo: 25 chamadas com busca na web (cobradas pela OpenAI). Não envia dado de paciente. Nunca imprime a chave.
const fs=require('fs');
const P=JSON.parse(fs.readFileSync(__dirname+"/20261015-perguntas.json",'utf8'));
const BMH=/\bBMH\b|Bras[ií]lia Medicina Hiperb[aá]rica|hiperbaricabrasilia/i;
(async()=>{
 const res=[];
 for(const [q,tipo,pub] of P){
  let tent=0, j, ok=false;
  while(tent<2&&!ok){ tent++;
   const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5.5',tools:[{type:'web_search',user_location:{type:'approximate',country:'BR',city:'Brasília',region:'Distrito Federal'}}],input:q})});
   j=await r.json(); ok=r.ok; if(!ok) console.error(q, j.error&&j.error.message);
  }
  let texto='',urls=[];
  for(const o of (j.output||[])) if(o.type==='message') for(const c of o.content||[]){ if(c.type==='output_text'){texto+=c.text; for(const a of c.annotations||[]) if(a.type==='url_citation') urls.push(a.url);} }
  const doms=[...new Set(urls.map(u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch{return u}}))];
  const citada=BMH.test(texto);
  const pos = citada ? (texto.slice(0, texto.search(BMH)).match(/\n\s*(\d+\.|[-*]|#{1,4})\s/g)||[]).length+1 : null;
  res.push({pergunta:q,tipo,publico:pub,ia:'ChatGPT (gpt-5.5 com busca, API)',data:new Date().toISOString().slice(0,10),bmh_citada:citada,posicao_aprox:pos,link_bmh:urls.some(u=>/hiperbaricabrasilia/.test(u)),dominios:doms,urls,texto});
  console.log((citada?'SIM':'nao'),'|',q,'|',doms.join(', '));
 }
 fs.writeFileSync(process.argv[2]||(__dirname+'/'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-chatgpt-respostas.json'),JSON.stringify(res,null,1));
})();
