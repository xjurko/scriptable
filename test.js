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

let req = new Request("https://node.bolt.eu/rental-search/categoriesOverview");
req.headers = headers
req.addParameterToMultipart("country", "sk")
req.addParameterToMultipart("gps_lat", "49.20053758427728")
req.addParameterToMultipart("gps_lng", "16.595202877658718")
req.addParameterToMultipart("device_os_version", "iOS15.5")
req.addParameterToMultipart("deviceId", "60E3650B-071D-4DDA-AB99-EA22285B8F63")
req.addParameterToMultipart("select_all", "true")
req.addParameterToMultipart("deviceType", "iphone")
req.addParameterToMultipart("lat", "49.20053769305785")
req.addParameterToMultipart("language", "en-GB")
req.addParameterToMultipart("lng", "16.595203019678593")
req.addParameterToMultipart("payment_method_id", "PML6JXBPJ9C29X42")
req.addParameterToMultipart("device_name", "iPhone14,4")
req.addParameterToMultipart("session_id", "34730400u1656838818")
req.addParameterToMultipart("version", "CI.59.0")
req.addParameterToMultipart("user_id", "34730400")
req.addParameterToMultipart("payment_method_type", "adyen")