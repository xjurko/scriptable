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
	return Math.round(d)
}


function boltVehicles(lat, lon) {

	let headers = {
		"host": "node.bolt.eu",
		"cache-control": "no-cache",
		"connection": "keep-alive",
		"accept": "*/*",
		"user-agent": "Bolt/80052652 CFNetwork/1333.0.4 Darwin/21.5.0",
		"accept-language": "en-GB,en;q=0.9",
		"authorization": "Basic " + creds.bolt,
		"accept-encoding": "gzip, deflate, br"
	}


	let url = `https://node.bolt.eu/rental-search/categoriesOverview?country=sk&gps_lat=49.20053758427728&gps_lng=16.595202877658718&device_os_version=iOS15.5&deviceId=60E3650B-071D-4DDA-AB99-EA22285B8F63&select_all=true&deviceType=iphone&lat=49.20053769305785&language=en-GB&lng=16.595203019678593&payment_method_id=PML6JXBPJ9C29X42&device_name=iPhone14,4&session_id=34730400u1656838818&version=CI.59.0&user_id=34730400&payment_method_type=adyen`

	console.log(url)


	let req = new Request(url)
	req.headers = headers

	console.log(req)

	let resp = await req.loadJSON()

	let latFrom = 49.20053758427728
	let longfrom = 16.595202877658718

	let vehicles = resp["data"]["categories"].flatMap(cat => cat["vehicles"])
	let distances = vehicles.map(v => ({"v": v, "dist": distanceCrow(latFrom, longfrom, v["lat"], v["lng"])})) 

	console.log(distances)

	return distances
}


let loc = Location.current()
console.log(loc)



