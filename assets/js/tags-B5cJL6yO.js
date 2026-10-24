const o=a=>a.trim(),t=a=>o(a).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""),s=a=>`/tags/${encodeURIComponent(t(a))}`,g=(a,e)=>t(a)===e;export{g as a,t as b,s as t};
