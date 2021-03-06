// Holds the URL, the before and after fields.
// Before holds the id of the top link. It is used to fetch links above this link from reddit.
// After holds the id of the bottom most link.
var redditTracker = {jsonurl:"http://www.reddit.com/r/news+worldnews+truenews/new/.json"}

/*
 * Processes the older links data
 */
var getAfterLinks = function(json) {
	var links = json.data.children;
	var html = createHtmlFromLinks(links);
	redditTracker.after = json.data.after;
	$('#content').append(html);
};

/*
 * Handles new link data
 */
var getBeforeLinks = function(json) {
	var links = json.data.children;
	// Check if there are links. If there are links, then update the before field
	if(links[0] != null && redditTracker.before != links[0].data.name) {
		redditTracker.before = links[0].data.name;
		redditTracker.linksQueue = links.concat(redditTracker.linksQueue);
		//console.log(json.data);
		//console.log(redditTracker.linksQueue);
		if(redditTracker.linksQueue.length > 0) {
			// If the buttons are hidden, make them visible
			if($('.new-data').css('visibility') == 'hidden') {
				$('.new-data').css('visibility', 'visible');
			}
			// update the text in the buttons that exist already
			$('.new-data').prop('value', redditTracker.linksQueue.length + ' new data sets available');
		}
	}
}

$( document ).ready(function() {
	// Get the JSON with an ajax call
	$.getJSON(redditTracker.jsonurl + "?limit=10", function(json) {
		// This is the data
		var links = json.data.children;
		// Initialize the before field with this data
		redditTracker.before = links[0].data.name;
		redditTracker.currentTop10 = links;
		// Create HTML markup from the links data
		var html = createHtmlFromLinks(links);
		//console.log(json.data);
		//console.log(links);
		// Initialize the after field with this data
		redditTracker.after = json.data.after;
		// Append the HTML to the page.
		$('#content').append(html);
		// Clear the data in the queue
		redditTracker.linksQueue = new Array();
		// Create the buttons that will be used to display new data when it comes in
		var new_data = '<input type="button" class="new-data" value="' + redditTracker.linksQueue.length + ' new data sets available">'
		$('#top-holder').append(new_data);
		$('#bottom-holder').append(new_data);
		$('.new-data').css('visibility', 'hidden');
		// Event handler for the buttons
		$('.new-data').click(function() {
			var html = createHtmlFromLinks(redditTracker.linksQueue);
			$('#content').prepend(html);
			redditTracker.linksQueue = new Array();
			document.body.scrollTop = document.documentElement.scrollTop = 0;
			$('.new-data').css('visibility', 'hidden');
		});
	});
});

/*
 * Repeatedly checks for new data from the API
 */
setInterval(function() {
	var json10beforeurl = redditTracker.jsonurl + "?before=" + redditTracker.before + "&limit=100";
	$.getJSON(json10beforeurl, getBeforeLinks);
}, 7000);

/*
 * Creates HTML markup from the link information
 */
function createHtmlFromLinks(links) {
	var html = "";
	//console.log(links.length);
	for(var i = 0; i < links.length; ++i) {
		var link = links[i].data;
		//console.log(link.id);
		var title = link.title;
		var thumb = link.thumbnail;
		var url = "http://www.reddit.com"+link.permalink;
		var subreddit = link.subreddit;
		var time = link.created_utc;
		html += '<li class="link">\n';
		html += '<a href="'+url+'">'+title+'</a>';
		html += ' <span class="subreddit">(r/'+subreddit+')';
		html += ' <br><span class="time">date posted: ' + timeConverter(time) + '</span>';
		html += '</li>';
	}
	return html;
}

/*
 * Event handler for the button that is used for showing 10 more older links
 */
function morelinks() {
	var json10afterurl = redditTracker.jsonurl + "?after=" + redditTracker.after + "&limit=10";
	$.getJSON(json10afterurl, getAfterLinks);
}

/*
 * Taken from http://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
 * Converts the UNIX timestamp taken from the data into a readable date.
 */
function timeConverter(UNIX_timestamp){
 var a = new Date(UNIX_timestamp*1000);
 var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var year = a.getFullYear();
     var month = months[a.getMonth()];
     var date = a.getDate();
     var hour = a.getHours();
     var min = a.getMinutes();
     var sec = a.getSeconds();
     var time = month + " " + date + ", " + year + " " + hour + ":" + min + ":" + sec;
     return time;
 }