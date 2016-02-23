var path = process.cwd();
var apikey = process.env.BING_KEY;
var bing = require('node-bing-api')({ accKey: apikey });

var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({ extended: false });

var history = [];

module.exports = function(app) {

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/html/index.html');
		});
	
	app.route('/imagesearch/:search')
	    .get(function (req, res) {
	        // search key words
	        var search = req.params.search;
	        // get variable
	        var offset = req.query.offset || 0;
	        // result array and push function
	        var resultArr = [];
            function pushArrayElements(element, index, array) {
              resultArr.push({
                  url: element.MediaUrl,
                  snippet: element.Title,
                  page: element.SourceUrl,
                  thumbnail: element.Thumbnail.MediaUrl
              });
            }
            // call api and return results
            bing.composite(search, {
                top: 10,  // Number of results (max 15 for news, max 50 if other) 
                skip: offset,   // Skip first 3 results 
                sources: "image", //Choices are web+image+video+news+spell 
                newsSortBy: "Relevance" //Choices are Date, Relevance 
              }, function(error, response, body){
                  body.d.results[0].Image.forEach(pushArrayElements);
                  res.json(resultArr);
                });
            // push the search to history
            history.unshift({
                term: search,
                when: new Date()
            });
            if (history.length > 10) {
                history.pop();
            }
	    });
	    
    app.route('/search_form')
        .post(parseUrlencoded, function(request, response){  
            var searchQuery = request.body.query;
            response.redirect('/imagesearch/' + searchQuery);
        });
        
    app.route('/latest')
        .get(function (req, res) {
            res.json(history);
        });
};