let creds = importModule("creds")


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

	console.log(url);


	const req = new Request(url);
	req.headers = headers;

	console.log(req);

	const resp = await req.loadJSON();


	const vehicles = resp["data"]["categories"].flatMap(cat => cat["vehicles"]);
	const distances = vehicles.map(v => ({"v": v, "dist": distanceCrow(lat, lon, v["lat"], v["lng"])})) ;

	console.log(distances);

	return distances;
}


async function nextBikeVehicles() {

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
			vehicles.append(params)
		}
	}

	parser.parse()
	vehicles.map(v => ({"v": v, "dist": distanceCrow(v["lat"], v["lng"])}))
	return vehicles


}



Location.setAccuracyToTenMeters();
const loc = await Location.current();
// const distances = await boltVehicles(loc['latitude'], loc['longitude'])
const distances = await nextBikeVehicles()

console.log(distances)



