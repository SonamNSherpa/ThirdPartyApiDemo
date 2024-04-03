const fs = require('fs');
const http = require('http');
const https = require('https');

let response_data = [];
let index = 0;

const port = 3000;

const server = http.createServer();
server.on("request", request_handler);
server.on("listening", listen_handler);
server.listen(port);

function listen_handler(){
	console.log(`Now Listening on Port ${port}`);
}
function request_handler(req, res){
    console.log(req.url);
    if(req.url === "/"){
        const form = fs.createReadStream("html/index.html");
		res.writeHead(200, {"Content-Type": "text/html"})
		form.pipe(res);
    }
    else if(req.url.startsWith("/vaccines")){
        const user_input = new URL(req.url, `https://${req.headers.host}`).searchParams;
        console.log(user_input);
        const country = user_input.get('country');
        if(country == null || country == ""){
            res.writeHead(404, {"Content-Type": "text/html"});
            res.end("<h1>Missing Input</h1>");        
        }
        else{
            const covidData_api = https.request(`https://covid-api.mmediagroup.fr/v1/vaccines?country=${country}`);
            
            covidData_api.on("response" , covidData_api => process_stream(covidData_api, serve_data, res));
            covidData_api.end();
        }
    }
    else{
        res.writeHead(404, {"Content-Type": "text/html"}); 
        res.end("<h1>Not Found</h1>");    
    }
}

function process_stream (data_stream, serve_data, ...args){
	let collect_data = "";
	data_stream.on("data", chunk => collect_data += chunk);
	data_stream.on("end", () => serve_data(collect_data, ...args));
}

function serve_data(collected_data, res){
    let data = JSON.parse(collected_data);
    results = data;
    results = `<h1>Covid data.:</h1><ul>${results}</ul>`;
    console.log(data);
    new_Request(data, res);
    
} 
function new_Request(data, res){
     response_data[index] = data;
     index++;
   if (index == 1) {
    const cityData_api = https.request(`https://api.airvisual.com/v2/city?city=Kathmandu&state=Central+Region&country=Nepal&key=a6ddb1c4-397f-491e-a85b-c40660fe56e2`);
    cityData_api.on("response" , cityData_api => process_stream(cityData_api, serve_data, res));
    cityData_api.end();
    }
    if (index == 2){
        let results1 = response_data[0];
        let results2 = response_data[1];
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("Covid-19 Data" + "\n");
       res.write(JSON.stringify(results1));
       res.write("\n \n");
       res.write("Kathmandu City Data \n");
       res.write(JSON.stringify(results2) , () => res.end());
       response_data[0]=null;
       response_data[1]=null;
     index = 0;

    //   
    }
    
}


