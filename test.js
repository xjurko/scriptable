let creds = importModule("creds")

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

vehicles = resp["data"]["categories"].flatMap(cat => cat["vehicles"])

console.log(vehicles)