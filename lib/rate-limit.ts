const bucket = new Map<string,{count:number;reset:number}>();
export function allow(key:string, limit=20, windowMs=60_000){const now=Date.now(),v=bucket.get(key);if(!v||v.reset<now){bucket.set(key,{count:1,reset:now+windowMs});return true}if(v.count>=limit)return false;v.count++;return true}
