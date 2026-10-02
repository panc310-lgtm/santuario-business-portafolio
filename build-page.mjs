import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('./',import.meta.url);
const companies=JSON.parse(await readFile(new URL('empresas.json',root),'utf8'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraph=(className,text)=>text?`<p class="${className}">${esc(text)}</p>`:'';
const content=c=>paragraph('company-context',c.context)+paragraph('project-description',c.description)+paragraph('project-note',c.note);
const external=c=>`href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"`;
const indicators=className=>`<nav class="${className}" aria-label="Elegir empresa">${companies.map((c,i)=>`<button type="button" data-goto="${i}" aria-label="Ver ${esc(c.name)}" ${i===0?'aria-current="step"':''}><span aria-hidden="true"></span></button>`).join('')}</nav>`;
const cards=companies.map((c,i)=>`<article class="company-card" id="${c.id}" data-index="${i}" aria-labelledby="${c.id}-title" style="--layer:${i}">
<a class="card-link" ${external(c)} aria-label="${esc(c.name)}. Abrir en otra pestaña."><img src="${c.image}" alt="Tarjeta de ${esc(c.name)} con placa negra y borde cobrizo." width="1672" height="941" decoding="async" ${i===0?'fetchpriority="high"':''}></a>
<div class="company-content"><p class="company-number">0${i+1} / 04</p><h2 id="${c.id}-title">${esc(c.name)}</h2>${content(c)}<a class="company-link" ${external(c)} aria-label="${esc(c.linkLabel.replace(' ↗',''))}: ${esc(c.name)}. Abre en otra pestaña.">${esc(c.linkLabel)}</a></div></article>`).join('\n');
const first=companies[0];
const html=`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#08090B"><meta name="color-scheme" content="dark">
<title>Empresas con las que hemos trabajado · Santuario Business</title><meta name="description" content="Explora los proyectos de Santuario Business con Neutra Despertar, Open World Agency, HD Company y ErikaCell.">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="styles.css"><script src="portfolio.js" defer></script></head>
<body><a class="skip-link" href="#empresas">Ir a las empresas</a>
<main><section class="scroll-story" id="empresas" aria-label="Empresas con las que hemos trabajado"><div class="story-stage">
<header class="masthead"><a class="wordmark" href="#empresas">SANTUARIO <span>BUSINESS</span></a><span class="masthead-label">GALERÍA DE EMPRESAS</span></header>
<div class="showcase"><div class="introduction"><p class="eyebrow">EXPERIENCIA COMPARTIDA</p><h1>Empresas con las que hemos trabajado.</h1><p class="introduction-copy">Desplázate para explorar la colección.</p></div>
<div class="deck" aria-label="Colección de cuatro empresas">${cards}</div>
<section class="active-details" aria-label="Empresa destacada"><div id="active-copy" aria-live="polite" aria-atomic="true"><p class="company-number" id="active-number">01 / 04</p><h2 id="active-name">${esc(first.name)}</h2><div id="active-description">${content(first)}</div><a class="company-link" id="active-link" ${external(first)}>${esc(first.linkLabel)}</a></div>${indicators('segment-progress')}</section>
${indicators('vertical-progress')}</div><p class="scroll-cue"><span aria-hidden="true">↓</span> Desplázate para continuar</p>
</div></section></main>
<footer class="page-footer"><span>Santuario Business</span><span>Empresas · Proyectos · Colaboraciones</span></footer>
<script id="portfolio-data" type="application/json">${JSON.stringify(companies).replace(/</g,'\\u003c')}</script></body></html>`;
await writeFile(new URL('dist/index.html',root),html);
console.log('Página estática generada con cuatro empresas.');
