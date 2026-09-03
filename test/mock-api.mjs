/**
 * Atrapa API na potrzeby testu dymnego.
 *
 * Test sprawdza WŁASNY kod frontendu — czy strony się renderują i mieszczą w ekranie —
 * a nie dostępność backendu. Atrapa zwraca dane w tym samym kształcie co produkcyjne
 * API, dzięki czemu test jest powtarzalny, szybki i nie wymaga żadnych sekretów.
 *
 * Ścieżki odpowiadają temu, co realnie wywołuje proxy aplikacji — m.in. `/api/Advert/{id}`,
 * bo proxy przepisuje na nie `/api/listings/{id}`.
 */
import http from 'node:http'
const cats = [
  ['Auta osobowe','osobowe','mdi-car',60],['Dostawcze','dostawcze','mdi-truck-delivery-outline',4],
  ['Ciężarowe','ciezarowe','mdi-truck-outline',0],['Maszyny','budowlane','mdi-excavator',0],
  ['Części','czesci','mdi-cog-outline',0],['Motocykle','motocykle','mdi-motorbike',0],
  ['Przyczepy','przyczepy','mdi-truck-trailer',0],['Rolnicze','rolnicze','mdi-tractor',0],
  ['Łodzie i jachty','lodzie','mdi-sail-boat',0],['Kampery','kampery','mdi-rv-truck',0],
  ['Quady i ATV','quady','mdi-atv',0],['Autobusy','autobusy','mdi-bus',0],
  ['Naczepy','naczepy','mdi-truck-trailer',0],['Wózki widłowe','wozki-widlowe','mdi-forklift',0],
  ['Opony','opony','mdi-tire',0],['Felgi','felgi','mdi-circle-outline',0],
  ['Akcesoria','akcesoria','mdi-package-variant-closed',0],['Usługi motoryzacyjne','uslugi','mdi-car-wrench',0],
].map(([name,slug,iconName,advertCount],i)=>({id:i+1,name,slug,iconName,advertCount}))

const BR=[['Audi','Q5'],['BMW','X3'],['Mercedes-Benz','GLC'],['Volkswagen','Passat'],['Toyota','RAV4'],['Ford','Kuga']]
const mk=(i)=>{const[b,m]=BR[i%BR.length];return{
 id:1000+i,userId:5,title:`${b} ${m} 2.0 TDI quattro S-Line Salon Polska pierwszy właściciel`,
 description:'Bardzo zadbany egzemplarz, serwisowany w ASO.',
 price:89000+i*7300, year:2018+(i%6), mileage:45000+i*11000,
 city:['Warszawa','Kraków','Gdańsk','Poznań'][i%4], region:'mazowieckie',
 brand:{id:i%6+1,name:b}, model:{id:i%6+1,name:m}, generation:null, engineVersion:null,
 fuelType:{id:2,name:'Diesel'}, gearbox:{id:1,name:'Automatyczna'}, bodyType:{id:3,name:'SUV'},
 category:{id:1,name:'Auta osobowe',slug:'osobowe'}, categoryId:1,
 features:[], images:[{id:i,url:'/hero-car.jpg',isMain:true}],
 createdAt:new Date(Date.now()-i*86400000).toISOString(),
 powerHP:190, engineSize:1968, condition:'used', sellerType:i%3?'private':'dealer',
 isVerified:i%2===0, viewCount:40+i*13, favoriteCount:i, priceEur:Math.round((89000+i*7300)/4.3),
}}
const items=(n)=>Array.from({length:n},(_,i)=>mk(i))

http.createServer((req,res)=>{
  res.setHeader('content-type','application/json; charset=utf-8')
  const u=req.url||''
  const send=(o)=>res.end(JSON.stringify(o))
  // Proxy aplikacji przepisuje `api/listings/*` na `api/Advert/*` (zeby reguly blokad
  // reklam nie ucinaly zapytan po slowie "advert" w adresie), wiec atrapa musi
  // rozpoznawac OBIE postacie - inaczej test sprawdza pusta liste zamiast kart ogloszen.
  if (/\/(listings|Advert)\/search/.test(u)) return send({items:items(12),totalCount:1847,total:1847,page:1,pageSize:12})
  if (/\/(listings|Advert)\/(most-viewed|premium-collection|featured)/.test(u)) return send(items(8))
  if (/\/(listings|Advert)\/\d+/.test(u)) return send(mk(3))
  if (/\/Advert\?/.test(u)) return send({items:items(12),totalCount:1847})
  if (/\/Taxonomy\/categories|\/api\/Category(\?|$)/.test(u)) return send(cats)
  if (/\/Taxonomy\/brands/.test(u)) return send(BR.map(([b],i)=>({id:i+1,name:b,slug:b.toLowerCase()})))
  if (/\/Taxonomy\/models/.test(u)) return send(BR.map(([,m],i)=>({id:i+1,name:m,slug:m.toLowerCase()})))
  if (/\/Taxonomy\/fuel/.test(u)) return send(['Benzyna','Diesel','LPG','Hybryda','Elektryczny'].map((name,i)=>({id:i+1,name})))
  if (/\/Taxonomy\/gearboxes/.test(u)) return send(['Manualna','Automatyczna'].map((name,i)=>({id:i+1,name})))
  if (/\/Taxonomy\/bodytypes/.test(u)) return send(['Sedan','Kombi','SUV','Hatchback'].map((name,i)=>({id:i+1,name})))
  if (/\/Taxonomy\/drive-types/.test(u)) return send(['Na przednie koła','4x4'].map((name,i)=>({id:i+1,name})))
  if (/\/Taxonomy\/colors/.test(u)) return send(['Czarny','Biały','Srebrny'].map((name,i)=>({id:i+1,name,hex:'#222'})))
  if (/\/stats\/home/.test(u)) return send({activeAdverts:1847,totalUsers:920,soldVehicles:310,events:12})
  if (/\/geo\/countries/.test(u)) return send([{id:1,name:'Polska',code:'PL'}])
  if (/\/geo\/regions/.test(u)) return send(['mazowieckie','małopolskie','pomorskie'].map((name,i)=>({id:i+1,name})))
  if (/\/Company|\/companies/.test(u)) return send({items:[],totalCount:0})
  if (/unread-count/.test(u)) return send({count:0})
  send([])
}).listen(4999)
