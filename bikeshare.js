let creds = importModule("creds")


let enableWalkTimes = true

if (config.runsInWidget) {
	enableWalkTimes = false
}


function distanceCrow(latFrom, longFrom, latTo, longTo) {
	const R = 6371e3; // metres
	const φ1 = latFrom * Math.PI/180; // φ, λ in radians
	const φ2 = latTo * Math.PI/180;
	const Δφ = (latTo-latFrom) * Math.PI/180;
	const Δλ = (longTo-longFrom) * Math.PI/180;

	const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	          Math.cos(φ1) * Math.cos(φ2) *
	          Math.sin(Δλ/2) * Math.sin(Δλ/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	const d = R * c; // in metres
	return Math.round(d);
};


async function boltVehicles(lat, lon) {

	const headers = {
		"host": "node.bolt.eu",
		"cache-control": "no-cache",
		"connection": "keep-alive",
		"accept": "*/*",
		"user-agent": "Bolt/80052652 CFNetwork/1333.0.4 Darwin/21.5.0",
		"accept-language": "en-GB,en;q=0.9",
		"authorization": "Basic " + creds.bolt,
		"accept-encoding": "gzip, deflate, br"
	};


	const url = `https://node.bolt.eu/rental-search/categoriesOverview?country=sk&gps_lat=${lat}&gps_lng=${lon}&device_os_version=iOS15.5&deviceId=60E3650B-071D-4DDA-AB99-EA22285B8F63&select_all=true&deviceType=iphone&lat=${lat}&language=en-GB&lng=${lon}&payment_method_id=PML6JXBPJ9C29X42&device_name=iPhone14,4&session_id=34730400u1656838818&version=CI.59.0&user_id=34730400&payment_method_type=adyen`;


	const req = new Request(url);
	req.headers = headers;

	const resp = await req.loadJSON();


	const vehicles = resp["data"]["categories"].flatMap(cat => cat["vehicles"]);
	const distances = vehicles.map(v => ({"v": v, "dist": distanceCrow(lat, lon, v["lat"], v["lng"])})) ;

	distances.sort((a,b) => a["dist"] > b["dist"])
	return distances;
}


async function nextBikeVehicles(lat, lon) {

	const headers = {
		"host": "api.nextbike.net",
		"connection": "keep-alive",
		"accept": "*/*",
		"user-agent": "Nextbike/4.8.10 (net.nextbike.official2012; build:228; iOS 15.5.0) Alamofire/4.8.10",
		"accept-language": "en-SK;q=1.0",
		"accept-encoding": "gzip;q=1.0, compress;q=0.5"
	};


	const url = `https://api.nextbike.net/maps/nextbike-live.xml?apikey=${creds.nextbike}&city=660&include_domains=te&response_type=xml&show_errors=1`;

	console.log(url);


	const req = new Request(url);
	req.headers = headers;


	const vehicles = []
	
	const resp = await req.loadString();
	const parser = new XMLParser(resp)

	parser.didStartElement = (nodeName, params) => {
		if (nodeName == 'place' && params['bikes'] > 0 && params['bikes_available_to_rent'] > 0) {
			vehicles.push(params)
		}
	}

	parser.parse()
	const distances = vehicles.map(v => ({"v": v, "dist": distanceCrow(lat, lon, v["lat"], v["lng"])}));
	distances.sort((a,b) => a["dist"] > b["dist"])
	return distances
}


async function rekolaVehicles(lat, lon) {
	const headers = {
		"host":"mobile.rekola.cz",
		"accept":"*/*",
		"screen-ppi":"326",
		"x-device-name":"iPhone14,4",
		"x-lock-device-version":"6",
		"accept-encoding":"gzip",
		"x-api-key": creds.rekola,
		"x-api-version":"6",
		"accept-language":"en-SK;q=1.0",
		"screen-width":"1080.0",
		"x-last-request-hash":"0",
		"x-device-id":creds.rekolaDeviceId,
		"screen-height":"2340.0",
		"user-agent":"Rekola/7.4.2 (cz.clevis.rekola; build:1226; iOS 15.5.0) Alamofire/5.5.0",
		"connection":"keep-alive",
		"x-client":"ios 7.4.2 (1226)",
		"x-client-os":"iOS 15.5"
	};


	const url = `https://mobile.rekola.cz/api/mobile/regions/2/trackables?gpsAcc=10&gpsLat=${lat}&gpsLng=${lon}&mapLat=${lat}&mapLng=${lon}&mapZoom=15`;

	console.log(url);


	const req = new Request(url);
	req.headers = headers;


	
	const resp = await req.loadJSON();
	const vehicles = resp["racks"].flatMap(x => x["vehicles"]).concat(resp["vehicles"])


	const distances = vehicles.map(v => ({"v": v, "dist": distanceCrow(lat, lon, v["position"]["lat"], v["position"]["lng"])}));
	distances.sort((a,b) => a["dist"] > b["dist"])
	return distances	
}



async function createWidget(distancesBolt, distancesNextBike, distancesRekola) {
	const bgColor = new Color("#222222")
	let listwidget = new ListWidget();	
	listwidget.spacing = 2
	const date = new Date()

	if (enableWalkTimes) {
		const [boltRealDist,boltWalkTime] = (await getTripInfo(distancesBolt[0]["v"]["lat"], distancesBolt[0]["v"]["lng"]))["result"].split("|")
		const [rekolaRealDist,rekolaWalkTime] = (await getTripInfo(distancesRekola[0]["v"]["position"]["lat"], distancesRekola[0]["v"]["position"]["lng"]))["result"].split("|")
		const [nbRealDist,nbWalkTime] = (await getTripInfo(distancesNextBike[0]["v"]["lat"], distancesNextBike[0]["v"]["lng"]))["result"].split("|")

		console.log(boltRealDist)
		console.log(boltWalkTime)

		const t1 = listwidget.addText(`Bolt: ${boltRealDist} / ${boltWalkTime}`)
		const t2 = listwidget.addText(`NextBike: ${nbRealDist} / ${nbWalkTime}`)
		const t3 = listwidget.addText(`Rekola: ${rekolaRealDist} / ${rekolaWalkTime}`)
		const t4 = listwidget.addText(`Updated: ${date.getHours()}:${date.getMinutes()}`)
		}
	else {

		const t1 = listwidget.addText(`Bolt: ${distancesBolt[0]["dist"]}m`)
		const t2 = listwidget.addText(`NextBike: ${distancesNextBike[0]["dist"]}m`)
		const t3 = listwidget.addText(`Rekola: ${distancesRekola[0]["dist"]}m`)
		const t4 = listwidget.addText(`Updated: ${date.getHours()}:${date.getMinutes()}`)
		const t5 = listwidget.addDate(date)
		t5.applyRelativeStyle()

	}

	// Return the created widget
	return listwidget;
}


async function getTripInfo(lat, lon) {
	const SHORTCUTNAME = "wt";
	const XCBURL =  "shortcuts://x-callback-url/run-shortcut"
	let cb = new CallbackURL(XCBURL);
	cb.addParameter("name", SHORTCUTNAME);
	cb.addParameter("input", `${lat},${lon}`);
	return await cb.open();
}


Location.setAccuracyToTenMeters();
const loc = await Location.current();
const distancesNextBike = await nextBikeVehicles(loc['latitude'], loc['longitude'])
const distancesBolt = await boltVehicles(loc['latitude'], loc['longitude'])
const distancesRekola = await rekolaVehicles(loc['latitude'], loc['longitude'])


const widget = await createWidget(distancesBolt, distancesNextBike, distancesRekola)


if (config.runsInWidget) {
	Script.setWidget(widget);
}
else {
	console.log(distancesBolt[0])
	console.log(distancesNextBike[0])
	widget.presentSmall()
	// App.close()
}

Script.complete()



