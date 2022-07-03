let creds = importModule("creds")

let x = 5


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


let url = new URL("https://node.bolt.eu/rental-search/categoriesOverview")
url.searchParams.set("country", "sk")
url.searchParams.set("gps_lat", "49.20053758427728")
url.searchParams.set("gps_lng", "16.595202877658718")
url.searchParams.set("device_os_version", "iOS15.5")
url.searchParams.set("deviceId", "60E3650B-071D-4DDA-AB99-EA22285B8F63")
url.searchParams.set("select_all", "true")
url.searchParams.set("deviceType", "iphone")
url.searchParams.set("lat", "49.20053769305785")
url.searchParams.set("language", "en-GB")
url.searchParams.set("lng", "16.595203019678593")
url.searchParams.set("payment_method_id", "PML6JXBPJ9C29X42")
url.searchParams.set("device_name", "iPhone14,4")
url.searchParams.set("session_id", "34730400u1656838818")
url.searchParams.set("version", "CI.59.0")
url.searchParams.set("user_id", "34730400")
url.searchParams.set("payment_method_type", "adyen")

cosnole.log(url.toString())


let req = new Request(url.toString())
req.headers = headers

cosnole.log(req)

let resp = await req.loadJJSON()
console.log(resp)