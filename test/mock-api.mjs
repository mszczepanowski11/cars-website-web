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

/** Odczytuje pageSize z ciala zadania - atrapa musi oddawac tyle, ile kod prosi. */
function odczytajCialo(req) {
  return new Promise(res => {
    let buf = ''
    req.on('data', c => { buf += c })
    req.on('end', () => { try { res(JSON.parse(buf || '{}')) } catch { res({}) } })
  })
}

http.createServer(async (req,res)=>{
  res.setHeader('content-type','application/json; charset=utf-8')
  const u=req.url||''
  const send=(o)=>res.end(JSON.stringify(o))
  // Proxy aplikacji przepisuje `api/listings/*` na `api/Advert/*` (zeby reguly blokad
  // reklam nie ucinaly zapytan po slowie "advert" w adresie), wiec atrapa musi
  // rozpoznawac OBIE postacie - inaczej test sprawdza pusta liste zamiast kart ogloszen.
  if (/\/(listings|Advert)\/search/.test(u)) {
    // Wczesniej atrapa zwracala zawsze 12 pozycji, ignorujac `pageSize`. Strona glowna
    // prosi o 4 na kategorie, wiec strona testowa byla trzy razy wieksza od prawdziwej
    // (49 000 px, 216 kart) i generowala skoki ukladu, ktorych w rzeczywistosci nie ma.
    // Test ma odwzorowywac produkcje, inaczej mierzy sam siebie.
    const body = await odczytajCialo(req)
    const n = Math.min(Math.max(Number(body.pageSize) || 12, 1), 48)
    return send({items:items(n),totalCount:1847,total:1847,page:Number(body.page)||1,pageSize:n})
  }
  if (/\/(listings|Advert)\/(most-viewed|premium-collection|featured)/.test(u)) return send(items(8))
  if (/\/(listings|Advert)\/\d+/.test(u)) return send(mk(3))
  if (/\/Advert\?/.test(u)) return send({items:items(12),totalCount:1847})
  if (/\/Taxonomy\/categories|\/api\/Category(\?|$)/.test(u)) return send(cats)
  // Kolejnosc ma znaczenie: `/Taxonomy/brands/{id}/models` zaczyna sie tak samo jak
  // `/Taxonomy/brands`, wiec modele musza byc sprawdzane PIERWSZE - inaczej lista modeli
  // zwracalaby marki i strony /kategorie/marka/model dawalyby 404.
  if (/\/Taxonomy\/brands\/\d+\/models/.test(u)) return send(BR.map(([,m],i)=>({id:i+1,name:m,slug:m.toLowerCase()})))
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
  // Profil firmy i profil sprzedawcy. Wczesniej atrapa oddawala na katalog firm pusta
  // liste, wiec `/firmy/{slug}` i `/seller/{id}` w ogole nie renderowaly tresci - a to
  // wlasnie te dwie strony przechodza teraz na wspolna karte. Test, ktory ich nie
  // otwiera, nie potwierdzi niczego o tej zmianie.
  if (/\/directory\/[^/]+\/listings/.test(u)) return send({items:items(6),total:6,linked:true})
  if (/\/directory\/[^/]+/.test(u)) return send({
    id:1, slug:'auto-serwis-kowalski', name:'Auto Serwis Kowalski', city:'Warszawa',
    description:'Autoryzowany serwis i komis samochodowy dzialajacy od 1998 roku.',
    phone:'+48 500 100 200', email:'kontakt@example.com', website:'https://example.com',
    address:'ul. Przykladowa 12', postalCode:'00-001', nip:'1234567890',
    isVerified:true, isPremium:true, logoUrl:null, categories:['Komis','Serwis'],
    branches:[{id:1,name:'Oddzial Mokotow',city:'Warszawa',address:'ul. Pulawska 100'}],
    openingHours:null, listingsCount:6,
  })
  if (/\/User\/\d+\/public/.test(u)) return send({
    id:5, firstName:'Jan', lastName:'Kowalski', accountType:'Business', companyName:'Auto Serwis Kowalski',
    city:'Warszawa', isVerified:true, isDealer:true, createdAt:'2021-04-02T10:00:00Z',
    about:'Sprzedaje samochody sprawdzone i serwisowane.', avatarUrl:null,
  })
  if (/\/User\/\d+\/stats/.test(u)) return send({
    activeAdverts:6, soldAdverts:41, averageRating:4.8, reviewsCount:23, followersCount:88,
  })
  if (/\/reviews/.test(u)) return send({items:[
    {id:1,buyerName:'Anna N.',rating:5,content:'Wszystko zgodne z opisem, polecam.',createdAt:'2026-08-01T12:00:00Z',isVerifiedPurchase:true},
    {id:2,buyerName:'Piotr W.',rating:4,content:'Sprawny kontakt.',createdAt:'2026-07-14T09:30:00Z',isVerifiedPurchase:false},
  ],totalCount:2})
  if (/\/Company|\/companies|\/directory/.test(u)) return send({items:[],totalCount:0})
  if (/unread-count/.test(u)) return send({count:0})
  send([])
}).listen(4999)
