const STORAGE_KEY="daftra_connection";
export function getConnection(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{}}catch{return {}}}
export function saveConnection(value){localStorage.setItem(STORAGE_KEY,JSON.stringify(value))}
export function clearConnection(){localStorage.removeItem(STORAGE_KEY)}
export function authHeader(connection=getConnection()){if(!connection.apiKey||!connection.apiSecret)return "";return `token ${connection.apiKey}:${connection.apiSecret}`}
export async function call(method,{mutation=false,args={}}={}){const authorization=authHeader();if(!authorization)throw new Error("Connect your Frappe account first");const response=await fetch(`/api/frappe?method=${encodeURIComponent(method)}`,{method:mutation?"POST":"GET",headers:{Authorization:authorization,"Content-Type":"application/json"},body:mutation?JSON.stringify(args):undefined});const data=await response.json();if(!response.ok||data.exc)throw new Error(data.message||data.exception||"Request failed");return data.message??data}
export function deskUrl(doctype,name=""){const connection=getConnection();const base=(connection.backendUrl||"https://daftra.galaxylabs.online").replace(/\/$/,"");const slug=doctype.toLowerCase().replaceAll(" ","-");return `${base}/app/${slug}${name?`/${name}`:"/view/list"}`}
